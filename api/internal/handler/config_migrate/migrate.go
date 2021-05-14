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
package migrate

import (
	"encoding/binary"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"

	"github.com/apisix/manager-api/internal/handler"
	"github.com/apisix/manager-api/internal/utils/consts"
	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet/data"

	"hash/crc32"

	"github.com/apisix/manager-api/internal/core/migrate"
	"github.com/apisix/manager-api/internal/log"
)

const (
	exportFileName = "apisix-config.bak"
)

type Handler struct{}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.GET("/apisix/admin/migrate/export", h.ExportConfig)
	r.POST("/apisix/admin/migrate/import", h.ImportConfig)
}

type ExportInput struct{}

func (h *Handler) ExportConfig(c *gin.Context) {
	data, err := migrate.Export(c)
	if err != nil {
		log.Errorf("Export: %s", err)
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	// To check file integrity
	// Add 4 byte(uint32) checksum at the end of file.
	checksumUint32 := crc32.ChecksumIEEE(data)
	checksum := make([]byte, 4)
	binary.BigEndian.PutUint32(checksum, checksumUint32)
	fileBytes := append(data, checksum...)

	c.Writer.WriteHeader(http.StatusOK)
	c.Header("Content-Disposition", "attachment; filename="+exportFileName)
	c.Header("Content-Type", "application/octet-stream")
	c.Header("Accept-Length", strconv.Itoa(len(fileBytes)))
	c.Header("Content-Transfer-Encoding", "binary")
	_, err = c.Writer.Write([]byte(fileBytes))
	if err != nil {
		log.Errorf("Write: %s", err)
	}
}

type ImportInput struct {
	Data string `json:"data"`
	Mode string `json:"mode"`
}

type ImportOutput struct {
	ConflictItems *migrate.AllData
}

var modeMap = map[string]migrate.ConflictMode{
	"return":    migrate.ModeReturn,
	"overwrite": migrate.ModeOverwrite,
	"skip":      migrate.ModeSkip,
}

func (h *Handler) ImportConfig(c *gin.Context) {
	paraMode := c.PostForm("mode")
	fmt.Printf("mode:%s\n", paraMode)
	mode := migrate.ModeReturn
	if m, ok := modeMap[paraMode]; ok {
		mode = m
	}
	file, _, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	content, err := ioutil.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	// checksum uint32,4 bytes
	importData := content[:len(content)-4]
	checksum := binary.BigEndian.Uint32(content[len(content)-4:])
	if checksum != crc32.ChecksumIEEE(importData) {
		c.JSON(http.StatusOK, &data.BaseError{
			Code:    consts.ErrBadRequest,
			Message: "Checksum check failure,maybe file broken",
		})
		return
	}
	conflictData, err := migrate.Import(c, importData, mode)
	if err != nil {
		log.Errorf("Import: %s", err)
		c.JSON(http.StatusOK, &data.BaseError{
			Code:    consts.ErrBadRequest,
			Message: "Config conflict",
			Data:    ImportOutput{ConflictItems: conflictData},
		})
		return
	}
	c.JSON(http.StatusOK, &data.Response{
		Data: ImportOutput{ConflictItems: conflictData},
	})
}
