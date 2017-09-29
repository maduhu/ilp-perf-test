# ilp-perf-test

# Overview

This repo contains performance test scripts for the Level One Project (L1P). The performance test demonstrates that the ILP modules developed by Ripple as part of the L1P do meet the performance target of processing 50 payments per second over the course of an hour.

# Executing The Performance Test

1. **Prepare Docker Images.** Clone the following repositories: [ilp-service](https://github.com/LevelOneProject/ilp-service/tree/da-perf-test), [five-bells-ledger](https://github.com/interledgerjs/five-bells-ledger/tree/da-perf-test), [ilp-connector](https://github.com/interledgerjs/ilp-connector/), and [spsp-backend](https://github.com/dappelt/spsp-backent). Now, switch into each of the cloned repos and build a docker image:
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

2. **Setup Docker Network.** If you run the performance test for the first time, setup the test network used by docker by executing `scripts/setupNetwork.sh`.

3. **Start Docker Images.** ILP components (e.g. `ilp-connector`, `ilp-service` etc.)used in the test Start the docker image the script `start-all.sh`. After the test is done, press enter and the script will clean up the docker instances.

4. **Run Performance Test.** To start the performance test run:

```
npm install
node index.js
```

This program will send 53 payments per seconds for the duration of 70 minutes. At the end of the test run, the program reports how many payments per seconds succeeded.

5. **Plog Result.** Optional. You can print a nice graph showing payments/second with the script `plot.py`