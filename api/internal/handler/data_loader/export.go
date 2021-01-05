package data_loader

import (
        "bufio"
        "encoding/json"
        "errors"
        "fmt"
        "net/http"
        "path"
        "reflect"
        "regexp"
        "strings"

        "github.com/getkin/kin-openapi/openapi3"
        "github.com/gin-gonic/gin"
        "github.com/shiningrush/droplet/data"

        "github.com/apisix/manager-api/internal/conf"
        "github.com/apisix/manager-api/internal/core/entity"
        "github.com/apisix/manager-api/internal/core/store"
        "github.com/apisix/manager-api/internal/handler"
        routeHandler "github.com/apisix/manager-api/internal/handler/route"
        "github.com/apisix/manager-api/internal/utils"
        "github.com/apisix/manager-api/internal/utils/consts"
)

type Handler struct {
        routeStore    store.Interface
        svcStore      store.Interface
        upstreamStore store.Interface
        scriptStore   store.Interface
}

func NewHandler() (handler.RouteRegister, error) {
        return &Handler{
                routeStore:    store.GetStore(store.HubKeyRoute),
                svcStore:      store.GetStore(store.HubKeyService),
                upstreamStore: store.GetStore(store.HubKeyUpstream),
                scriptStore:   store.GetStore(store.HubKeyScript),
        }, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
        r.POST("/apisix/admin/import", consts.ErrorWrapper(Import))
}

func Import(c *gin.Context) (interface{}, error) {
        file, err := c.FormFile("file")
        if err != nil {
                return nil, err
        }

        // file check
        suffix := path.Ext(file.Filename)
        if suffix != ".json" && suffix != ".yaml" && suffix != ".yml" {
                return nil, fmt.Errorf("the file type error: %s", suffix)
        }
        if file.Size > int64(conf.ImportSizeLimit) {
                return nil, fmt.Errorf("the file size exceeds the limit; limit %d", conf.ImportSizeLimit)
        }

        // read file and parse
        open, err := file.Open()
        if err != nil {
                return nil, err
        }
        defer open.Close()
        reader := bufio.NewReader(open)
        bytes := make([]byte, file.Size)
        _, _ = reader.Read(bytes)

        swagger, err := openapi3.NewSwaggerLoader().LoadSwaggerFromData(bytes)

        routes := OpenAPI3ToRoute(swagger)
        routeStore := store.GetStore(store.HubKeyRoute)
        upstreamStore := store.GetStore(store.HubKeyUpstream)
        scriptStore := store.GetStore(store.HubKeyScript)

        // check route
        for _, route := range routes {
                _, err := checkRouteName(route.Name)
                if err != nil {
                        continue
                }
                if route.ServiceID != nil {
                        _, err := routeStore.Get(utils.InterfaceToString(route.ServiceID))
                        if err != nil {
                                if err == data.ErrNotFound {
                                        return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
                                                fmt.Errorf("service id: %s not found", route.ServiceID)
                                }
                                return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, err
                        }
                }
                if route.UpstreamID != nil {
                        _, err := upstreamStore.Get(utils.InterfaceToString(route.UpstreamID))
                        if err != nil {
                                if err == data.ErrNotFound {
                                        return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
                                                fmt.Errorf("upstream id: %s not found", route.UpstreamID)
                                }
                                return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, err
                        }
                }
                if route.Script != nil {
                        if route.ID == "" {
                                route.ID = utils.GetFlakeUidStr()
                        }
                        script := &entity.Script{}
                        script.ID = utils.InterfaceToString(route.ID)
                        script.Script = route.Script
                        //to lua
                        var err error
                        route.Script, err = routeHandler.GenerateLuaCode(route.Script.(map[string]interface{}))
                        if err != nil {
                                return nil, err
                        }
                        //save original conf
                        if err = scriptStore.Create(c, script); err != nil {
                                return nil, err
                        }
                }

                if _, err := routeStore.CreateCheck(route); err != nil {
                        return handler.SpecCodeResponse(err), err
                }
        }

        // create route
        for _, route := range routes {
                if err := routeStore.Create(c, route); err != nil {
                        println(err.Error())
                        return handler.SpecCodeResponse(err), err
                }
        }

        return nil, nil
}


