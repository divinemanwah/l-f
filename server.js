const fs = require('fs');
const restify = require('restify');
const skype = require('skype-sdk');

const botService = new skype.BotService({
    messaging: {
        botId: 'l-f',
        // serverUrl : "https://apis.skype.com",
        requestTimeout : 15000,
        appId: process.env.APP_ID,
        appSecret: process.env.APP_SECRET
    }
});

botService.on('contactAdded', (bot, data) => {
    bot.reply('Hello ${data.fromDisplayName}!', true);
});

botService.on('personalMessage', (bot, data) => {
    bot.reply('Hey ${data.from}. Thank you for your message: "${data.content}".', true);
});

const server = restify.createServer();
// server.use(skype.ensureHttps(true));
// server.use(skype.verifySkypeCert());
server.post('https://l-f.azurewebsites.net/v1/chat', skype.messagingHandler(botService));
const port = process.env.PORT || 8080;
server.listen(port);
console.log('Listening for incoming requests on port ' + port);