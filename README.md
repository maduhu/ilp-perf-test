# ilp-perf-test

# Overview

This repo contains performance test scripts for the Level One Project (L1P). The performance test demonstrates that the ILP modules developed by Ripple as part of the L1P do meet the performance target of processing 50 payments per second over the course of an hour.

# Installation

1. **Prepare Docker Images.** Clone the following repositories: ilp-service/branch/perf-test, five-bells-ledger/branch/da-perf-test, ilp-connector, and spsp-backend. Now, switch into each of the cloned repos and build a docker image:
```
# cd into five-bells-ledger
docker build . -t fb-ledger-perf-test
# cd into ilp-connector
docker build . -t ilp-connector-perf-test
# cd into ilp-service
docker build . -t ilp-service-perf-test
# cd into spsp-backend
docker build . -t spsp-backend-perf-test
```

2. **Setup Docker Network.** Setup the test network used by docker by running `scripts/setupNetwork.sh`.

3. **Start Docker Images.** ILP components (e.g. `ilp-connector`, `ilp-service` etc.)used in the test Start the docker image the script `start-all.sh`. After the test is done, press enter and the script will clean up the docker instances.

4. **Run Performance Test.** To start the performance test run:

```
npm install
node index.js
```

This program will send 53 payments per seconds for the duration of 70 minutes. At the end of the test run, the program reports how many payments per seconds succeeded.

5. **Plog Result.** Optional. You can print a nice graph showing payments/second with the script `plot.py`