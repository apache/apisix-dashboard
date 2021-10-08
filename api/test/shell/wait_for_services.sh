#!/usr/bin/env bash

i=1
timeout=60
while ! curl -s 127.0.0.1:12800 >/dev/null; do
  if [[ "$i" -gt "$timeout" ]]; then
    echo "timeout occurred after waiting $timeout seconds"
    exit 1
  fi
  sleep 1
  echo "waited skywalking for $i seconds.."
  ((i++));
done
