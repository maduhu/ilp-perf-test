'use strict'

const http = require('http')
const request = require('request')
const uuid = require('uuid')
const co = require('co')
const chalk = require('chalk')

const REQUESTS_PER_SECOND = 52
const DURATION = 70 * 60 * 1000 // minutes
let requests = 0
let responses = 0
let errors = 0

const LEDGER_HOST = '172.88.0.1'
const SPSP_SERVER_HOST = '172.88.0.1'

let ACCOUNTS = [
  {
    from: 'alice1',
    to: 'bob1'
  },
  {
    from: 'alice2',
    to: 'bob2'
  },
  {
    from: 'alice3',
    to: 'bob3'
  },
  {
    from: 'alice4',
    to: 'bob4'
  },
  {
    from: 'alice5',
    to: 'bob5'
  }
]

const customAgent = new http.Agent({ keepAlive: true, maxSockets: 1500 })

co(function * () {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

  // query SPSP server so that it creates receivers
  for (const a of ACCOUNTS) {
    query(a.to)
  }

  // warm up phase
  console.log(chalk.green('starting warm up'))
  yield sendPeriodically(10, 60000)
  console.log(chalk.green('ending warm up'))

  resetMetrics()

  // perodically send payments
  console.log(chalk.green('starting performance test'))
  const result = yield sendPeriodically(REQUESTS_PER_SECOND, DURATION)
  console.log(chalk.green('ending performance test'))

  // print results
  setTimeout(function () {
    console.log('Requests sent: ', requests)
    console.log('Responses sent: ', responses)
    console.log('Errors: ', errors)
    console.log(JSON.stringify(result))
  }, 10 * 1000)
})

function * sendPeriodically (reqsPerSecond, duration) {
  const intervals = []
  for (const a of ACCOUNTS) {
    const interval = setInterval(function () {
      sendPayment(a.from, a.to)
    }, 1000 / reqsPerSecond * Object.keys(ACCOUNTS).length)
    intervals.push(interval)
    yield sleep(41) // wait a little so that not all intervals start at the same time to avoid sending in bursts
  }

  // print the number of payments per second
  let lastResponseCount = 0
  const measureInterval = 5 // every x seconds
  let completedPaymentsPerInterval = []
  intervals.push(setInterval(function () {
    const completedPayments = (responses - lastResponseCount) / measureInterval
    console.log('Payments/second: ', completedPayments)
    lastResponseCount = responses
    completedPaymentsPerInterval.push(completedPayments)
  }, measureInterval * 1000))

  yield sleep(duration)
  intervals.forEach((i) => clearInterval(i))

  return {measureInterval, completedPaymentsPerInterval}
}

function sendPayment (from, to) {
  requests += 1
  const id = uuid()

  request.put(`http://localhost:3333/v1/payments/` + id, {
    agent: customAgent,
    json: {
      receiver: `http://${SPSP_SERVER_HOST}:3332/v1/spsp/` + to,
      id: id,
      sourceAmount: 0.01,
      destinationAmount: 0.0000000001,
      sourceAccount: `http://${LEDGER_HOST}:3000/accounts/` + from,
      sourceIdentifier: 'payment request ' + requests
    }}, function (error, response, body) {
      if (error) {
        console.log('error', error)
        errors += 1
      } else if (response) {
        responses += 1
      }
    })
}

function * query (user) {
  yield request.get(`http://localhost:3333/v1/query?receiver=http://${SPSP_SERVER_HOST}:3332/v1/spsp/` + user)
}

function * sleep (time) {
  yield new Promise((resolve) => setTimeout(resolve, time))
}

function getBalance (user) {
  request.get(`http://${LEDGER_HOST}:3000/accounts/` + user, {
    auth: {
      user: 'admin',
      pass: 'admin'
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error getting the balance ', error)
    }
    console.log(response.body)
  })
}

function resetMetrics () {
  requests = 0
  errors = 0
  responses = 0
}
