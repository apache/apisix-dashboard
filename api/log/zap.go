package log

import (
	"github.com/apisix/manager-api/conf"
	rotatelogs "github.com/lestrrat-go/file-rotatelogs"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"time"
)

var logger *zap.SugaredLogger

func init() {
	writeSyncer := rotateWriter()
	encoder := getEncoder()
	logLevel := getLogLevel()
	core := zapcore.NewCore(encoder, writeSyncer, logLevel)

	zapLogger := zap.New(core, zap.AddCaller())

	logger = zapLogger.Sugar()
}

func getLogLevel() zapcore.LevelEnabler {
	level := zapcore.WarnLevel
	switch conf.ErrorLogLevel {
	case "debug":
		level = zapcore.DebugLevel
	case "info":
		level = zapcore.InfoLevel
	case "error":
		level = zapcore.ErrorLevel
	}
	return level
}

func getEncoder() zapcore.Encoder {
	encoderConfig := zap.NewProductionEncoderConfig()
	encoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	encoderConfig.EncodeLevel = zapcore.CapitalLevelEncoder
	return zapcore.NewConsoleEncoder(encoderConfig)
}

func rotateWriter() zapcore.WriteSyncer {
	maxAge := time.Duration(conf.LogRotateMaxAge)
	maxSize := conf.LogRotateMaxSize
	interval := time.Duration(conf.LogRotateInterval)

	logf, _ := rotatelogs.New(
		conf.ErrorLogPath+".%Y%m%d%H%M%S",
		rotatelogs.WithMaxAge(maxAge*time.Second),
		rotatelogs.WithRotationTime(interval*time.Second),
		//rotatelogs.WithRotationCount(7),
		rotatelogs.WithRotationSize(maxSize),
	)

	return zapcore.AddSync(logf)
}

func getZapFields(logger *zap.SugaredLogger, fields []interface{}) *zap.SugaredLogger {
	if len(fields) == 0 {
		return logger
	}

	return logger.With(fields)
}
