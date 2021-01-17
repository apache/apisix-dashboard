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

package ssl

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/shiningrush/droplet"
	"github.com/stretchr/testify/assert"

	"github.com/apisix/manager-api/internal/conf"
	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/internal/core/store"
)

func TestSSL(t *testing.T) {
	// init
	err := storage.InitETCDClient(conf.ETCDConfig)
	assert.Nil(t, err)
	err = store.InitStores()
	assert.Nil(t, err)

	handler := &Handler{
		sslStore: store.GetStore(store.HubKeySsl),
	}
	assert.NotNil(t, handler)

	//create
	ctx := droplet.NewContext()
	ssl := &entity.SSL{}
	reqBody := `{
        "id":"1",
        "key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDGO0J9xrOcmvgh\npkqHIYHCw35FTfIT5uXOSzdF49M2ZAKBQwFG0ovYT8bc0glNLB+hpDhJPL531qSP\nl1ZOe0W1ofP1u0T5Zzc9Rub/kn7RMPq0BsSC6J3rF+rQEwh1PM8qUuD8DxZ7jaOL\niMNL6SyuZIPsS1kPPBtsioukdo666tbjNMixhQbI9Wpg55abdXRFh3i7Zu/9siF1\njCGcsskjOaUOY4sYQ3i5WU/HIIRhA82XuIL+Sxd32P8bKi2UT1sqFXRjAVR7KRWo\nIVvkmSLoZb9ucV6MsccDrRYBf6rLbI1tFj9l2rY6GTFlT+6z7K/ZI60DGi/hsBfl\nDeEQ5WuxAgMBAAECggEAVHQQyucpxHGdfzCKlfGnh+Oj20Du/p2jkHUpEkSSypxn\nGM0EMTkoTTsHvTJath8zRrlhJYqUlxfCOk6+fWc1dsGN30Yuh5b6yMd5SK8QCm20\nkZhEhoU2Kl+hMY66TsBefmia46hF6tOYNq1IjwHDgHTgY35ibgQsptyLy8Ca5HTC\nrnoocP2AcKtM+qwOMGiNHpeh+/zfB91C9AszvS8H2ao5nq4u0/JavPO4A4WmVYol\n7Qv9ACY/8uaKC79syahutbkMjwGsQgYsq9G0QpcLSCuOb4vBbOb130mptSM9NzKg\nTjSxF2D8ob//roZMc1ueTpqAY6WedKV3y3BIBDKuAQKBgQDgGyEsxwR9QtA5EH/h\nJ4GiTQn0aep8G2LSlAtHGndL3sxaGGLt2pk3lNIeRAbOS3APmYskBN418JIF/Ren\nE0CYSrTaxpTs9UXXkgKNJ63Z6r+btswTAVVXG5Zoi/5JRSHRquEVmKccM4zg3v6R\ny/nVhwXigUaRuLx+wCtoaGsaUQKBgQDicXFZ0TvN8tohqc8dbmOu2A25+ifFKHUA\nn3yxZIJtbTC9bJeuwtkqIFol1DXHLqYvdD5jQT3c4z6HekcmI9sEy1YzO4a3WUTI\nP//ogjDLXj402k+WCx1Us2HASxwU5cRvOpMhfnppYPSDXqBoH196UCDmOQuS1+Q8\njyPsNQmDYQKBgQDcm5hCvf87V4QmSIm6GOvR20iLY6BCX6seZEHd0r3Q4BgGMK9i\nOahOQJ++z3Rrq3M6yAligbBFJPZ6ErUv8RHLWO9D1exQfvorxT3huke3lxDbtkya\nANwDjdK4Q+ckNXufLDm6yrTmXBC4ZIvw9fyQKASw/lV7qYFUvNN+Shv0oQKBgQC+\nraw3Z7smV0NbaXRgYh5KkuAsJPvsR38OwT3s2qgBoRqTx6eKn8Tidk+y3xlR2nRS\nLV6DkeKX6Ds1NcBH25WIWfkCNzPfnKoQveOuVELmXTugody2ijFuq4a6uASzjC93\nQim24JwPtHbxUHNeelyZ0HODqbGXO3iTji0/sAGMwQKBgQC8yDwapXgrCWK34qpN\nSdO9uA4VstI3Ovb+o3Evfp1CvJnfk56ypO2DaqbuvMJsInuWRFU40UWp7Vxyl/hP\nXvGgEI3dbBy9KWFjAKfI2Wv3i+zvJ1mAHM3u1jcX3zxOxSAN4LJVBudgkGpop1ps\nW5tWveXiXwxCUE/r9ax4mfJvXQ==\n-----END PRIVATE KEY-----",
        "cert": "-----BEGIN CERTIFICATE-----\nMIIEVzCCAr+gAwIBAgIQITiNM7xmudhg3pK85KDwLDANBgkqhkiG9w0BAQsFADB/\nMR4wHAYDVQQKExVta2NlcnQgZGV2ZWxvcG1lbnQgQ0ExKjAoBgNVBAsMIWp1bnh1\nY2hlbkBqdW54dWRlQWlyIChqdW54dSBjaGVuKTExMC8GA1UEAwwobWtjZXJ0IGp1\nbnh1Y2hlbkBqdW54dWRlQWlyIChqdW54dSBjaGVuKTAeFw0xOTA2MDEwMDAwMDBa\nFw0zMDA3MDgwNzQ4MDJaMFUxJzAlBgNVBAoTHm1rY2VydCBkZXZlbG9wbWVudCBj\nZXJ0aWZpY2F0ZTEqMCgGA1UECwwhanVueHVjaGVuQGp1bnh1ZGVBaXIgKGp1bnh1\nIGNoZW4pMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxjtCfcaznJr4\nIaZKhyGBwsN+RU3yE+blzks3RePTNmQCgUMBRtKL2E/G3NIJTSwfoaQ4STy+d9ak\nj5dWTntFtaHz9btE+Wc3PUbm/5J+0TD6tAbEguid6xfq0BMIdTzPKlLg/A8We42j\ni4jDS+ksrmSD7EtZDzwbbIqLpHaOuurW4zTIsYUGyPVqYOeWm3V0RYd4u2bv/bIh\ndYwhnLLJIzmlDmOLGEN4uVlPxyCEYQPNl7iC/ksXd9j/GyotlE9bKhV0YwFUeykV\nqCFb5Jki6GW/bnFejLHHA60WAX+qy2yNbRY/Zdq2OhkxZU/us+yv2SOtAxov4bAX\n5Q3hEOVrsQIDAQABo3kwdzAOBgNVHQ8BAf8EBAMCBaAwEwYDVR0lBAwwCgYIKwYB\nBQUHAwEwDAYDVR0TAQH/BAIwADAfBgNVHSMEGDAWgBRU+EbJj+Hp62gCrNvb3yQk\nYnPHXDAhBgNVHREEGjAYgglyb3V0ZS5jb22CCyoucm91dGUuY29tMA0GCSqGSIb3\nDQEBCwUAA4IBgQAvKN2GEorAlx5sfUU2uiL49iFmQSMDLZQminQl1RIHTI/h+jz8\nNluZSdxDFmNq8am6B2ofD3VLl6StC/G+G6YuekPz+QrUNK4UB+8ftRmY4YRFGTQ6\nRnFli1wOq2ES9vPjKlIj77cznr8uwVHPHq8JxGbn/rx3oVDVPndXFCkJJ1DDjRT+\n22atHNzHt5bc9ut8Fq5NW61P+nnMMFShKJaPBkmm9Pf2pEOd8Y7OU8Iy1Kj65fsE\nUshGF5+RWoxdv6/9f6/uOQhmq3MEKqneUC3pjVZ8TiBlRvADxxR5krvujQswms0D\nFGpRMtGpPGMWTuptSIMwNcar/luVig7wGIBeV5ZaOlSOx3911le9mlS7+2lLqf5H\n5dsMkP30Sjv/jfrIL+SE1qeK3kjL0iIwA/PPARvhctExs9y2llT9+drbJofZUi+I\nZdYfAfyJT4htbcl7jHN8oY7vzwgTyxCcBxkbqKfBqabneutj0jfX39zP0G696tiZ\ndQFXCS4wkvw0CG0=\n-----END CERTIFICATE-----",
        "labels":{
            "build":"16",
            "env":"production",
            "version":"v2"
        }
	}`
	err = json.Unmarshal([]byte(reqBody), ssl)
	assert.Nil(t, err)
	ctx.SetInput(ssl)
	ret, err := handler.Create(ctx)
	assert.Nil(t, err)
	objRet, ok := ret.(*entity.SSL)
	assert.True(t, ok)
	assert.Equal(t, "1", objRet.ID)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//get
	input := &GetInput{}
	input.ID = "1"
	ctx.SetInput(input)
	ret, err = handler.Get(ctx)
	stored := ret.(*entity.SSL)
	assert.Nil(t, err)
	assert.Equal(t, stored.ID, ssl.ID)
	assert.Equal(t, stored.Labels["build"], "16")
	assert.Equal(t, stored.Labels["env"], "production")
	assert.Equal(t, stored.Labels["version"], "v2")

	//update
	ssl2 := &UpdateInput{}
	ssl2.ID = "1"
	reqBody = `{
        "id":"1",
        "key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDGO0J9xrOcmvgh\npkqHIYHCw35FTfIT5uXOSzdF49M2ZAKBQwFG0ovYT8bc0glNLB+hpDhJPL531qSP\nl1ZOe0W1ofP1u0T5Zzc9Rub/kn7RMPq0BsSC6J3rF+rQEwh1PM8qUuD8DxZ7jaOL\niMNL6SyuZIPsS1kPPBtsioukdo666tbjNMixhQbI9Wpg55abdXRFh3i7Zu/9siF1\njCGcsskjOaUOY4sYQ3i5WU/HIIRhA82XuIL+Sxd32P8bKi2UT1sqFXRjAVR7KRWo\nIVvkmSLoZb9ucV6MsccDrRYBf6rLbI1tFj9l2rY6GTFlT+6z7K/ZI60DGi/hsBfl\nDeEQ5WuxAgMBAAECggEAVHQQyucpxHGdfzCKlfGnh+Oj20Du/p2jkHUpEkSSypxn\nGM0EMTkoTTsHvTJath8zRrlhJYqUlxfCOk6+fWc1dsGN30Yuh5b6yMd5SK8QCm20\nkZhEhoU2Kl+hMY66TsBefmia46hF6tOYNq1IjwHDgHTgY35ibgQsptyLy8Ca5HTC\nrnoocP2AcKtM+qwOMGiNHpeh+/zfB91C9AszvS8H2ao5nq4u0/JavPO4A4WmVYol\n7Qv9ACY/8uaKC79syahutbkMjwGsQgYsq9G0QpcLSCuOb4vBbOb130mptSM9NzKg\nTjSxF2D8ob//roZMc1ueTpqAY6WedKV3y3BIBDKuAQKBgQDgGyEsxwR9QtA5EH/h\nJ4GiTQn0aep8G2LSlAtHGndL3sxaGGLt2pk3lNIeRAbOS3APmYskBN418JIF/Ren\nE0CYSrTaxpTs9UXXkgKNJ63Z6r+btswTAVVXG5Zoi/5JRSHRquEVmKccM4zg3v6R\ny/nVhwXigUaRuLx+wCtoaGsaUQKBgQDicXFZ0TvN8tohqc8dbmOu2A25+ifFKHUA\nn3yxZIJtbTC9bJeuwtkqIFol1DXHLqYvdD5jQT3c4z6HekcmI9sEy1YzO4a3WUTI\nP//ogjDLXj402k+WCx1Us2HASxwU5cRvOpMhfnppYPSDXqBoH196UCDmOQuS1+Q8\njyPsNQmDYQKBgQDcm5hCvf87V4QmSIm6GOvR20iLY6BCX6seZEHd0r3Q4BgGMK9i\nOahOQJ++z3Rrq3M6yAligbBFJPZ6ErUv8RHLWO9D1exQfvorxT3huke3lxDbtkya\nANwDjdK4Q+ckNXufLDm6yrTmXBC4ZIvw9fyQKASw/lV7qYFUvNN+Shv0oQKBgQC+\nraw3Z7smV0NbaXRgYh5KkuAsJPvsR38OwT3s2qgBoRqTx6eKn8Tidk+y3xlR2nRS\nLV6DkeKX6Ds1NcBH25WIWfkCNzPfnKoQveOuVELmXTugody2ijFuq4a6uASzjC93\nQim24JwPtHbxUHNeelyZ0HODqbGXO3iTji0/sAGMwQKBgQC8yDwapXgrCWK34qpN\nSdO9uA4VstI3Ovb+o3Evfp1CvJnfk56ypO2DaqbuvMJsInuWRFU40UWp7Vxyl/hP\nXvGgEI3dbBy9KWFjAKfI2Wv3i+zvJ1mAHM3u1jcX3zxOxSAN4LJVBudgkGpop1ps\nW5tWveXiXwxCUE/r9ax4mfJvXQ==\n-----END PRIVATE KEY-----",
        "cert": "-----BEGIN CERTIFICATE-----\nMIIEVzCCAr+gAwIBAgIQITiNM7xmudhg3pK85KDwLDANBgkqhkiG9w0BAQsFADB/\nMR4wHAYDVQQKExVta2NlcnQgZGV2ZWxvcG1lbnQgQ0ExKjAoBgNVBAsMIWp1bnh1\nY2hlbkBqdW54dWRlQWlyIChqdW54dSBjaGVuKTExMC8GA1UEAwwobWtjZXJ0IGp1\nbnh1Y2hlbkBqdW54dWRlQWlyIChqdW54dSBjaGVuKTAeFw0xOTA2MDEwMDAwMDBa\nFw0zMDA3MDgwNzQ4MDJaMFUxJzAlBgNVBAoTHm1rY2VydCBkZXZlbG9wbWVudCBj\nZXJ0aWZpY2F0ZTEqMCgGA1UECwwhanVueHVjaGVuQGp1bnh1ZGVBaXIgKGp1bnh1\nIGNoZW4pMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxjtCfcaznJr4\nIaZKhyGBwsN+RU3yE+blzks3RePTNmQCgUMBRtKL2E/G3NIJTSwfoaQ4STy+d9ak\nj5dWTntFtaHz9btE+Wc3PUbm/5J+0TD6tAbEguid6xfq0BMIdTzPKlLg/A8We42j\ni4jDS+ksrmSD7EtZDzwbbIqLpHaOuurW4zTIsYUGyPVqYOeWm3V0RYd4u2bv/bIh\ndYwhnLLJIzmlDmOLGEN4uVlPxyCEYQPNl7iC/ksXd9j/GyotlE9bKhV0YwFUeykV\nqCFb5Jki6GW/bnFejLHHA60WAX+qy2yNbRY/Zdq2OhkxZU/us+yv2SOtAxov4bAX\n5Q3hEOVrsQIDAQABo3kwdzAOBgNVHQ8BAf8EBAMCBaAwEwYDVR0lBAwwCgYIKwYB\nBQUHAwEwDAYDVR0TAQH/BAIwADAfBgNVHSMEGDAWgBRU+EbJj+Hp62gCrNvb3yQk\nYnPHXDAhBgNVHREEGjAYgglyb3V0ZS5jb22CCyoucm91dGUuY29tMA0GCSqGSIb3\nDQEBCwUAA4IBgQAvKN2GEorAlx5sfUU2uiL49iFmQSMDLZQminQl1RIHTI/h+jz8\nNluZSdxDFmNq8am6B2ofD3VLl6StC/G+G6YuekPz+QrUNK4UB+8ftRmY4YRFGTQ6\nRnFli1wOq2ES9vPjKlIj77cznr8uwVHPHq8JxGbn/rx3oVDVPndXFCkJJ1DDjRT+\n22atHNzHt5bc9ut8Fq5NW61P+nnMMFShKJaPBkmm9Pf2pEOd8Y7OU8Iy1Kj65fsE\nUshGF5+RWoxdv6/9f6/uOQhmq3MEKqneUC3pjVZ8TiBlRvADxxR5krvujQswms0D\nFGpRMtGpPGMWTuptSIMwNcar/luVig7wGIBeV5ZaOlSOx3911le9mlS7+2lLqf5H\n5dsMkP30Sjv/jfrIL+SE1qeK3kjL0iIwA/PPARvhctExs9y2llT9+drbJofZUi+I\nZdYfAfyJT4htbcl7jHN8oY7vzwgTyxCcBxkbqKfBqabneutj0jfX39zP0G696tiZ\ndQFXCS4wkvw0CG0=\n-----END CERTIFICATE-----",
        "labels":{
            "build":"18",
            "env":"dev",
            "version":"v3"
        }
	}`
	err = json.Unmarshal([]byte(reqBody), ssl2)
	assert.Nil(t, err)
	ctx.SetInput(ssl2)
	_, err = handler.Update(ctx)
	assert.Nil(t, err)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	// get and check
	input = &GetInput{}
	input.ID = "1"
	ctx.SetInput(input)
	ret, err = handler.Get(ctx)
	stored = ret.(*entity.SSL)
	assert.Nil(t, err)
	assert.Equal(t, stored.ID, ssl.ID)
	assert.Equal(t, stored.Labels["build"], "18")
	assert.Equal(t, stored.Labels["env"], "dev")
	assert.Equal(t, stored.Labels["version"], "v3")

	//list
	listInput := &ListInput{}
	reqBody = `{"page_size": 1, "page": 1}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage, err := handler.List(ctx)
	assert.Nil(t, err)
	dataPage := retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//list search match
	listInput2 := &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "sni": "route"}`
	err = json.Unmarshal([]byte(reqBody), listInput2)
	assert.Nil(t, err)
	ctx.SetInput(listInput2)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//list search not match
	listInput3 := &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "sni": "not-exists"}`
	err = json.Unmarshal([]byte(reqBody), listInput3)
	assert.Nil(t, err)
	ctx.SetInput(listInput3)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 0)

	//delete test data
	inputDel := &BatchDelete{}
	reqBody = `{"ids": "1"}`
	err = json.Unmarshal([]byte(reqBody), inputDel)
	assert.Nil(t, err)
	ctx.SetInput(inputDel)
	_, err = handler.BatchDelete(ctx)
	assert.Nil(t, err)
}
