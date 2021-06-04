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
	"os"
	"runtime"

	"github.com/takama/daemon"

	"github.com/apisix/manager-api/internal/conf"
)

type Service struct {
	daemon.Daemon
}

var serviceState struct {
	startService   bool
	stopService    bool
	installService bool
	removeService  bool
	status         bool
}

func createService() (*Service, error) {
	var d daemon.Daemon
	var err error
	if runtime.GOOS == "darwin" {
		d, err = daemon.New("apisix-dashboard", "Apache APISIX Dashboard", daemon.GlobalDaemon)
	} else {
		d, err = daemon.New("apisix-dashboard", "Apache APISIX Dashboard", daemon.SystemDaemon)
	}
	if err != nil {
		return nil, err
	}
	service := &Service{d}
	return service, nil
}

func (service *Service) manageService() (string, error) {
	if serviceState.status {
		return service.Status()
	}
	if serviceState.removeService {
		return service.Remove()
	}
	if conf.WorkDir == "." {
		dir, err := os.Getwd()
		if err != nil {
			return "proceed with --work-dir flag", err
		}
		conf.WorkDir = dir
	}
	if serviceState.installService {
		return service.Install("-p", conf.WorkDir)
	}
	if serviceState.startService {
		iStatus, err := service.Install("-p", conf.WorkDir)
		if err != nil {
			if err != daemon.ErrAlreadyInstalled {
				return iStatus, err
			}
			iStatus = ""
		}
		sStatus, err := service.Start()
		if iStatus != "" {
			sStatus = iStatus + "\n" + sStatus
		}
		return sStatus, err
	} else if serviceState.stopService {
		return service.Stop()
	}

	err := manageAPI()
	if err != nil {
		return "Unable to start Manager API", err
	}
	return "The Manager API server exited", nil
}
