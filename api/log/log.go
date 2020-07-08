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
package log

import (
	"bufio"
	"fmt"
	"os"
	"runtime"
	"strings"

	"github.com/apisix/manager-api/conf"
	"github.com/sirupsen/logrus"
)

var logEntry *logrus.Entry

func GetLogger() *logrus.Entry {
	if logEntry == nil {
		var log = logrus.New()
		setNull(log)
		log.SetLevel(logrus.DebugLevel)
		if conf.ENV != conf.LOCAL {
			log.SetLevel(logrus.ErrorLevel)
		}
		log.SetFormatter(&logrus.JSONFormatter{})
		logEntry = log.WithFields(logrus.Fields{
			"app": "manager-api",
		})
		if hook, err := createHook(); err == nil {
			log.AddHook(hook)
		}
	}
	return logEntry
}

func setNull(log *logrus.Logger) {
	src, err := os.OpenFile(os.DevNull, os.O_APPEND|os.O_WRONLY, os.ModeAppend)
	if err != nil {
		fmt.Println("err", err)
	}
	writer := bufio.NewWriter(src)
	log.SetOutput(writer)
}

type Hook struct {
	Formatter func(file, function string, line int) string
}

func createHook() (*Hook, error) {
	return &Hook{
		func(file, function string, line int) string {
			return fmt.Sprintf("%s:%d", file, line)
		},
	}, nil
}

func (hook *Hook) Fire(entry *logrus.Entry) error {
	str := hook.Formatter(findCaller(5))
	en := entry.WithField("line", str)
	en.Level = entry.Level
	en.Message = entry.Message
	en.Time = entry.Time
	line, err := en.String()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to read entry, %v", err)
		return err
	}
	switch en.Level {
	case logrus.PanicLevel:
		fmt.Print(line)
		return nil
	case logrus.FatalLevel:
		fmt.Print(line)
		return nil
	case logrus.ErrorLevel:
		fmt.Print(line)
		return nil
	case logrus.WarnLevel:
		fmt.Print(line)
		return nil
	case logrus.InfoLevel:
		fmt.Print(line)
		return nil
	case logrus.DebugLevel:
		fmt.Print(line)
		return nil
	default:
		return nil
	}
}

func (hook *Hook) Levels() []logrus.Level {
	return logrus.AllLevels
}

func findCaller(skip int) (string, string, int) {
	var (
		pc       uintptr
		file     string
		function string
		line     int
	)
	for i := 0; i < 10; i++ {
		pc, file, line = getCaller(skip + i)
		if !strings.HasPrefix(file, "logrus") {
			break
		}
	}
	if pc != 0 {
		frames := runtime.CallersFrames([]uintptr{pc})
		frame, _ := frames.Next()
		function = frame.Function
	}
	return file, function, line
}

func getCaller(skip int) (uintptr, string, int) {
	pc, file, line, ok := runtime.Caller(skip)
	if !ok {
		return 0, "", 0
	}
	n := 0
	for i := len(file) - 1; i > 0; i-- {
		if file[i] == '/' {
			n += 1
			if n >= 2 {
				file = file[i+1:]
				break
			}
		}
	}
	return pc, file, line
}
