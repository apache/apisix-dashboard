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
	"embed"
	"io/fs"
	"os"
	"path/filepath"
)

// WriteLuaScripts writes embedded lua scripts.
func WriteLuaScripts(workDir string, luaScripts embed.FS) error {
	return fs.WalkDir(luaScripts, "dag-to-lua", func(path string, d fs.DirEntry, _ error) error {
		path = filepath.Join(workDir, path)
		if d.IsDir() {
			if _, err := os.Stat(path); os.IsNotExist(err) {
				return os.Mkdir(path, 0777)
			}
			return nil
		}
		f, err := os.OpenFile("./"+path, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0664)
		if err != nil {
			return err
		}
		defer f.Close()

		scriptBytes, err := luaScripts.ReadFile(path)
		if err != nil {
			return err
		}
		_, err = f.Write(scriptBytes)
		return err
	})
}
