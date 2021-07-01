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
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/spf13/cobra"

	"github.com/apisix/manager-api/internal/conf"
	"github.com/apisix/manager-api/internal/core/server"
	"github.com/apisix/manager-api/internal/log"
)

var (
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

	rootCmd.PersistentFlags().StringVarP(&conf.ConfigFile, "config", "c", "", "config file")
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

	s, err := server.NewServer(&server.Options{
		ForceStart: forceStart,
	})
	if err != nil {
		return err
	}

	// start Manager API server
	errSig := make(chan error, 5)
	s.Start(errSig)

	// Signal received to the process externally.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-quit:
		log.Infof("The Manager API server receive %s and start shutting down", sig.String())
		s.Stop()
		log.Infof("The Manager API server exited")
	case err := <-errSig:
		log.Errorf("The Manager API server start failed: %s", err.Error())
		return err
	}
	return nil
}
