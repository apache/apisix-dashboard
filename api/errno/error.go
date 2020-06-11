package errno

import (
	"encoding/json"
	"fmt"
)

type Message struct {
	Code string
	Msg  string
}

var (
	//AA 01 表示api-manager-api
	//BB 00 系统b部信息
	SystemSuccess   = Message{"010000", "success"}
	SystemError     = Message{"010001", "system error"}
	BadRequestError = Message{Code: "010002", Msg: "请求格式错误"}
	NotFoundError   = Message{Code: "010003", Msg: "没有找到资源"}

	//BB 01表示配置信息
	ConfEnvError      = Message{"010101", "找不到环境变量: %s"}
	ConfFilePathError = Message{"010102", "加载配置文件出错: %s"}

	// BB 02 路由模块
	RouteRequestError      = Message{"010201", "路由请求参数有异常: %s"}
	ApisixRouteCreateError = Message{"010202", "创建APISIX路由失败: %s"}
	DBRouteCreateError     = Message{"010203", "路由入库失败: %s"}
	ApisixRouteUpdateError = Message{"010204", "更新APISIX路由失败: %s"}
	ApisixRouteDeleteError = Message{"010205", "删除APISIX路由失败: %s"}
	DBRouteUpdateError     = Message{"010206", "路由更新失败: %s"}
	DBRouteDeleteError     = Message{"010207", "路由删除失败: %s"}

	// 03 插件模块
	ApisixPluginListError   = Message{"010301", "查询APISIX插件列表失败: %s"}
	ApisixPluginSchemaError = Message{"010301", "查询APISIX插件schema失败: %s"}
)

type Api7Error struct {
	TraceId string
	Code    string
	Msg     string
	Data    interface{}
}

//toString 错误日志
func (e *Api7Error) Error() string {
	//return fmt.Sprintf("TraceId: %s, Code: %s, Msg: %s", e.TraceId, e.Code, e.Msg)
	return e.Msg
}

func FromMessage(m Message, args ...interface{}) *Api7Error {
	return &Api7Error{TraceId: "", Code: m.Code, Msg: fmt.Sprintf(m.Msg, args...)}
}

func (e *Api7Error) Response() map[string]interface{} {
	return map[string]interface{}{
		"code": e.Code,
		"msg":  e.Msg,
	}
}

func (e *Api7Error) ItemResponse(data interface{}) map[string]interface{} {
	return map[string]interface{}{
		"code": e.Code,
		"msg":  e.Msg,
		"data": data,
	}
}

func (e *Api7Error) ListResponse(count, list interface{}) map[string]interface{} {
	return map[string]interface{}{
		"code":  e.Code,
		"msg":   e.Msg,
		"count": count,
		"list":  list,
	}
}

func Success() []byte {
	w := FromMessage(SystemSuccess).Response()
	result, _ := json.Marshal(w)
	return result
}
