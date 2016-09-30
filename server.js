/*const fs = require('fs');
const restify = require('restify');
const skype = require('skype-sdk');

const botService = new skype.BotService({
    messaging: {
        botId: '28:l-f',
        serverUrl : "https://apis.skype.com",
        requestTimeout : 15000,
        appId: process.env.APP_ID,
        appSecret: process.env.APP_SECRET
    }
});

botService.on('contactAdded', function (bot, data) {
    bot.reply('Hello ${data.fromDisplayName}!', true);
});

botService.on('personalMessage', function (bot, data) {
    bot.reply('Hey ${data.from}. Thank you for your message: "${data.content}".', true);
});

const server = restify.createServer();
// server.use(skype.ensureHttps(true));
// server.use(skype.verifySkypeCert());
server.post('https://l-f.azurewebsites.net/v1/chat', skype.messagingHandler(botService));
const port = process.env.PORT || 8080;
server.listen(port);
console.log('Listening for incoming requests on port ' + port);*/

var restify = require('restify');
var builder = require('botbuilder');

// Create bot and add dialogs
var connector = new builder.ChatConnector({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_SECRET
});
var bot = new builder.UniversalBot(connector);  
bot.dialog('/', function (session) {
    session.send('Hello World');
});

// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', connector.listen());
server.listen(process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});