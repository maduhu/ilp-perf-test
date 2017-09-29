#!/bin/bash -x

# Name of the docker images
DOCKER_IMAGE_NAME_LEDGER="fb-ledger-perf-test"
DOCKER_IMAGE_NAME_CONNECTOR="ilp-connector-perf-test"
DOCKER_IMAGE_NAME_ILPSERVICE="ilp-service-perf-test"
DOCKER_IMAGE_NAME_SPSPBACKEND="spsp-backend-perf-test"

# 1) Start Ledgers
L1CID=$(docker run --network ilp-perf-test-net --name ledger1-perf-test --env-file ledger.env -p 3000:3000 -itd $DOCKER_IMAGE_NAME_LEDGER)
L2CID=$(docker run --network ilp-perf-test-net --name ledger2-perf-test --env-file ledger2.env -p 3001:3001 -itd $DOCKER_IMAGE_NAME_LEDGER)
sleep 5 # wait until ledgers have started
./scripts/createAccounts.sh

# 2) Start Connector
CCID=$(docker run --network ilp-perf-test-net --name connector-perf-test --env-file connector.env -itd $DOCKER_IMAGE_NAME_CONNECTOR)

# 3) Start SPSP-Client & -Server
S1CID=$(docker run --network ilp-perf-test-net --name ilpservice1-perf-test --env-file ilp-service.env -p 3333:3333 -itd $DOCKER_IMAGE_NAME_ILPSERVICE)
S2CID=$(docker run --network ilp-perf-test-net --name ilpservice2-perf-test --env-file ilp-service2.env -p 3332:3332 -itd $DOCKER_IMAGE_NAME_ILPSERVICE)
BACKENDCID=$(docker run --network ilp-perf-test-net --name spsp-backend-perf-test -p 6666:6666 -itd $DOCKER_IMAGE_NAME_SPSPBACKEND)

echo "Started. Press any key to exit"
read

### Stop docker images ###
docker kill $L1CID $L2CID $CCID $S1CID $S2CID $BACKENDCID
docker rm $L1CID $L2CID $CCID $S1CID $S2CID $BACKENDCID
