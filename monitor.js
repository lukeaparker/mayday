'use strict';
 
const { time } = require('console');
const Monitor = require('ping-monitor');
const timestamp = require('time-stamp');
const ENDPOINT_TABLE = process.env.ENDPOINT_TABLE




const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)


module.exports.endPointMonitor = function(endPointId, endPoint, dynamoDb) {

    const monitor = new Monitor({
        website: endPoint,
        title: endPointId,
        interval: 1 // minutes
    })
    
    monitor.on('up', function (res) {
        console.log(endPointId, ' is alive and active!', ' Response Message: OK', ' Latency: ', res.responseTime)

        const params = {
            TableName: ENDPOINT_TABLE,
            Key: {
                'endPointId': endPointId,
            },
            UpdateExpression: "set #isAlive=:a, #statusMessage=:sm, #latency=:l, #timeRecord=:tr",
            ExpressionAttributeNames: {
                '#isAlive': 'isAlive',
                '#statusMessage': 'statusMessage',
                '#latency': 'latency',
                '#timeRecord': 'timeRecord',
            },
            ExpressionAttributeValues: {
                ":a": monitor.isUp,
                ":sm": 'OK',
                ":l": res.responseTime,
                ':tr': timestamp()
            },
            ReturnValues: "UPDATED_NEW",
        }


        dynamoDb.update(params, (error) => {
        if (error) {
            console.log('Could not update endpoint status: ', error)
        } 
        })
    })
    
    
    monitor.on('down', function (res) {
        client.messages.create({
            body: 'MAYDAY! MAYDAY! SERVER IS DOWN! @' + endPoint,
            from: '+14404997537',
            to: '+13142104261'
        })
    .then(message => console.log(message.sid))
        const params = {
            TableName: ENDPOINT_TABLE,
            Key: {
                'endPointId': endPointId,
            },
            UpdateExpression: "set #isAlive=:a, #statusMessage=:sm, #latency=:l, #timeRecord=:tr",
            ExpressionAttributeNames: {
                '#isAlive': 'isAlive',
                '#statusMessage': 'statusMessage',
                '#latency': 'latency',
                '#timeRecord': 'timeRecord',
            },
            ExpressionAttributeValues: {
                ":a": monitor.isUp,
                ":sm": 'OK',
                ":l": res.responseTime,
                ':tr': timestamp()
            },
            ReturnValues: "UPDATED_NEW",
        }

        dynamoDb.update(params, (error) => {
        if (error) {
            console.log('Could not update endpoint status: ', error)
            } 
        })  
        

    })
    
    
    monitor.on('error', function (error) {
        console.log(endPointId, ' is down! MAYDAY! MAYDAY!', ' Response Message: ', error)
        client.messages.create({
            body: 'MAYDAY! MAYDAY! SERVER IS DOWN! @' + endPoint,
            from: '+14404997537',
            to: '+13142104261'
        })
    .then(message => console.log(message.sid))
        const params = {
            TableName: ENDPOINT_TABLE,
            Key: {
                'endPointId': endPointId,
            },
            UpdateExpression: "set #isAlive=:a, #statusMessage=:sm, #timeRecord=:tr",
            ExpressionAttributeNames: {
                '#isAlive': 'isAlive',
                '#statusMessage': 'statusMessage',
                '#timeRecord': 'timeRecord',
            },
            ExpressionAttributeValues: {
                ":a": monitor.isUp,
                ":sm": error,
                ':tr': timestamp()
            },
            ReturnValues: "UPDATED_NEW",
        }

        dynamoDb.update(params, (error) => {
        if (error) {
            console.log('Could not update endpoint status: ', error)
            } 
        })  
        

    })
}

