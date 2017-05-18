#!/bin/bash

curl \
-sS --insecure --ipv4 \
-X PUT \
-H "Content-Type: application/json" \
-H "Authorization: Basic YWRtaW46YWRtaW4=" \
-d '{"name": "connie'$i'", "balance": "1000", "password": "connie"}' \
"http://localhost:3000/accounts/connie" > /dev/null &&
curl \
-sS --insecure --ipv4 \
-X PUT \
-H "Content-Type: application/json" \
-H "Authorization: Basic YWRtaW46YWRtaW4=" \
-d '{"name": "connie'$i'", "balance": "1000", "password": "connie"}' \
"http://localhost:3001/accounts/connie" > /dev/null &&

for i in `seq 1 5`;
do
 curl \
   -sS --insecure --ipv4 \
   -X PUT \
   -H "Content-Type: application/json" \
   -H "Authorization: Basic YWRtaW46YWRtaW4=" \
   -d '{"name": "bob'$i'", "balance": "1000", "password": "bob"}' \
   "http://localhost:3001/accounts/bob$i" > /dev/null
 curl \
   -sS --insecure --ipv4 \
   -X PUT \
   -H "Content-Type: application/json" \
   -H "Authorization: Basic YWRtaW46YWRtaW4=" \
   -d '{"name": "alice'$i'", "balance": "1000", "password": "alice"}' \
   "http://localhost:3000/accounts/alice$i" > /dev/null
done

set -ex
