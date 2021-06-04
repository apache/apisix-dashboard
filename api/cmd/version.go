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

	"github.com/spf13/cobra"

	"github.com/apisix/manager-api/internal/utils"
)

var (
	Version string
	GitHash string
	showVersion bool
)

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "show manager-api version",
	Run: func(cmd *cobra.Command, args []string) {
		printVersion()
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)

	rootCmd.PersistentFlags().BoolVarP(&showVersion, "version", "v", false, "show manager-api version")
}

func printVersion() {
	GitHash, Version = utils.GetHashAndVersion()
	fmt.Fprintf(os.Stdout, "%-8s: %s\n", "Version", Version)
	fmt.Fprintf(os.Stdout, "%-8s: %s\n", "GitHash", GitHash)
}
