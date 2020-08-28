package route

import (
	"net/http"
	"testing"
)

func TestRouteGroupCurd(t *testing.T) {
	// create ok
	handler.
		Post(uriPrefix+"/routegroups").
		Header("Authorization", token).
		JSON(`{
			"name": "routegroup_test",
			"description": "test description"
		}`).
		Expect(t).
		Status(http.StatusOK).
		End()

	//c1, _ := service.GetConsumerByUserName("e2e_test_consumer1")
	id := "8954a39b-330e-4b85-89f5-d1bbfd785b5b"
	//update ok
	handler.
		Put(uriPrefix+"/routegroups/"+id).
		Header("Authorization", token).
		JSON(`{
			"name": "routegroup_test2",
			"description": "test description"
		}`).
		Expect(t).
		Status(http.StatusOK).
		End()
	// duplicate username
	handler.
		Post(uriPrefix+"/routegroups").
		Header("Authorization", token).
		JSON(`{
			"name": "routegroup_test",
			"description": "test description"
		}`).
		Expect(t).
		Status(http.StatusInternalServerError).
		End()
}
