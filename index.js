'use strict'

const http = require('http')
const request = require('superagent')
const uuid = require('uuid')
const co = require('co')
const chalk = require('chalk')
const moment = require('moment')

const REQUESTS_PER_SECOND = 53
const DURATION = 70 * 60 * 1000 // minutes
let requests = 0
let responses = 0
let errors = 0

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

function * requestIpr (to) {
  const res = yield request
    .post('http://localhost:3332/createIPR')
    .send({
      paymentId: uuid(),
      destinationAccount: 'http://localhost:3001/accounts/' + to,
      destinationAmount: '0.000001',
      expiresAt: moment().add(1, 'days').toISOString()
    })
  return res.body.ipr
}

function * quoteIpr (ipr) {
  const res = yield request
    .get('http://localhost:3333/quoteIPR')
    .query({ipr})
  return res.body
}

co(function * () {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

  // // warm up phase
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
    const ipr = yield requestIpr(a.to)
    const { sourceAmount, connectorAccount, sourceExpiryDuration } = yield quoteIpr(ipr)
    const interval = setInterval(function () {
      co(sendPayment(a.from, a.to, sourceAmount, connectorAccount, sourceExpiryDuration))
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

function * sendPayment (from, to, sourceAmount, connectorAccount, sourceExpiryDuration) {
  requests += 1

  const ipr = yield requestIpr(to)

  request
    .post('http://localhost:3333/payIPR')
    .send({
      ipr,
      sourceAmount,
      sourceAccount: 'http://localhost:3000/accounts/' + from,
      connectorAccount,
      sourceExpiryDuration
    })
    .end((err, res) => {
      if (err) {
        console.log('error', err)
        errors += 1
      } else if (res) {
        responses += 1
      }
    })
}

function * sleep (time) {
  yield new Promise((resolve) => setTimeout(resolve, time))
}

function resetMetrics () {
  requests = 0
  errors = 0
  responses = 0
}
