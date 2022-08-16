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

var (
	DefLogger Interface = emptyLog{}
)

type Type int8

const (
	AccessLog Type = iota - 1
	ErrorLog
)

type emptyLog struct {
}

type Interface interface {
	Debug(msg string, fields ...interface{})
	Debugf(msg string, args ...interface{})
	Info(msg string, fields ...interface{})
	Infof(msg string, args ...interface{})
	Warn(msg string, fields ...interface{})
	Warnf(msg string, args ...interface{})
	Error(msg string, fields ...interface{})
	Errorf(msg string, args ...interface{})
	Fatal(msg string, fields ...interface{})
	Fatalf(msg string, args ...interface{})
}

func (e emptyLog) Debug(msg string, fields ...interface{}) {
	getZapFields(errLogger, fields).Debug(msg)
}

func (e emptyLog) Debugf(msg string, args ...interface{}) {
	errLogger.Debugf(msg, args...)
}

func (e emptyLog) Info(msg string, fields ...interface{}) {
	getZapFields(errLogger, fields).Info(msg)
}

func (e emptyLog) Infof(msg string, args ...interface{}) {
	errLogger.Infof(msg, args...)
}

func (e emptyLog) Warn(msg string, fields ...interface{}) {
	getZapFields(errLogger, fields).Warn(msg)
}

func (e emptyLog) Warnf(msg string, args ...interface{}) {
	errLogger.Warnf(msg, args...)
}

func (e emptyLog) Error(msg string, fields ...interface{}) {
	getZapFields(errLogger, fields).Error(msg)
}

func (e emptyLog) Errorf(msg string, args ...interface{}) {
	errLogger.Errorf(msg, args...)
}

func (e emptyLog) Fatal(msg string, fields ...interface{}) {
	getZapFields(errLogger, fields).Fatal(msg)
}

func (e emptyLog) Fatalf(msg string, args ...interface{}) {
	errLogger.Fatalf(msg, args...)
}

func Debug(msg string, fields ...interface{}) {
	DefLogger.Debug(msg, fields...)
}
func Debugf(msg string, args ...interface{}) {
	DefLogger.Debugf(msg, args...)
}
func Info(msg string, fields ...interface{}) {
	DefLogger.Info(msg, fields...)
}
func Infof(msg string, args ...interface{}) {
	DefLogger.Infof(msg, args...)
}
func Warn(msg string, fields ...interface{}) {
	DefLogger.Warn(msg, fields...)
}
func Warnf(msg string, args ...interface{}) {
	DefLogger.Warnf(msg, args...)
}
func Error(msg string, fields ...interface{}) {
	DefLogger.Error(msg, fields...)
}
func Errorf(msg string, args ...interface{}) {
	DefLogger.Errorf(msg, args...)
}
func Fatal(msg string, fields ...interface{}) {
	DefLogger.Fatal(msg, fields...)
}
func Fatalf(msg string, args ...interface{}) {
	DefLogger.Fatalf(msg, args...)
}
