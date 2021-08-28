package stream_route

import (
	"errors"
	"fmt"
	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"net/http"
	"testing"
)

func TestHandler_Get(t *testing.T) {
	tests := []struct {
		caseDesc   string
		giveInput  *GetInput
		giveErr    error
		giveRet    interface{}
		wantErr    error
		wantGetKey string
		wantRet    interface{}
	}{
		{
			caseDesc:  "get stream route with upstream id",
			giveInput: &GetInput{ID: "sr1"},
			giveRet: &entity.StreamRoute{
				BaseInfo:   entity.BaseInfo{ID: "sr1"},
				RemoteAddr: "127.0.0.1",
				ServerAddr: "127.0.0.1",
				ServerPort: 9090,
				Sni:        "test.com",
				Upstream:   nil,
				UpstreamID: "u1",
			},
			wantGetKey: "sr1",
			wantRet: &entity.StreamRoute{
				BaseInfo:   entity.BaseInfo{ID: "sr1"},
				RemoteAddr: "127.0.0.1",
				ServerAddr: "127.0.0.1",
				ServerPort: 9090,
				Sni:        "test.com",
				Upstream:   nil,
				UpstreamID: "u1",
			},
		}, {
			caseDesc:  "get stream route with upstream",
			giveInput: &GetInput{ID: "sr2"},
			giveRet: &entity.StreamRoute{
				BaseInfo:   entity.BaseInfo{ID: "sr2"},
				RemoteAddr: "127.0.0.1",
				ServerAddr: "127.0.0.1",
				ServerPort: 9090,
				Sni:        "test.com",
				Upstream: &entity.UpstreamDef{
					Nodes: map[string]int{"127.0.0.1": 1},
					Type:  "roundrobin",
				},
				UpstreamID: "",
			},
			wantGetKey: "sr2",
			wantRet: &entity.StreamRoute{
				BaseInfo:   entity.BaseInfo{ID: "sr2"},
				RemoteAddr: "127.0.0.1",
				ServerAddr: "127.0.0.1",
				ServerPort: 9090,
				Sni:        "test.com",
				Upstream: &entity.UpstreamDef{
					Nodes: map[string]int{"127.0.0.1": 1},
					Type:  "roundrobin",
				},
				UpstreamID: "",
			},
		},
		{
			caseDesc:   "get stream route not exist",
			giveInput:  &GetInput{ID: "sr3"},
			giveRet:    &data.SpecCodeResponse{Response: data.Response{Code: 0}, StatusCode: 404},
			giveErr:    errors.New("not found"),
			wantGetKey: "sr3",
			wantRet:    &data.SpecCodeResponse{Response: data.Response{Code: 0}, StatusCode: 404},
			wantErr:    errors.New("not found"),
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			mStore := &store.MockInterface{}
			mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				assert.Equal(t, tc.wantGetKey, args.Get(0))
			}).Return(tc.giveRet, tc.giveErr)

			h := Handler{streamRouteStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Get(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantErr, err)
			assert.Equal(t, tc.wantRet, ret)
		})
	}
}

