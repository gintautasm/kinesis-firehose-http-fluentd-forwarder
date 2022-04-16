const express = require('express')
const bodyParser = require('body-parser')
const events = require('events');

const eventEmitter = new events.EventEmitter();
const app = express()

app.use(bodyParser.json())

const FluentClient = require("@fluent-org/logger").FluentClient;
const logger = new FluentClient("cloudwatch.input", {
    socket: {
        host: "localhost",
        port: 24224,
        timeout: 3000, // 3 seconds
    }
});

const processData = (logEvents) => {
    logEvents.map(logEvent => {
        //console.log(logEvent)
        logger.emit(logEvent)
    })


}


app.get('/', function (req, res) {
    res.setHeader('content-type', 'application/json')
    res.status(200).send(JSON.stringify({ 'ping': 'Ok' }))
})

const firehoseRqsBuffer = []
const MAX_BUFFER_SIZE = 5

app.post('/firehose', function (req, res) {

    if (firehoseRqsBuffer.length < MAX_BUFFER_SIZE) {

        //firehoseRqsBuffer.push(Object.assign({}, req.body))


        //console.log(firehoseRqsBuffer[0], req.body)

        res.setHeader('content-type', 'application/json')
        res.status(200).send(JSON.stringify({
            'requestId': req.body.requestId,
            timestamp: Math.floor(Date.now())
        }))

        //eventEmitter.emit('cloudwatch.input', firehoseRqsBuffer)
        return
    }

    res.setHeader('content-type', 'application/json')
    res.status(429).send(JSON.stringify({
        'requestId': req.body.requestId,
        timestamp: Math.floor(Date.now()),
        errorMessage: 'request buffer is full'
    }))

    eventEmitter.emit('cloudwatch.input', firehoseRqsBuffer)

    // req.body.records.map(record => {
    //     let decodedData = Buffer.from(record.data, 'base64')
    //     // if (record.data.messageType !== 'DATA_MESSAGE') {
    //     //     //console.log(record.data)
    //     //     return;
    //     // }

    //     // processData(record.data.logEvents)
    //     logger.emit(decodedData)
    // })
})

eventEmitter.addListener('cloudwatch.input', (buffer) => {
    logger.emit(buffer.pop())

})

app.listen(process.env['HTTP_SERVER_PORT'])