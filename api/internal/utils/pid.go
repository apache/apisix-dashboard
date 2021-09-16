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

package utils

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"os"
	"runtime"
	"strconv"
	"syscall"
	"time"

	"github.com/pkg/errors"
)

// WritePID write pid to the given file path.
func WritePID(filepath string, forceStart bool) error {
	pidStatAction := func() error {
		pid, err := ReadPID(filepath)
		if err != nil {
			if _, ok := err.(*os.PathError); ok {
				return nil // No pid file indicates no running instance of manager-api
			}
			return err // Other errors in ReadPID must be reported.
		}

		// In unix system this always succeeds, doesn't ensure if the process at all exist or not. In windows, it returns an error indicating no such process exists.
		proc, err := os.FindProcess(pid)
		if err != nil {
			return nil
		}

		// Traditional unix way to check the existence of the particular PID.
		err = proc.Signal(syscall.Signal(0))
		// No entry of the process in process control block.
		if err != nil {
			return nil
		}

		// Windows has a tendency to pick unused old PIDs and allocate that to new process, so we won't kill it.
		if runtime.GOOS != "windows" && forceStart {
			fmt.Printf("Killing existing instance of Manager API with PID: %d\n", pid)
			if err := proc.Signal(syscall.SIGINT); err != nil {
				return errors.Wrapf(err, "failed to kill the existing process of PID %d ", pid)
			}
			// Wait for graceful shutdown.
			for {
				if err := proc.Signal(syscall.Signal(0)); err != nil {
					break
				}
				time.Sleep(time.Second)
			}
			fmt.Println("Existing instance of Manager API successfully exited")
		}
		if forceStart {
			fmt.Printf("Force starting new instance. Another instance of Manager API was running with pid %d\n", pid)
		}

		return errors.Errorf("instance of Manager API is already running. Either kill the existing instance of PID %d or run Manager API with '-f' or '--force' flag", pid)
	}

	if err := pidStatAction(); err != nil && !forceStart {
		return err
	}
	pid := os.Getpid()
	f, err := os.OpenFile(filepath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC|os.O_CREATE, 0600)
	if err != nil {
		return err
	}
	defer f.Close()

	if _, err := f.WriteString(strconv.Itoa(pid)); err != nil {
		return err
	}
	return nil
}

// ReadPID reads the pid from the given file path.
func ReadPID(filepath string) (int, error) {
	data, err := ioutil.ReadFile(filepath)
	if err != nil {
		return -1, err
	}
	pid, err := strconv.Atoi(string(bytes.Trim(data, "\n")))
	if err != nil {
		return -1, fmt.Errorf("invalid pid: %s", err)
	}
	return pid, nil
}
