/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package cmd

import (
	"context"
	"crypto/tls"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/shiningrush/droplet"
	"github.com/spf13/cobra"

	"github.com/apisix/manager-api/internal"
	"github.com/apisix/manager-api/internal/conf"
	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/filter"
	"github.com/apisix/manager-api/internal/handler"
	"github.com/apisix/manager-api/internal/log"
	"github.com/apisix/manager-api/internal/utils"
)

var (
	configFile string
	forceStart bool
)

var rootCmd = &cobra.Command{
	Use:   "manager-api [flags]",
	Short: "Apache APISIX Manager API",
	RunE: func(cmd *cobra.Command, args []string) error {
		err := manageAPI()
		return err
	},
}

func init() {
	cobra.OnInitialize(func() {
		var err error
		service, err = createService()
		if err != nil {
			fmt.Fprintf(os.Stderr, "error occurred while initializing service: %s", err)
		}
	})

	rootCmd.PersistentFlags().StringVarP(&configFile, "config", "c", "./conf/conf.yml", "config file")
	rootCmd.PersistentFlags().StringVarP(&conf.WorkDir, "work-dir", "p", ".", "current work directory")
	rootCmd.PersistentFlags().BoolVarP(&forceStart, "force", "f", false, "force start manager-api")

	rootCmd.AddCommand(
		newVersionCommand(),
		newInstallCommand(),
		newRemoveCommand(),
		newStartCommand(),
		newStopCommand(),
		newStatusCommand(),
	)
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		_, _ = fmt.Fprintln(os.Stderr, err.Error())
	}
}

func manageAPI() error {
	conf.InitConf()
	log.InitLogger()

	if err := utils.WritePID(conf.PIDPath, forceStart); err != nil {
		log.Errorf("failed to write pid: %s", err)
		return err
	}
	utils.AppendToClosers(func() error {
		if err := os.Remove(conf.PIDPath); err != nil {
			log.Errorf("failed to remove pid path: %s", err)
			return err
		}
		return nil
	})

	// Signal received to the process externally.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	defer func() {
		utils.CloseAll()
		signal.Stop(quit)
	}()

	droplet.Option.Orchestrator = func(mws []droplet.Middleware) []droplet.Middleware {
		var newMws []droplet.Middleware
		// default middleware order: resp_reshape, auto_input, traffic_log
		// We should put err_transform at second to catch all error
		newMws = append(newMws, mws[0], &handler.ErrorTransformMiddleware{}, &filter.AuthenticationMiddleware{})
		newMws = append(newMws, mws[1:]...)
		return newMws
	}

	if err := storage.InitETCDClient(conf.ETCDConfig); err != nil {
		log.Errorf("init etcd client fail: %w", err)
		return err
	}
	if err := store.InitStores(); err != nil {
		log.Errorf("init stores fail: %w", err)
		return err
	}

	var server, serverSSL *http.Server
	// For internal error handling across multiple goroutines.
	errsig := make(chan error, 1)

	// routes
	r := internal.SetUpRouter()
	addr := net.JoinHostPort(conf.ServerHost, strconv.Itoa(conf.ServerPort))
	server = &http.Server{
		Addr:         addr,
		Handler:      r,
		ReadTimeout:  time.Duration(1000) * time.Millisecond,
		WriteTimeout: time.Duration(5000) * time.Millisecond,
	}

	log.Infof("The Manager API is listening on %s", addr)

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Errorf("listen and serv fail: %s", err)
			errsig <- err
		}
	}()

	// HTTPS
	if conf.SSLCert != "" && conf.SSLKey != "" {
		addrSSL := net.JoinHostPort(conf.ServerHost, strconv.Itoa(conf.SSLPort))
		serverSSL = &http.Server{
			Addr:         addrSSL,
			Handler:      r,
			ReadTimeout:  time.Duration(1000) * time.Millisecond,
			WriteTimeout: time.Duration(5000) * time.Millisecond,
			TLSConfig: &tls.Config{
				// Causes servers to use Go's default ciphersuite preferences,
				// which are tuned to avoid attacks. Does nothing on clients.
				PreferServerCipherSuites: true,
			},
		}
		go func() {
			err := serverSSL.ListenAndServeTLS(conf.SSLCert, conf.SSLKey)
			if err != nil && err != http.ErrServerClosed {
				log.Errorf("listen and serve for HTTPS failed: %s", err)
				errsig <- err
			}
		}()
	}

	printInfo()

	select {
	case err := <-errsig:
		return err

	case sig := <-quit:
		log.Infof("The Manager API server receive %s and start shutting down", sig.String())

		shutdownServer(server)
		shutdownServer(serverSSL)
		log.Infof("The Manager API server exited")
		return nil
	}
}

func shutdownServer(server *http.Server) {
	if server != nil {
		ctx, cancel := context.WithTimeout(context.TODO(), 5*time.Second)
		defer cancel()

		if err := server.Shutdown(ctx); err != nil {
			log.Errorf("Shutting down server error: %s", err)
		}
	}
}

func printInfo() {
	fmt.Fprint(os.Stdout, "The manager-api is running successfully!\n\n")
	printVersion()
	fmt.Fprintf(os.Stdout, "%-8s: %s:%d\n", "Listen", conf.ServerHost, conf.ServerPort)
	if conf.SSLCert != "" && conf.SSLKey != "" {
		fmt.Fprintf(os.Stdout, "%-8s: %s:%d\n", "HTTPS Listen", conf.SSLHost, conf.SSLPort)
	}
	fmt.Fprintf(os.Stdout, "%-8s: %s\n", "Loglevel", conf.ErrorLogLevel)
	fmt.Fprintf(os.Stdout, "%-8s: %s\n", "ErrorLogFile", conf.ErrorLogPath)
	fmt.Fprintf(os.Stdout, "%-8s: %s\n\n", "AccessLogFile", conf.AccessLogPath)
}