func TestStreamRoute_List(t *testing.T) {

	giveData := []*entity.StreamRoute{
		{BaseInfo: entity.BaseInfo{CreateTime: 1609376663}, RemoteAddr: "127.0.0.1", ServerAddr: "127.0.0.1", ServerPort: 9090, Upstream: nil, UpstreamID: "u1"},
		{BaseInfo: entity.BaseInfo{CreateTime: 1609376664}, RemoteAddr: "127.0.0.2", ServerAddr: "127.0.0.1", ServerPort: 9091, Upstream: nil, UpstreamID: "u1"},
		{BaseInfo: entity.BaseInfo{CreateTime: 1609376665}, RemoteAddr: "127.0.0.3", ServerAddr: "127.0.0.1", ServerPort: 9092, Upstream: nil, UpstreamID: "u1"},
		{BaseInfo: entity.BaseInfo{CreateTime: 1609376666}, RemoteAddr: "127.0.0.4", ServerAddr: "127.0.0.1", ServerPort: 9093, Upstream: nil, UpstreamID: "u1"},
	}
	tests := []struct {
		caseDesc  string
		giveInput *ListInput
		giveData  []*entity.StreamRoute
		giveErr   error
		wantErr   error
		wantInput store.ListInput
		wantRet   interface{}
	}{
		{
			caseDesc: "list all stream route",
			giveInput: &ListInput{
				Pagination: store.Pagination{
					PageSize:   10,
					PageNumber: 10,
				},
			},
			wantInput: store.ListInput{
				PageSize:   10,
				PageNumber: 10,
			},
			giveData: giveData,
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					&entity.StreamRoute{BaseInfo: entity.BaseInfo{CreateTime: 1609376663}, RemoteAddr: "127.0.0.1", ServerAddr: "127.0.0.1", ServerPort: 9090, Upstream: nil, UpstreamID: "u1"},
					&entity.StreamRoute{BaseInfo: entity.BaseInfo{CreateTime: 1609376664}, RemoteAddr: "127.0.0.2", ServerAddr: "127.0.0.1", ServerPort: 9091, Upstream: nil, UpstreamID: "u1"},
					&entity.StreamRoute{BaseInfo: entity.BaseInfo{CreateTime: 1609376665}, RemoteAddr: "127.0.0.3", ServerAddr: "127.0.0.1", ServerPort: 9092, Upstream: nil, UpstreamID: "u1"},
					&entity.StreamRoute{BaseInfo: entity.BaseInfo{CreateTime: 1609376666}, RemoteAddr: "127.0.0.4", ServerAddr: "127.0.0.1", ServerPort: 9093, Upstream: nil, UpstreamID: "u1"},
				},
				TotalSize: 4,
			},
		},
		{
			caseDesc: "list stream route with 'remote_addr'",
			giveInput: &ListInput{
				RemoteAddr: "127.0.0.1",
				Pagination: store.Pagination{
					PageSize:   10,
					PageNumber: 10,
				},
			},
			wantInput: store.ListInput{
				PageSize:   10,
				PageNumber: 10,
			},
			giveData: giveData,
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					&entity.StreamRoute{BaseInfo: entity.BaseInfo{CreateTime: 1609376663}, RemoteAddr: "127.0.0.1", ServerAddr: "127.0.0.1", ServerPort: 9090, Upstream: nil, UpstreamID: "u1"},
				},
				TotalSize: 1,
			},
		},
		{
			caseDesc: "list stream route with server_addr",
			giveInput: &ListInput{
				ServerAddr: "127.0.0.1",
				Pagination: store.Pagination{
					PageSize:   10,
					PageNumber: 10,
				},
			},
			wantInput: store.ListInput{
				PageSize:   10,
				PageNumber: 10,
			},
			giveData: giveData,
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					&entity.StreamRoute{BaseInfo: entity.BaseInfo{CreateTime: 1609376663}, RemoteAddr: "127.0.0.1", ServerAddr: "127.0.0.1", ServerPort: 9090, Upstream: nil, UpstreamID: "u1"},
					&entity.StreamRoute{BaseInfo: entity.BaseInfo{CreateTime: 1609376664}, RemoteAddr: "127.0.0.2", ServerAddr: "127.0.0.1", ServerPort: 9091, Upstream: nil, UpstreamID: "u1"},
					&entity.StreamRoute{BaseInfo: entity.BaseInfo{CreateTime: 1609376665}, RemoteAddr: "127.0.0.3", ServerAddr: "127.0.0.1", ServerPort: 9092, Upstream: nil, UpstreamID: "u1"},
					&entity.StreamRoute{BaseInfo: entity.BaseInfo{CreateTime: 1609376666}, RemoteAddr: "127.0.0.4", ServerAddr: "127.0.0.1", ServerPort: 9093, Upstream: nil, UpstreamID: "u1"},
				},
				TotalSize: 4,
			},
		},
		{
			caseDesc: "list stream route with server_port",
			giveInput: &ListInput{
				ServerPort: 9092,
				Pagination: store.Pagination{
					PageSize:   10,
					PageNumber: 10,
				},
			},
			wantInput: store.ListInput{
				PageSize:   10,
				PageNumber: 10,
			},
			giveData: giveData,
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					&entity.StreamRoute{BaseInfo: entity.BaseInfo{CreateTime: 1609376665}, RemoteAddr: "127.0.0.3", ServerAddr: "127.0.0.1", ServerPort: 9092, Upstream: nil, UpstreamID: "u1"},
				},
				TotalSize: 1,
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := true
			mStore := &store.MockInterface{}
			mStore.On("List", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(0).(store.ListInput)
				assert.Equal(t, tc.wantInput.PageSize, input.PageSize)
				assert.Equal(t, tc.wantInput.PageNumber, input.PageNumber)
			}).Return(func(input store.ListInput) *store.ListOutput {
				var returnData []interface{}
				for _, c := range tc.giveData {
					if input.Predicate(c) {
						if input.Format == nil {
							returnData = append(returnData, c)
							continue
						}

						returnData = append(returnData, input.Format(c))
					}
				}
				return &store.ListOutput{
					Rows:      returnData,
					TotalSize: len(returnData),
				}
			}, tc.giveErr)

			h := Handler{streamRouteStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.List(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestStreamRoute_Create(t *testing.T) {
	tests := []struct {
		caseDesc      string
		getCalled     bool
		giveInput     *entity.StreamRoute
		giveRet       interface{}
		giveErr       error
		wantInput     *entity.StreamRoute
		wantErr       error
		wantRet       interface{}
		upstreamInput string
		upstreamRet   interface{}
		upstreamErr   interface{}
		nameExistRet  []interface{}
	}{
		{
			caseDesc:  "create success",
			getCalled: true,
			giveInput: &entity.StreamRoute{
				RemoteAddr: "127.0.0.1",
				ServerAddr: "127.0.0.1",
				ServerPort: 9090,
				UpstreamID: "u1",
			},
			wantInput: &entity.StreamRoute{
				RemoteAddr: "127.0.0.1",
				ServerAddr: "127.0.0.1",
				ServerPort: 9090,
				UpstreamID: "u1",
			},
			upstreamInput: "u1",
			upstreamRet: entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
			},
		},
		{
			caseDesc:  "create failed, upstream not found",
			getCalled: false,
			giveInput: &entity.StreamRoute{
				RemoteAddr: "127.0.0.1",
				ServerAddr: "127.0.0.1",
				ServerPort: 9090,
				UpstreamID: "u1",
			},
			wantInput: &entity.StreamRoute{
				RemoteAddr: "127.0.0.1",
				ServerAddr: "127.0.0.1",
				ServerPort: 9090,
				UpstreamID: "u1",
			},
			wantErr:       fmt.Errorf("upstream id: u1 not found"),
			wantRet:       &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			upstreamInput: "u1",
			upstreamErr:   data.ErrNotFound,
		},
		{
			caseDesc:  "create failed, upstream return error",
			getCalled: false,
			giveInput: &entity.StreamRoute{
				RemoteAddr: "127.0.0.1",
				ServerAddr: "127.0.0.1",
				ServerPort: 9090,
				UpstreamID: "u1",
			},
			wantInput: &entity.StreamRoute{
				RemoteAddr: "127.0.0.1",
				ServerAddr: "127.0.0.1",
				ServerPort: 9090,
				UpstreamID: "u1",
			},
			wantErr:       fmt.Errorf("unknown error"),
			wantRet:       &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			upstreamInput: "u1",
			upstreamErr:   fmt.Errorf("unknown error"),
		},
		{
			caseDesc:  "create failed, create return error",
			getCalled: true,
			giveInput: &entity.StreamRoute{
				RemoteAddr: "127.0.0.1",
				ServerAddr: "127.0.0.1",
				ServerPort: 9090,
				UpstreamID: "u1",
			},
			giveErr: fmt.Errorf("create failed"),
			wantInput: &entity.StreamRoute{
				RemoteAddr: "127.0.0.1",
				ServerAddr: "127.0.0.1",
				ServerPort: 9090,
				UpstreamID: "u1",
			},
			upstreamInput: "u1",
			upstreamRet: entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
			},
			wantErr: fmt.Errorf("create failed"),
			wantRet: handler.SpecCodeResponse(fmt.Errorf("create failed")),
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			streamRouteStore := &store.MockInterface{}
			streamRouteStore.On("Create", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).(*entity.StreamRoute)
				assert.Equal(t, tc.wantInput, input)
			}).Return(tc.giveRet, tc.giveErr)

			upstreamStore := &store.MockInterface{}
			upstreamStore.On("Get", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				id := args.Get(0).(string)
				assert.Equal(t, tc.upstreamInput, id)
			}).Return(tc.upstreamRet, tc.upstreamErr)

			streamRouteStore.On("List", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
			}).Return(func(input store.ListInput) *store.ListOutput {
				return &store.ListOutput{
					Rows:      tc.nameExistRet,
					TotalSize: len(tc.nameExistRet),
				}
			}, nil)

			h := Handler{streamRouteStore: streamRouteStore, upstreamStore: upstreamStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Create(ctx)
			assert.Equal(t, tc.getCalled, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestStreamRoute_Update(t *testing.T) {
	tests := []struct {
		caseDesc      string
		getCalled     bool
		giveInput     *UpdateInput
		giveErr       error
		giveRet       interface{}
		wantInput     *entity.StreamRoute
		wantErr       error
		wantRet       interface{}
		upstreamInput string
		upstreamRet   interface{}
		upstreamErr   interface{}
		nameExistRet  []interface{}
	}{
		{
			caseDesc:  "create success",
			getCalled: true,
			giveInput: &UpdateInput{
				ID: "sr1",
				StreamRoute: entity.StreamRoute{
					RemoteAddr: "127.0.0.1",
					ServerAddr: "127.0.0.1",
					ServerPort: 9090,
					UpstreamID: "u1",
				},
			},
			wantInput: &entity.StreamRoute{
				BaseInfo: entity.BaseInfo{
					ID: "sr1",
				},
				RemoteAddr: "127.0.0.1",
				ServerAddr: "127.0.0.1",
				ServerPort: 9090,
				UpstreamID: "u1",
			},
			upstreamInput: "u1",
			upstreamRet: entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
			},
		},
		{
			caseDesc: "create failed, different id",
			giveInput: &UpdateInput{
				ID: "sr1",
				StreamRoute: entity.StreamRoute{
					BaseInfo: entity.BaseInfo{
						ID: "sr2",
					},
					RemoteAddr: "127.0.0.1",
					ServerAddr: "127.0.0.1",
					ServerPort: 9090,
					UpstreamID: "u1",
				},
			},
			wantRet: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr: fmt.Errorf("ID on path (sr1) doesn't match ID on body (sr2)"),
		},
		{
			caseDesc: "update failed, upstream not found",
			giveInput: &UpdateInput{
				ID: "sr1",
				StreamRoute: entity.StreamRoute{
					RemoteAddr: "127.0.0.1",
					ServerAddr: "127.0.0.1",
					ServerPort: 9090,
					UpstreamID: "u1",
				},
			},
			wantInput: &entity.StreamRoute{
				RemoteAddr: "127.0.0.1",
				ServerAddr: "127.0.0.1",
				ServerPort: 9090,
				UpstreamID: "u1",
			},
			wantErr:       fmt.Errorf("upstream id: u1 not found"),
			wantRet:       &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			upstreamInput: "u1",
			upstreamErr:   data.ErrNotFound,
		},
		{
			caseDesc: "update failed, upstream return error",
			giveInput: &UpdateInput{
				ID: "sr1",
				StreamRoute: entity.StreamRoute{
					RemoteAddr: "127.0.0.1",
					ServerAddr: "127.0.0.1",
					ServerPort: 9090,
					UpstreamID: "u1",
				},
			},
			wantInput: &entity.StreamRoute{
				RemoteAddr: "127.0.0.1",
				ServerAddr: "127.0.0.1",
				ServerPort: 9090,
				UpstreamID: "u1",
			},
			wantErr:       fmt.Errorf("unknown error"),
			wantRet:       &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			upstreamInput: "u1",
			upstreamErr:   fmt.Errorf("unknown error"),
		},
		{
			caseDesc:  "update failed, update return error",
			getCalled: true,
			giveInput: &UpdateInput{
				ID: "sr1",
				StreamRoute: entity.StreamRoute{
					RemoteAddr: "127.0.0.1",
					ServerAddr: "127.0.0.1",
					ServerPort: 9090,
					UpstreamID: "u1",
				},
			},
			giveErr:       fmt.Errorf("update failed"),
			upstreamInput: "u1",
			upstreamRet: entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
			},
			wantInput: &entity.StreamRoute{
				BaseInfo:   entity.BaseInfo{ID: "sr1"},
				RemoteAddr: "127.0.0.1",
				ServerAddr: "127.0.0.1",
				ServerPort: 9090,
				UpstreamID: "u1",
			},
			wantErr: fmt.Errorf("update failed"),
			wantRet: handler.SpecCodeResponse(fmt.Errorf("update failed")),
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			streamRouteStore := &store.MockInterface{}
			streamRouteStore.On("Update", mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).(*entity.StreamRoute)
				createIfNotExist := args.Get(2).(bool)
				assert.Equal(t, tc.wantInput, input)
				assert.True(t, createIfNotExist)
			}).Return(tc.giveRet, tc.giveErr)

			upstreamStore := &store.MockInterface{}
			upstreamStore.On("Get", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				id := args.Get(0).(string)
				assert.Equal(t, tc.upstreamInput, id)
			}).Return(tc.upstreamRet, tc.upstreamErr)

			streamRouteStore.On("List", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
			}).Return(func(input store.ListInput) *store.ListOutput {
				return &store.ListOutput{
					Rows:      tc.nameExistRet,
					TotalSize: len(tc.nameExistRet),
				}
			}, nil)

			h := Handler{streamRouteStore: streamRouteStore, upstreamStore: upstreamStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Update(ctx)
			assert.Equal(t, tc.getCalled, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}
