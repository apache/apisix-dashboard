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
package main
import (
	"os"
	"os/signal"
	"strings"
	"syscall"
	"testing"
)
func TestMainWrapper(t *testing.T) {
	if os.Getenv("ENV") == "test" {
		t.Skip("skipping build binary when execute unit test")
	}

	var (
		args []string
	)
	for _, arg := range os.Args {
		switch {
		case strings.HasPrefix(arg, "-test"):
		default:
			args = append(args, arg)
		}
	}
	waitCh := make(chan int, 1)
	os.Args = args
	go func() {
		main()
		close(waitCh)
	}()
	signalCh := make(chan os.Signal, 1)
	signal.Notify(signalCh, syscall.SIGINT, syscall.SIGQUIT, syscall.SIGTERM, syscall.SIGHUP)
	select {
	case <-signalCh:
		return
	case <-waitCh:
		return
	}
}