func checkRouteName(name string) (bool, error) {
        routeStore := store.GetStore(store.HubKeyRoute)
        ret, err := routeStore.List(store.ListInput{
                Predicate:  nil,
                PageSize:   0,
                PageNumber: 0,
        })
        if err != nil {
                return false, err
        }

        sort := store.NewSort(nil)
        filter := store.NewFilter([]string{"name", name})
        pagination := store.NewPagination(0, 0)
        query := store.NewQuery(sort, filter, pagination)
        rows := store.NewFilterSelector(routeHandler.ToRows(ret), query)
        if len(rows) > 0 {
                return false, consts.InvalidParam("route name is duplicate")
        }

        return true, nil
}

func structByReflect(data map[string]interface{}, inStructPtr interface{}) error {
        rType := reflect.TypeOf(inStructPtr)
        rVal := reflect.ValueOf(inStructPtr)
        if rType.Kind() != reflect.Ptr {
                return errors.New("inStructPtr must be ptr to struct")
        }
        rType = rType.Elem()
        rVal = rVal.Elem()

        for i := 0; i < rType.NumField(); i++ {
                t := rType.Field(i)
                f := rVal.Field(i)
                v, ok := data[t.Name]
                if !ok {
                    continue
                }

                f.Set(reflect.ValueOf(v))
        }

        return nil
}

func parseExtension(route *entity.Route, val *openapi3.Operation, upstream, emptyUpstream *entity.UpstreamDef) *entity.Route {
        fmt.Printf("v.Extensions: %s", val.Extensions)
        if up, ok := val.Extensions["x-apisix-upstream"]; ok {
                json.Unmarshal(up.(json.RawMessage), upstream)
        }

        fmt.Printf("upstream: %v, %v, %v", upstream, emptyUpstream, upstream != nil && upstream != emptyUpstream)
        if upstream != nil && upstream == emptyUpstream {
                route.Upstream = upstream
        }

        return route
}

func OpenAPI3ToRoute(swagger *openapi3.Swagger) []*entity.Route {
        var routes []*entity.Route
        //if globalUpstreams, ok := swagger.Extensions["x-apisix-upstreams"]; ok {
        //        globalUpstreams = globalUpstreams.([]map[string]interface{})
        //
        //}
        paths := swagger.Paths
        var upstream *entity.UpstreamDef
        emptyUpstream := &entity.UpstreamDef{}
        for k, v := range paths {
                upstream = &entity.UpstreamDef{}
                if up, ok := v.Extensions["x-apisix-upstream"]; ok {
                        json.Unmarshal(up.(json.RawMessage), upstream)
                }

                if v.Get != nil {
                        route := getRouteFromPaths("GET", k, v.Get, swagger)
                        route = parseExtension(route, v.Get, upstream, emptyUpstream)

                        routes = append(routes, route)
                }
                if v.Post != nil {
                        route := getRouteFromPaths("POST", k, v.Post, swagger)
                        route = parseExtension(route, v.Post, upstream, emptyUpstream)

                        routes = append(routes, route)
                }
                if v.Head != nil {
                        route := getRouteFromPaths("HEAD", k, v.Head, swagger)
                        route = parseExtension(route, v.Head, upstream, emptyUpstream)

                        routes = append(routes, route)
                }
                if v.Put != nil {
                        route := getRouteFromPaths("PUT", k, v.Put, swagger)
                        route = parseExtension(route, v.Put, upstream, emptyUpstream)

                        routes = append(routes, route)
                }
                if v.Patch != nil {
                        route := getRouteFromPaths("PATCH", k, v.Patch, swagger)
                        route = parseExtension(route, v.Patch, upstream, emptyUpstream)

                        routes = append(routes, route)
                }

                if v.Delete != nil {
                        route := getRouteFromPaths("DELETE", k, v.Delete, swagger)
                        route = parseExtension(route, v.Delete, upstream, emptyUpstream)

                        routes = append(routes, route)
                }
        }
        return routes
}

