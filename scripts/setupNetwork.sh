#!/bin/bash -ex

docker network create -d bridge --subnet 172.88.0.0/16 ilp-perf-test-net
