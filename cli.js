#!/usr/bin/env node

const inquirer = require('inquirer')
const { exec } = require("child_process")
const { stdout } = require('process')
const fs = require('fs')
const yaml = require('js-yaml')
const axios = require('axios')
const BASE_DOMAIN = process.env.BASE_DOMAIN


const [,, ... args] = process.argv

if (args == '--setup') {
    var setup = [{
        type: 'input',
        name: 'sid',
        message: "What is your Twilio Account Sid?",
      },
      {
        type: 'input',
        name: 'token',
        message: "What is your Twilio Account Auth Toekn?",
      },
      {
        type: 'input',
        name: 'token',
        message: "What is your Twilio Account Auth Toekn?",
      },
      {
        type: 'input',
        name: 'sender',
        message: "What is your Twilio phone number?",
      },
      {
        type: 'input',
        name: 'receiver',
        message: "What phone number would like notifications sent to?",
      }]

      
      inquirer.prompt(setup).then(answers => {
        try {
            let fileContents = fs.readFileSync('./serverless.yml', 'utf8');
            let data = yaml.safeLoad(fileContents);
        
            console.log(data);
        } catch (e) {
            console.log(e);
        }
        exec(exportCommand, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
        })
        
        console.log(`Your mayday server is all set! Run mayday --deploy, then runn mayday --create to add endpoints.`)
      })} else if (args == '--deploy') {
        location = __dirname
        deployCommand = 'cd ' + location + ' && serverless deploy'
        exec(deployCommand, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return
            }
            console.log('Your mayday instance is deployed! Run mayday --help to see all commands.')
        })
        console.log('Hold on a moment...')  
    } else if (args == '--create') {
        var location = __dirname
        var command = 'cd ' + location 
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return
            }
        })

        var setup = [{
            type: 'input',
            name: 'endPointId',
            message: "What is the id of your endpoint?",
          },
          {
            type: 'input',
            name: 'endPoint',
            message: "What is your endpoint URL??",
          }]  

          inquirer.prompt(setup).then(answers => {
            
            var url = BASE_DOMAIN + '/create-endpoint'
            axios
            .post(url, {
                endPointId: answers['endPointId'],
                endPoint: answers['endPoint']
            })
            .then(res => {
                console.log(res.data)
            })
            .catch(error => {
                console.error(error)
            }) 
        })
    } else if (args == '--status') {
        var url = BASE_DOMAIN + '/endpoints'
        axios.get(url, {
          })
          .then(function (response) {
            var data = response.data
            var count = data.data.Count
            var items = data.data.Items
            
            for (i = 0; i < count; i++) {
                var statusMessage = items[i].statusMessage
                var isActive = items[i].isActive
                var latency = items[i].latency
                console.log(items[i].endPointId, "@", items[i].endPoint, 'Status: ', statusMessage)
              }          
            })
    } else if (args == '--probe') {
        var url = BASE_DOMAIN + '/probe-endpoints'
        axios.get(url, {
          })
          .then(function (response) {
            console.log(response.data)
       
            })
    } else if (args == '--delete') {
    var deleteEndPoint = [
      {
        type: 'input',
        name: 'endPointId',
        message: "What is the id of the endpoint you would like to delete?",
      }]

      
      inquirer.prompt(deleteEndPoint).then(answers => {
          
        var url = BASE_DOMAIN + '/delete-endpoint/' + answers['endPointId'] 
        axios.get(url, {
            })
            .then(function (response) {
                console.log(response.data)
                
            })        
        })
    }








