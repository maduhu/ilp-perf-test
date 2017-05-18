#!/bin/bash -x

# Name of the docker images
DOCKER_IMAGE_NAME_LEDGER="fb-ledger-perf-test"
DOCKER_IMAGE_NAME_CONNECTOR="ilp-connector-perf-test"
DOCKER_IMAGE_NAME_SPSPCLIENT="spsp-client-perf-test"
DOCKER_IMAGE_NAME_SPSPSERVER="spsp-server-perf-test"
DOCKER_IMAGE_NAME_SPSPBACKEND="spsp-backend"

# 1) Start Ledgers
L1CID=$(docker run --network ilp-perf-test-net --name ledger1 --env-file ledger.env -p 3000:3000 -itd $DOCKER_IMAGE_NAME_LEDGER)
L2CID=$(docker run --network ilp-perf-test-net --name ledger2 --env-file ledger2.env -p 3001:3001 -itd $DOCKER_IMAGE_NAME_LEDGER)
sleep 5 # wait until ledgers have started
./scripts/createAccounts.sh

# 2) Start Connector
CCID=$(docker run --network ilp-perf-test-net --name connector --env-file connector.env -itd $DOCKER_IMAGE_NAME_CONNECTOR)

# 3) Start SPSP-Client & -Server
CLIENTCID=$(docker run --network ilp-perf-test-net --name spsp-client --env-file spspclient.env -p 3333:3333 -itd $DOCKER_IMAGE_NAME_SPSPCLIENT)
SERVERCID=$(docker run --network ilp-perf-test-net --name spsp-server --env-file spspserver.env -p 3332:3332 -itd $DOCKER_IMAGE_NAME_SPSPSERVER)
BACKENDCID=$(docker run --network ilp-perf-test-net --name spsp-backend -p 6666:6666 -itd $DOCKER_IMAGE_NAME_SPSPBACKEND)
# TODO Backend

echo "Started. Press any key to exit"
read

### Stop docker images ###
docker kill $L1CID $L2CID $CCID $CLIENTCID $SERVERCID $BACKENDCID
docker rm $L1CID $L2CID $CCID $CLIENTCID $SERVERCID $BACKENDCID
