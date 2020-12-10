// server.js
const serverless = require('serverless-http')

const monitor = require('./monitor.js')

const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.json({ strict: false }))

const AWS = require('aws-sdk')
const ENDPOINT_TABLE = process.env.ENDPOINT_TABLE
const IS_OFFLINE = process.env.IS_OFFLINE;
let dynamoDb;
if (IS_OFFLINE === 'true') {
    dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8042'
}) } else {
    dynamoDb = new AWS.DynamoDB.DocumentClient();
}


app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.get('/probe-endpoints', function (req, res) {
    const params = {
        TableName: ENDPOINT_TABLE,
        Select: "ALL_ATTRIBUTES"
      }


    dynamoDb.scan(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            var endPoints = data.Items
            for (var i = 0; i < data.Count; i++) {
                var endPoint = endPoints[i] 
                console.log(endPoint)
                var endPointMonitor = monitor.endPointMonitor(endPoint.endPointId, endPoint.endPoint, dynamoDb)
            }
            return res.send('Probe sent')
        }
    })
})


app.get('/endpoints', function (req, res) {
    const params = {
        TableName: ENDPOINT_TABLE,
        Select: "ALL_ATTRIBUTES"
      }


    dynamoDb.scan(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            res.json({data})
        }
    });
})

// Get Endpoint Status 
app.get('/endpoint/:endPointId', function (req, res) {
  const params = {
    TableName: ENDPOINT_TABLE,
    Key: {
      endPointId: req.params.endPointId,
    },
  }

  dynamoDb.get(params, (error, result) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not get endpoint' });
    }
    if (result.Item) {
      console.log(result.Item)
      const {endPointId, endPoint, isAlive, statusMessage, status, latency, timeStamp } = result.Item;
      res.json({ endPointId, endPoint, isAlive, statusMessage, status, latency, timeStamp });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  })
})



// Delete Endpoint
app.get('/delete-endpoint/:endPointId', function (req, res) {
    const params = {
        TableName: ENDPOINT_TABLE,
        Key: {
          endPointId: req.params.endPointId,
        },
      }

      dynamoDb.delete(params, (error, result) => {
        if (error) {
          console.log(error);
          res.status(400).json({ error: 'Could not not delete endpoint' });
        } else {
            res.send('deleted ' + req.params.endPointId)
        }
      })
    })


// Create User endpoint
app.post('/create-endpoint', function (req, res) {
  const { endPointId, endPoint } = req.body;
  console.log(endPointId, endPoint)
  if (typeof endPointId !== 'string') {
    res.status(400).json({ error: '"endPointId" must be a string' });
  } else if (typeof endPoint !== 'string') {
    res.status(400).json({ error: '"endPoint" must be a string' })
  }

  const params = {
    TableName: ENDPOINT_TABLE,
    Item: {
      endPointId: endPointId,
      endPoint: endPoint
    },
  }
  
  dynamoDb.put(params, (error) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not create endpoint' })
    } else {
        res.send('Created endpoint ' + endPointId + ' @' + endPoint)
    }
  })
})











module.exports.handler = serverless(app)