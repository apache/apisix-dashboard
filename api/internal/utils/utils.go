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
	"fmt"
	"net"
	"os"
	"strconv"

	"github.com/sony/sonyflake"
)

var _sf *sonyflake.Sonyflake

func init() {
	saltStr, ok := os.LookupEnv("FLAKE_SALT")
	var salt uint16
	if ok {
		i, err := strconv.Atoi(saltStr)
		if err != nil {
			panic(err)
		}
		salt = uint16(i)
	}
	ips, err := getLocalIPs()
	if err != nil {
		panic(err)
	}
	_sf = sonyflake.NewSonyflake(sonyflake.Settings{
		MachineID: func() (u uint16, e error) {
			return sumIPs(ips) + salt, nil
		},
	})
	if _sf == nil {
		panic("sonyflake init failed")
	}
}

func sumIPs(ips []net.IP) uint16 {
	total := 0
	for _, ip := range ips {
		for i := range ip {
			total += int(ip[i])
		}
	}
	return uint16(total)
}

func getLocalIPs() ([]net.IP, error) {
	var ips []net.IP
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return ips, err
	}
	for _, a := range addrs {
		if ipNet, ok := a.(*net.IPNet); ok && !ipNet.IP.IsLoopback() && ipNet.IP.To4() != nil {
			ips = append(ips, ipNet.IP)
		}
	}
	return ips, nil
}

func GetFlakeUid() uint64 {
	uid, err := _sf.NextID()
	if err != nil {
		panic("get sony flake uid failed:" + err.Error())
	}
	return uid
}

func GetFlakeUidStr() string {
	return strconv.FormatUint(GetFlakeUid(), 10)
}

func InterfaceToString(val interface{}) string {
	if val == nil {
		return ""
	}
	str := fmt.Sprintf("%v", val)
	return str
}
