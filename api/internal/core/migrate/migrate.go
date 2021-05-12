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
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/apisix/manager-api/internal/core/store"
)

var (
	ErrConflict = errors.New("conflict")
)

func Export(ctx context.Context) ([]byte, error) {
	exportData := NewAllData()
	store.RangeStore(func(key store.HubKey, s *store.GenericStore) bool {
		s.Range(ctx, func(_ string, obj interface{}) bool {
			exportData.AddObj(obj)
			return true
		})
		return true
	})

	data, err := json.Marshal(exportData)
	if err != nil {
		return nil, err
	}

	return data, nil
}

type ConflictMode int

const (
	ModeReturn ConflictMode = iota
	ModeOverwrite
	ModeSkip
)

func Import(ctx context.Context, data []byte, mode ConflictMode) (*AllData, error) {
	importData := NewAllData()
	err := json.Unmarshal(data, &importData)
	if err != nil {
		return nil, err
	}
	conflict, conflictData := isConflict(ctx, importData)
	if conflict && mode == ModeReturn {
		return conflictData, ErrConflict
	}

	store.RangeStore(func(key store.HubKey, s *store.GenericStore) bool {
		importData.Range(key, func(i int, obj interface{}) bool {
			_, err := s.CreateCheck(obj)
			if err != nil {
				switch mode {
				case ModeSkip:
					return true
				case ModeOverwrite:
					s.Update(ctx, obj, true)
				}
			} else {
				s.Create(ctx, obj)
			}
			fmt.Printf("[%s]: %#v\n", key, obj)
			return true
		})
		return true
	})
	return nil, nil
}
