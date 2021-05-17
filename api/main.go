package main

import (
	"crypto/tls"
	"net"
	"net/http"
	"strconv"
	"time"

	"github.com/apisix/manager-api/cmd"
	"github.com/apisix/manager-api/internal"
	"github.com/apisix/manager-api/internal/conf"
	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/filter"
	"github.com/apisix/manager-api/internal/handler"
	"github.com/apisix/manager-api/internal/log"
	"github.com/shiningrush/droplet"
)

func main() {
	conf.InitConf()
	log.InitLogger()

	droplet.Option.Orchestrator = func(mws []droplet.Middleware) []droplet.Middleware {
		var newMws []droplet.Middleware
		// default middleware order: resp_reshape, auto_input, traffic_log
		// We should put err_transform at second to catch all error
		newMws = append(newMws, mws[0], &handler.ErrorTransformMiddleware{}, &filter.AuthenticationMiddleware{})
		newMws = append(newMws, mws[1:]...)
		return newMws
	}

	if err := storage.InitETCDClient(conf.ETCDConfig); err != nil {
		log.Fatalf("init etcd client fail: %w", err)
	}
	if err := store.InitStores(); err != nil {
		log.Fatalf("init stores fail: %w", err)
	}
	cmd.PrintInfo()
	// routes
	r := internal.SetUpRouter()
	// HTTP
	var server, serverSSL *http.Server

	// HTTPS
	if conf.SSLCert != "" && conf.SSLKey != "" {
		addrSSL := net.JoinHostPort(conf.ServerHost, strconv.Itoa(conf.SSLPort))
		serverSSL = &http.Server{
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
		log.Infof("The Manager API is listening on HTTPS %s", addrSSL)
		go func() {
			if err := serverSSL.ListenAndServeTLS(conf.SSLCert, conf.SSLKey); err != nil && err != http.ErrServerClosed {
				log.Fatalf("listen and serve for HTTPS failed: %s", err)
			}
		}()
	}

	addr := net.JoinHostPort(conf.ServerHost, strconv.Itoa(conf.ServerPort))
	server = &http.Server{
		Addr:         addr,
		Handler:      r,
		ReadTimeout:  time.Duration(1000) * time.Millisecond,
		WriteTimeout: time.Duration(5000) * time.Millisecond,
	}
	log.Infof("The Manager API is listening on HTTP %s", addr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("listen and serv fail: %s", err)
	}
}
