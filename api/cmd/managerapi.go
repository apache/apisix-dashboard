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
	showVersion bool
	Version     string
	GitHash     string
	service     *Service
)

func printInfo() {
	fmt.Fprint(os.Stdout, "The manager-api is running successfully!\n\n")
	printVersion()
	fmt.Fprintf(os.Stdout, "%-8s: %s:%d\n", "Listen", conf.ServerHost, conf.ServerPort)
	if conf.SSLCert != "" && conf.SSLKey != "" {
		fmt.Fprintf(os.Stdout, "%-8s: %s:%d\n", "HTTPS Listen", conf.SSLHost, conf.SSLPort)
	}
	fmt.Fprintf(os.Stdout, "%-8s: %s\n", "Loglevel", conf.ErrorLogLevel)
	fmt.Fprintf(os.Stdout, "%-8s: %s\n\n", "Logfile", conf.ErrorLogPath)
}

func printVersion() {
	fmt.Fprintf(os.Stdout, "%-8s: %s\n", "Version", Version)
	fmt.Fprintf(os.Stdout, "%-8s: %s\n", "GitHash", GitHash)
}

// NewManagerAPICommand creates the manager-api command.
func NewManagerAPICommand() *cobra.Command {
	cobra.OnInitialize(func() {
		var err error
		service, err = createService()
		if err != nil {
			fmt.Fprintf(os.Stderr, "error occurred while initializing service: %s", err)
		}
	})

	cmd := &cobra.Command{
		Use:   "manager-api [flags]",
		Short: "APISIX Manager API",
		RunE: func(cmd *cobra.Command, args []string) error {
			GitHash, Version = utils.GetHashAndVersion()
			if showVersion {
				printVersion()
				os.Exit(0)
			}
			err := manageAPI()
			return err
		},
	}

	cmd.PersistentFlags().StringVarP(&conf.WorkDir, "work-dir", "p", ".", "current work directory")
	cmd.PersistentFlags().BoolVarP(&showVersion, "version", "v", false, "show manager-api version")

	cmd.AddCommand(newStartCommand(), newInstallCommand(), newStatusCommand(), newStopCommand(), newRemoveCommand())
	return cmd
}

func manageAPI() error {
	conf.InitConf()
	log.InitLogger()

	if err := utils.WritePID(conf.PIDPath); err != nil {
		log.Errorf("failed to write pid: %s", err)
		panic(err)
	}
	utils.AppendToClosers(func() error {
		if err := os.Remove(conf.PIDPath); err != nil {
			log.Errorf("failed to remove pid path: %s", err)
			return err
		}
		return nil
	})

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
		panic(err)
	}
	if err := store.InitStores(); err != nil {
		log.Errorf("init stores fail: %w", err)
		panic(err)
	}

	// routes
	r := internal.SetUpRouter()
	addr := fmt.Sprintf("%s:%d", conf.ServerHost, conf.ServerPort)
	s := &http.Server{
		Addr:         addr,
		Handler:      r,
		ReadTimeout:  time.Duration(1000) * time.Millisecond,
		WriteTimeout: time.Duration(5000) * time.Millisecond,
	}

	log.Infof("The Manager API is listening on %s", addr)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	defer signal.Stop(quit)

	go func() {
		if err := s.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			utils.CloseAll()
			log.Fatalf("listen and serv fail: %s", err)
		}
	}()

	// HTTPS
	if conf.SSLCert != "" && conf.SSLKey != "" {
		addrSSL := net.JoinHostPort(conf.ServerHost, strconv.Itoa(conf.SSLPort))
		serverSSL := &http.Server{
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
				utils.CloseAll()
				log.Fatalf("listen and serve for HTTPS failed: %s", err)
			}
		}()
	}

	printInfo()

	sig := <-quit
	log.Infof("The Manager API server receive %s and start shutting down", sig.String())

	ctx, cancel := context.WithTimeout(context.TODO(), 5*time.Second)
	defer cancel()

	if err := s.Shutdown(ctx); err != nil {
		log.Errorf("Shutting down server error: %s", err)
	}

	log.Infof("The Manager API server exited")

	utils.CloseAll()
	return nil
}

func newStartCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "start",
		Short: "start Apache APISIX Dashboard service",
		RunE: func(cmd *cobra.Command, args []string) error {
			serviceState.startService = true
			status, err := service.manageService()
			fmt.Println(status)
			return err
		},
	}
	return cmd
}

func newInstallCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "install",
		Short: "re-install Apache APISIX Dashboard service",
		RunE: func(cmd *cobra.Command, args []string) error {
			serviceState.installService = true
			status, err := service.manageService()
			fmt.Println(status)
			return err
		},
	}
	return cmd
}

func newStatusCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "status",
		Short: "inspect the status of Apache APISIX Dashboard service",
		RunE: func(cmd *cobra.Command, args []string) error {
			serviceState.status = true
			status, err := service.manageService()
			fmt.Println(status)
			return err
		},
	}
	return cmd
}

func newStopCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "stop",
		Short: "stop Apache APISIX Dashboard service/program",
		Run: func(cmd *cobra.Command, args []string) {
			pid, err := utils.ReadPID(conf.PIDPath)
			if err != nil {
				if syscall.ENOENT.Error() != err.Error() {
					fmt.Fprintf(os.Stderr, "failed to get manager-api pid: %s\n", err)
				} else {
					fmt.Fprintf(os.Stderr, "pid path %s not found, is manager-api running?\n", conf.PIDPath)
				}
				return
			}
			if err := syscall.Kill(pid, syscall.SIGINT); err != nil {
				fmt.Fprintf(os.Stderr, "failed to kill manager-api: %s", err)
			}
		},
	}
	return cmd
}

func newRemoveCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "remove",
		Short: "remove Apache APISIX Dashboard service",
		RunE: func(cmd *cobra.Command, args []string) error {
			serviceState.removeService = true
			status, err := service.manageService()
			fmt.Println(status)
			return err
		},
	}
	return cmd
}
