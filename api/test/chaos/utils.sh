port_forward() {
    nohup kubectl port-forward svc/apisix 9080:9080 >/dev/null 2>&1 &
    nohup kubectl port-forward svc/apisix 9091:9091 >/dev/null 2>&1 &
    nohup kubectl port-forward svc/apisix 9443:9443 >/dev/null 2>&1 &
    nohup kubectl port-forward svc/apisix2 9081:9081 >/dev/null 2>&1 &
    nohup kubectl port-forward svc/managerapi 9000:9000 >/dev/null 2>&1 &
    nohup kubectl port-forward svc/upstream 1980:1980 >/dev/null 2>&1 &
    nohup kubectl port-forward svc/upstream 1981:1981 >/dev/null 2>&1 &
    nohup kubectl port-forward svc/upstream 1982:1982 >/dev/null 2>&1 &
    nohup kubectl port-forward svc/upstream 1983:1983 >/dev/null 2>&1 &
    nohup kubectl port-forward svc/upstream 1984:1984 >/dev/null 2>&1 &
}

kill_port_forward() {
    for proc in $(pgrep -f port-forward); do kill $proc; done
}

"$@"
