const express = require('express')
const bodyParser = require('body-parser')
const events = require('events');

const eventEmitter = new events.EventEmitter();
const app = express()

app.use(bodyParser.json())

// const FluentClient = require("@fluent-org/logger").FluentClient;
// const logger = new FluentClient("cloudwatch.input", {
//     socket: {
//         host: "localhost",
//         port: 24224,
//         timeout: 3000, // 3 seconds
//     }
// });

const processData = (logEvents) => {
    logEvents.map(logEvent => {
        //console.log(logEvent)
        logger.emit(logEvent)
    })


}

const EVENT_NAME = 'cloudwatch.input'
eventEmitter.addListener(EVENT_NAME, (buffer) => {
    const records = buffer.pop()?.records
    if (!records) return

    records.map(record => {
        let decodedData = JSON.parse(Buffer.from(record.data, 'base64'))
        // // firehose test provides ticker
        // if (JSON.parse(decodedData).SECTOR !== 'ENERGY') return

        // // cloudwatch logs can have no data
        // if (record.data.messageType !== 'DATA_MESSAGE') {
        //     //console.log(record.data)
        //     return;
        // }

        // processData(record.data.logEvents)
        //logger.emit(decodedData)
        console.log(JSON.parse(decodedData))
    })

})


app.get('/', function (req, res) {
    res.setHeader('content-type', 'application/json')
    res.status(200).send(JSON.stringify({ 'ping': 'Ok' }))
})

const firehoseRqsBuffer = []
const MAX_BUFFER_SIZE = process.env['MAX_BUFFER_SIZE'] || 5

app.post(`/${EVENT_NAME}`, function (req, res) {
    if (firehoseRqsBuffer.length < MAX_BUFFER_SIZE) {

        firehoseRqsBuffer.push(req.body)

        res.setHeader('content-type', 'application/json')
        res.status(200).send(JSON.stringify({
            'requestId': req.body.requestId,
            timestamp: Math.floor(Date.now())
        }))

    } else {

        res.setHeader('content-type', 'application/json')
        res.status(429).send(JSON.stringify({
            'requestId': req.body.requestId,
            timestamp: Math.floor(Date.now()),
            errorMessage: 'request buffer is full'
        }))
    }

    eventEmitter.emit(EVENT_NAME, firehoseRqsBuffer)
})

const port = process.env['HTTP_SERVER_PORT'] || 6464
console.log('listening on port:', port)
app.listen(port)