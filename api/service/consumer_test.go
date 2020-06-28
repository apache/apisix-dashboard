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
package service

import (
	"testing"

	"github.com/satori/go.uuid"
	"github.com/stretchr/testify/assert"

	"github.com/apisix/manager-api/errno"
)

var (
	c1 = uuid.NewV4()
	c2 = uuid.NewV4()
)

func TestConsumerCurd(t *testing.T) {
	//test3.com
	param := []byte(`{
	"username": "test_consumer",
    "plugins": {
        "key-auth": {
            "key": "auth-one"
        },
        "limit-count": {
            "count": 2,
            "time_window": 60,
            "rejected_code": 503,
            "key": "remote_addr"
        }
    },
	"desc": "test description"
}`)

	err := ConsumerCreate(param, c1.String())

	assert := assert.New(t)
	assert.Nil(err)

	//get item
	consumer, err := ConsumerItem(c1.String())
	assert.Nil(err)
	assert.Equal("test_consumer", consumer.Username)
	assert.Equal(2, len(consumer.Plugins))

	//duplicate username fail
	param = []byte(`{
	"username": "test_consumer",
    "plugins": {
        "key-auth": {
            "key": "auth-one"
        },
        "limit-count": {
            "count": 2,
            "time_window": 60,
            "rejected_code": 503,
            "key": "remote_addr"
        }
    },
	"desc": "test description"
}`)

	err = ConsumerCreate(param, c2.String())
	assert.NotNil(err)
	assert.Equal(errno.DuplicateUserName.Code, err.(*errno.ManagerError).Code)

	// ok
	param = []byte(`{
	"username": "test_consumer2",
    "plugins": {
        "key-auth": {
            "key": "auth-one"
        }
    },
	"desc": "test description2"
}`)

	err = ConsumerCreate(param, c2.String())
	assert.Nil(err)

	//list
	count, list, err := ConsumerList(2, 1, "")
	assert.Equal(true, count >= 2)
	assert.Equal(1, len(list))

	//update
	param = []byte(`{
	"username": "test_consumer1",
    "plugins": {
        "key-auth": {
            "key": "auth-one"
        },
        "limit-count": {
            "count": 2,
            "time_window": 60,
            "rejected_code": 503,
            "key": "remote_addr"
        }
    },
	"desc": "test description"
}`)

	err = ConsumerUpdate(param, c1.String())
	assert.Nil(err)

	consumer, _ = ConsumerItem(c1.String())
	assert.Equal("test_consumer1", consumer.Username)

	//delete
	err = ConsumerDelete(c1.String())
	assert.Nil(err)

	count2, _, err := ConsumerList(2, 1, "")
	assert.Equal(count2, count-1)

	err = ConsumerDelete(c2.String())
	assert.Nil(err)
}