func getRouteFromPaths(method, key string, value *openapi3.Operation, swagger *openapi3.Swagger) *entity.Route {
        reg := regexp.MustCompile(`{[\w.]*\}`)
        findString := reg.FindString(key)
        if findString != "" {
                key = strings.Split(key, findString)[0] + "*"
        }
        r := &entity.Route{
                URI:     key,
                Name:    value.OperationID,
                Desc:    value.Summary,
                Methods: []string{method},
        }
        var parameters *openapi3.Parameters
        plugins := make(map[string]interface{})
        requestValidation := make(map[string]*entity.RequestValidation)
        if value.Parameters != nil {
                parameters = &value.Parameters
        }
        if parameters != nil {
                for _, v := range *parameters {
                        if v.Value.Schema != nil {
                                v.Value.Schema.Value.Format = ""
                                v.Value.Schema.Value.XML = nil
                        }
                        props := make(map[string]interface{})
                        switch v.Value.In {
                        case "header":
                                props[v.Value.Name] = v.Value.Schema.Value
                                var required []string
                                if v.Value.Required {
                                        required = append(required, v.Value.Name)
                                }
                                requestValidation["header_schema"] = &entity.RequestValidation{
                                        Type:       "object",
                                        Required:   required,
                                        Properties: props,
                                }
                                plugins["request-validation"] = requestValidation
                        }
                }
        }

        if value.RequestBody != nil {
                vars := make([]interface{}, 0)
                schema := value.RequestBody.Value.Content
                for k, v := range schema {
                        item := []string{"http_Content-type", "==", ""}
                        item[2] = k
                        vars = append(vars, item)
                        if v.Schema.Ref != "" {
                                s := getParameters(v.Schema.Ref, &swagger.Components).Value
                                requestValidation["body_schema"] = &entity.RequestValidation{
                                        Type:       s.Type,
                                        Required:   s.Required,
                                        Properties: s.Properties,
                                }
                                plugins["request-validation"] = requestValidation
                        } else if v.Schema.Value != nil {
                                if v.Schema.Value.Properties != nil {
                                        for k1, v1 := range v.Schema.Value.Properties {
                                                if v1.Ref != "" {
                                                        s := getParameters(v1.Ref, &swagger.Components)
                                                        v.Schema.Value.Properties[k1] = s
                                                }
                                                v1.Value.Format = ""
                                        }
                                        requestValidation["body_schema"] = &entity.RequestValidation{
                                                Type:       v.Schema.Value.Type,
                                                Required:   v.Schema.Value.Required,
                                                Properties: v.Schema.Value.Properties,
                                        }
                                        plugins["request-validation"] = requestValidation
                                } else if v.Schema.Value.Items != nil {
                                        if v.Schema.Value.Items.Ref != "" {
                                                s := getParameters(v.Schema.Value.Items.Ref, &swagger.Components).Value
                                                requestValidation["body_schema"] = &entity.RequestValidation{
                                                        Type:       s.Type,
                                                        Required:   s.Required,
                                                        Properties: s.Properties,
                                                }
                                                plugins["request-validation"] = requestValidation
                                        }
                                } else {
                                        requestValidation["body_schema"] = &entity.RequestValidation{
                                                Type:       "object",
                                                Required:   []string{},
                                                Properties: v.Schema.Value.Properties,
                                        }
                                }
                        }
                        plugins["request-validation"] = requestValidation
                }
                r.Vars = vars
        }

        if value.Security != nil {
                p := &entity.SecurityPlugin{}
                for _, v := range *value.Security {
                        for v1 := range v {
                                switch v1 {
                                case "api_key":
                                        plugins["key-auth"] = p
                                case "basicAuth":
                                        plugins["basic-auth"] = p
                                case "bearerAuth":
                                        plugins["jwt-auth"] = p
                                }
                        }
                }
        }
        r.Plugins = plugins

        fmt.Printf("r: %v", r)
        return r
}

func getParameters(ref string, components *openapi3.Components) *openapi3.SchemaRef {
        schemaRef := &openapi3.SchemaRef{}
        arr := strings.Split(ref, "/")
        if arr[0] == "#" && arr[1] == "components" && arr[2] == "schemas" {
                schemaRef = components.Schemas[arr[3]]
                schemaRef.Value.XML = nil
                // traverse properties to find another ref
                for k, v := range schemaRef.Value.Properties {
                        if v.Value != nil {
                                v.Value.XML = nil
                                v.Value.Format = ""
                        }
                        if v.Ref != "" {
                                schemaRef.Value.Properties[k] = getParameters(v.Ref, components)
                        } else if v.Value.Items != nil && v.Value.Items.Ref != "" {
                                v.Value.Items = getParameters(v.Value.Items.Ref, components)
                        } else if v.Value.Items != nil && v.Value.Items.Value != nil {
                                v.Value.Items.Value.XML = nil
                                v.Value.Items.Value.Format = ""
                        }
                }
        }
        return schemaRef
}
