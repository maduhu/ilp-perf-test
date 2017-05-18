'use strict'

const http = require('http')
const request = require('request')
const uuid = require('uuid')
const co = require('co')
// const ServiceManager = require('five-bells-service-manager')

const REQUESTS_PER_SECOND = 50
const DURATION = 5 * 60 * 1000 // minutes
let requests = 0
let responses = 0
let errors = 0

const LEDGER_HOST = '172.88.0.1'
const SPSP_SERVER_HOST = '172.88.0.1'
// const SPSP_SERVER_HOST = '192.168.56.101'
// const LEDGER_HOST = '192.168.56.1'

let accounts = [
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
  console.log('PID ', process.pid)
  console.log(http.globalAgent.maxSockets)

  sleep(5)

  // const manager = new ServiceManager('./node_modules', 'data')

  for (const a of accounts) {
    // manager.updateAccount('ledger.stress.test', a.from, { balance: 1000 })
    // manager.updateAccount('ledger.stress.test', a.to, { balance: 1000 })

    query(a.to)
  }

  // get a quote

  // perodically send payments
  console.log('start sending at')
  const intervals = []
  for (const a of accounts) {
    const interval = setInterval(function () {
      sendPayment(a.from, a.to)
    }, 1000 / REQUESTS_PER_SECOND * Object.keys(accounts).length)
    intervals.push(interval)
    sleep(41)
  }

  setTimeout(function () {
    console.log('stop sending')
    for (const i of intervals) {
      clearInterval(i)
    }
  }, DURATION)

  setTimeout(function () {
    console.log('Requests sent: ', requests)
    console.log('Responses sent: ', responses)
    console.log('Errors: ', errors)

    for (const a of accounts) {
      getBalance(a.to)
    }
  }, 10 * 1000 + DURATION)
})

function sendPayment (from, to) {
  // console.log('sending payment')
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
      // console.log('response')
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
