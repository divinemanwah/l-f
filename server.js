/*-----------------------------------------------------------------------------
This Bot uses the Bot Connector Service but is designed to showcase whats 
possible on Skype using the framework. The demo shows how to create a looping 
menu, use the built-in prompts, send Pictures, send Hero & Thumbnail Cards, 
send Receipts, and use Carousels. 

# RUN THE BOT:

    You can run the bot locally using the Bot Framework Emulator but for the best
    experience you should register a new bot on Skype and bind it to the demo 
    bot. You can then run the bot locally using ngrok found at https://ngrok.com/.

    * Install and run ngrok in a console window using "ngrok http 3978".
    * Create a bot on https://dev.botframework.com and follow the steps to setup
      a Skype channel.
    * For the endpoint you setup on dev.botframework.com, copy the https link 
      ngrok setup and set "<ngrok link>/api/messages" as your bots endpoint.
    * Next you need to configure your bots MICROSOFT_APP_ID, and
      MICROSOFT_APP_PASSWORD environment variables. If you're running VSCode you 
      can add these variables to your the bots launch.json file. If you're not 
      using VSCode you'll need to setup these variables in a console window.
      - MICROSOFT_APP_ID: This is the App ID assigned when you created your bot.
      - MICROSOFT_APP_PASSWORD: This was also assigned when you created your bot.
    * To use the bot you'll need to click the join link in the portal which will
      add it as a contact to your skype account. 
    * To run the bot you can launch it from VSCode or run "node app.js" from a 
      console window. 

-----------------------------------------------------------------------------*/

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function xmlToJson(url, callback) {
  var req = http.get(url, function(res) {
    var xml = '';

    res.on('data', function(chunk) {
      xml += chunk;
    });

    res.on('error', function(e) {
      callback(e, null);
    }); 

    res.on('timeout', function(e) {
      callback(e, null);
    }); 

    res.on('end', function() {
      parseString(xml, function(err, result) {
        callback(null, result);
      });
    });
  });
  
  req.on('socket', function (socket) {
	
	socket.setTimeout(5000, function () {
		
		req.abort();
		
	});
	
  });
}

const querystring = require('querystring');

var restify = require('restify');
var builder = require('botbuilder');
var http = require('http');
var parseString = require('xml2js').parseString;
var schedule = require('node-schedule');
var request = require('request');
var cheerio = require('cheerio');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   // console.log('%s listening to %s', server.name, server.url);
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_SECRET
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

var msgs = [
		'Bobo mo',
		'Mali ka nanaman',
		'Anu ba yan',
		'Hay nako',
		'Putek naman',
		'Kaimbyerna ka'
	];

var errs = [
		'Sorry waley',
		'404 no brain, este not found',
		'Wala bes'
	];
	
var suffix = [
		'Gaylord',
		'a.k.a. Fvckboi',
		'the Beki Monkey'
	];
	
var clicks = [
		'Click mo dali',
		'Eto din bes',
		'Last na promise',
		'Wow!',
		'1 click = 1 prayer'
	];
	
var lunch = [
		'Lapit na mag lunch mga beki!',
		'Gogora na tayo sa lunching!',
		'10 minutes nalang mga beshties, kaya pa yan!'
	];
	
var imbyerns = [
		'Hanap ka kausap mo',
		'Ewan ko sayo',
		'Ay ewan'
	];

bot.dialog('/', new builder.IntentDialog()
    // .matches(/^add/i, '/addTask')
    .matches(/rarawan (.*)/i, function (session, matches) {
		
		var opts = {
				url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?' + querystring.stringify({ q: matches.matched[1].trim(), count: 5, safeSearch: 'Strict' }),
				headers: {
						'Ocp-Apim-Subscription-Key': 'b6777d5dd61049fab63710f6580f1be2'
					}
			};
			
		request(opts, function (error, response, body) {
			if (!error && response.statusCode == 200) {
			
				var res = JSON.parse(body);
				
				// var msg = new builder.Message(session)
										// .textFormat(builder.TextFormat.xml)
										// .attachments([
											// new builder.ThumbnailCard(session)
												// .title("Mga Rarawan")
												// .subtitle(matches.matched[1].trim())
												// .text(imgs[Math.floor(Math.random() * imgs.length)])
												// .images(res.value.map(function (x) { return builder.CardImage.create(session, x.thumbnailUrl); }))
												// .tap(builder.CardAction.openUrl(session, res.webSearchUrl))
										// ]);

				if(res.value.length) {
				
					// var msg = new builder.Message(session)
											// .textFormat(builder.TextFormat.xml)
											// .attachments(res.value.map(function (x) {
												
												// return new builder.HeroCard(session)
																	// .text(x.name)
																	// .images([
																		// builder.CardImage.create(session, x.thumbnailUrl)
																	// ]);
												
											// }));
											
					var msg = new builder.Message(session)
											.textFormat(builder.TextFormat.xml)
											.attachmentLayout(builder.AttachmentLayout.carousel)
											.attachments(res.value.map(function (x, i) {
												
												return new builder.HeroCard(session)
																	.text(x.name)
																	.images([
																		builder.CardImage.create(session, x.thumbnailUrl)
																			.tap(builder.CardAction.showImage(session, x.contentUrl)),
																	])
																	.buttons([
																		builder.CardAction.openUrl(session, x.contentUrl, clicks[i])
																	]);
												
											}));
					
					session.send(msg);
				}
				else
					session.send(errs[Math.floor(Math.random() * errs.length)] + ' ' + session.message.user.name + (Math.floor(Math.random() * 2) ? ' ' + suffix[Math.floor(Math.random() * suffix.length)] : '') + '.');
			}
			else
				session.send(errs[Math.floor(Math.random() * errs.length)] + ' ' + session.message.user.name + (Math.floor(Math.random() * 2) ? ' ' + suffix[Math.floor(Math.random() * suffix.length)] : '') + '.');
		});
		
	})
    .matches(/ririks (.*) ~ (.*)/i, function (session, matches) {
				
		var _artist = matches.matched[1].trim().toLowerCase().replace(/\s/g, '_').replace(/[^a-z0-9_]/g, ''),
			_title = matches.matched[2].trim().toLowerCase().replace(/\s/g, '_').replace(/[^a-z0-9_]/g, ''),
			artist = toTitleCase(matches.matched[1].trim()),
			title = toTitleCase(matches.matched[2].trim());
		
		request('http://www.lyricsmode.com/lyrics/' + _artist.substr(0, 1) + '/' + encodeURIComponent(_artist) + '/' + encodeURIComponent(_title) + '.html', function (error, response, body) {
			if (!error && response.statusCode == 200) {
				
				var $ = cheerio.load(body),
					lyrics = $('<p>' + $('#lyrics_text').html().replace(/<br\s*[\/]?>/gi, "\n") + '</p>').text();
				
				session.send(artist + ' ~ ' + title + '\n---\n' + lyrics);
			}
			else
				session.send(errs[Math.floor(Math.random() * errs.length)] + ' ' + session.message.user.name + (Math.floor(Math.random() * 2) ? ' ' + suffix[Math.floor(Math.random() * suffix.length)] : '') + '.');
		});
	})
	.matches(/ririks (.*)/i, [
		function (session, matches, next) {
			
			var _artist = matches.matched[1].trim().toLowerCase().replace(/\s/g, '_').replace(/[^a-z0-9_]/g, ''),
				artist = toTitleCase(matches.matched[1].trim());
			
			request('http://www.lyricsmode.com/lyrics/' + _artist.substr(0, 1) + '/' + encodeURIComponent(_artist) + '/', function (error, response, body) {
				if (!error && response.statusCode == 200) {
					
					var $ = cheerio.load(body),
						_songs = {},
						songs = $('.ui-song-block .text_box').map(function () {
							
									_songs[$(this).text()] = $('a', this).attr('href');
									
									return $(this).text();
									
								}).get();

					if(songs.length) {

						session.dialogData._artist = _artist;
						session.dialogData.artist = artist;
						session.dialogData.songs = _songs;
					
						builder.Prompts.choice(session, artist + '\n---\n' + 'Alin dito ' + session.message.user.name + '?', songs, {
							retryPrompt: [
									'Sure ka jan ' + session.message.user.name + '? Wala yan sa choices.',
									'Bruha! Check mo ulit mga pagpipilian ' + session.message.user.name + '.'
								],
							maxRetries: 2
						});
					}
					else
						next();
				}
				else
					session.send(errs[Math.floor(Math.random() * errs.length)] + ' ' + session.message.user.name + (Math.floor(Math.random() * 2) ? ' ' + suffix[Math.floor(Math.random() * suffix.length)] : '') + '.');
			});
		},
		function (session, results) {
		
			var inputstring = session.dialogData['BotBuilder.Data.Intent'],
				flags = inputstring.replace(/.*\/([gimy]*)$/, '$1'),
				pattern = inputstring.replace(new RegExp('^/(.*?)/'+flags+'$'), '$1'),
				regex = new RegExp(pattern, flags),
				_test = regex.test(session.message.text);
			
			if(results.response && !_test) {
				
				var title = toTitleCase(results.response.entity.trim());
console.log(session.dialogData.songs, results.response)
				request('http://www.lyricsmode.com' + session.dialogData.songs[results.response.entity], function (error, response, body) {
					if (!error && response.statusCode == 200) {
						
						var $ = cheerio.load(body),
							lyrics = $('<p>' + $('#lyrics_text').html().replace(/<br\s*[\/]?>/gi, "\n") + '</p>').text();
						
						session.send(session.dialogData.artist + ' ~ ' + title + '\n---\n' + lyrics);
					}
					else
						session.send(errs[Math.floor(Math.random() * errs.length)] + ' ' + session.message.user.name + (Math.floor(Math.random() * 2) ? ' ' + suffix[Math.floor(Math.random() * suffix.length)] : '') + '.');
				});
				
			}
			else
				session.send(_test ? 'Paiba-iba ka ng gustong gawin. Ulitin mo nalang!' : imbyerns[Math.floor(Math.random() * imbyerns.length)] + ' ' + session.message.user.name + '!');
		}
	])
    .onDefault(function (session) {
				
			session.send(msgs[Math.floor(Math.random() * msgs.length)] + ' ' + session.message.user.name + '! Ganito dapat: ' + (session.message.address.conversation.isGroup ? '@' + session.message.address.bot.name : '') + ' ririks *artist* ~ *title* OR ririks *artist*');
			session.send('Pwede rin ganito: rarawan *kahit anong nais mo*');
			
		})
);


//=========================================================
// Activity Events
//=========================================================

var lunch_interval = null;

bot.on('conversationUpdate', function (message) {
   // Check for group conversations
    if (message.address.conversation.isGroup) {
        // Send a hello message when bot is added
        if (message.membersAdded) {
            message.membersAdded.forEach(function (identity) {
                if (identity.id === message.address.bot.id) {
                    var reply = new builder.Message()
                            .address(message.address)
                            .text("Hello everyone!");
                    bot.send(reply);
					
					var s = schedule.scheduleJob({hour: 12, minute: 50}, function(){
					
							var reply = new builder.Message()
											.address(message.address)
											.text(lunch[Math.floor(Math.random() * lunch.length)]);
							
							bot.send(reply);
							
						});
                }
            });
        }

        // Send a goodbye message when bot is removed
        if (message.membersRemoved) {
            message.membersRemoved.forEach(function (identity) {
                if (identity.id === message.address.bot.id) {
                    var reply = new builder.Message()
                        .address(message.address)
                        .text("Goodbye");
                    bot.send(reply);
                }
				else {
                    var reply = new builder.Message()
                        .address(message.address)
                        .text("Aww. Babay " + identity.name + '! Tara guys party party!');
                    bot.send(reply);
                }
            });
        }
    }
});

bot.on('contactRelationUpdate', function (message) {
    if (message.action === 'add') {
        var name = message.user ? message.user.name : null;
        var reply = new builder.Message()
                .address(message.address)
                .text("Hello %s... Thanks for adding me. Mwaah mwaah tsup tsup!", name || 'there');
        bot.send(reply);
    } else {
        // delete their data
    }
});

bot.on('deleteUserData', function (message) {
    // User asked to delete their data
});


//=========================================================
// Bots Middleware
//=========================================================

// Anytime the major version is incremented any existing conversations will be restarted.
// bot.use(builder.Middleware.dialogVersion({ version: 1.0, resetCommand: /^reset/i }));

//=========================================================
// Bots Global Actions
//=========================================================

// bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^goodbye/i });
// bot.beginDialogAction('help', '/help', { matches: /^help/i });

//=========================================================
// Bots Dialogs
//=========================================================
/*
bot.dialog('/', [
    function (session) {
        // Send a greeting and show help.
        var card = new builder.HeroCard(session)
            .title("Microsoft Bot Framework")
            .text("Your bots - wherever your users are talking.")
            .images([
                 builder.CardImage.create(session, "http://docs.botframework.com/images/demo_bot_image.png")
            ]);
        var msg = new builder.Message(session).attachments([card]);
        session.send(msg);
        session.send("Hi... I'm the Microsoft Bot Framework demo bot for Skype. I can show you everything you can use our Bot Builder SDK to do on Skype.");
        session.beginDialog('/help');
    },
    function (session, results) {
        // Display menu
        session.beginDialog('/menu');
    },
    function (session, results) {
        // Always say goodbye
        session.send("Ok... See you later!");
    }
]);

bot.dialog('/menu', [
    function (session) {
        builder.Prompts.choice(session, "What demo would you like to run?", "prompts|picture|cards|list|carousel|receipt|actions|(quit)");
    },
    function (session, results) {
        if (results.response && results.response.entity != '(quit)') {
            // Launch demo dialog
            session.beginDialog('/' + results.response.entity);
        } else {
            // Exit the menu
            session.endDialog();
        }
    },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/menu');
    }
]).reloadAction('reloadMenu', null, { matches: /^menu|show menu/i });

bot.dialog('/help', [
    function (session) {
        session.endDialog("Global commands that are available anytime:\n\n* menu - Exits a demo and returns to the menu.\n* goodbye - End this conversation.\n* help - Displays these commands.");
    }
]);

bot.dialog('/prompts', [
    function (session) {
        session.send("Our Bot Builder SDK has a rich set of built-in prompts that simplify asking the user a series of questions. This demo will walk you through using each prompt. Just follow the prompts and you can quit at any time by saying 'cancel'.");
        builder.Prompts.text(session, "Prompts.text()\n\nEnter some text and I'll say it back.");
    },
    function (session, results) {
        session.send("You entered '%s'", results.response);
        builder.Prompts.number(session, "Prompts.number()\n\nNow enter a number.");
    },
    function (session, results) {
        session.send("You entered '%s'", results.response);
        session.send("Bot Builder includes a rich choice() prompt that lets you offer a user a list choices to pick from. On Skype these choices by default surface using buttons if there are 3 or less choices. If there are more than 3 choices a numbered list will be used but you can specify the exact type of list to show using the ListStyle property.");
        builder.Prompts.choice(session, "Prompts.choice()\n\nChoose a list style (the default is auto.)", "auto|inline|list|button|none");
    },
    function (session, results) {
        var style = builder.ListStyle[results.response.entity];
        builder.Prompts.choice(session, "Prompts.choice()\n\nNow pick an option.", "option A|option B|option C", { listStyle: style });
    },
    function (session, results) {
        session.send("You chose '%s'", results.response.entity);
        builder.Prompts.confirm(session, "Prompts.confirm()\n\nSimple yes/no questions are possible. Answer yes or no now.");
    },
    function (session, results) {
        session.send("You chose '%s'", results.response ? 'yes' : 'no');
        builder.Prompts.time(session, "Prompts.time()\n\nThe framework can recognize a range of times expressed as natural language. Enter a time like 'Monday at 7am' and I'll show you the JSON we return.");
    },
    function (session, results) {
        session.send("Recognized Entity: %s", JSON.stringify(results.response));
        builder.Prompts.attachment(session, "Prompts.attachment()\n\nYour bot can wait on the user to upload an image or video. Send me an image and I'll send it back to you.");
    },
    function (session, results) {
        var msg = new builder.Message(session)
            .ntext("I got %d attachment.", "I got %d attachments.", results.response.length);
        results.response.forEach(function (attachment) {
            msg.addAttachment(attachment);    
        });
        session.endDialog(msg);
    }
]);

bot.dialog('/picture', [
    function (session) {
        session.send("You can easily send pictures to a user...");
        var msg = new builder.Message(session)
            .attachments([{
                contentType: "image/jpeg",
                contentUrl: "http://www.theoldrobots.com/images62/Bender-18.JPG"
            }]);
        session.endDialog(msg);
    }
]);

bot.dialog('/cards', [
    function (session) {
        session.send("You can use Hero & Thumbnail cards to send the user visually rich information...");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    .title("Hero Card")
                    .subtitle("Space Needle")
                    .text("The <b>Space Needle</b> is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                    ])
                    .tap(builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle"))
            ]);
        session.send(msg);

        msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.ThumbnailCard(session)
                    .title("Thumbnail Card")
                    .subtitle("Pikes Place Market")
                    .text("<b>Pike Place Market</b> is a public market overlooking the Elliott Bay waterfront in Seattle, Washington, United States.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/PikePlaceMarket.jpg/320px-PikePlaceMarket.jpg")
                    ])
                    .tap(builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Pike_Place_Market"))
            ]);
        session.endDialog(msg);
    }
]);

bot.dialog('/list', [
    function (session) {
        session.send("You can send the user a list of cards as multiple attachments in a single message...");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    .title("Hero Card")
                    .subtitle("Space Needle")
                    .text("The <b>Space Needle</b> is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                    ]),
                new builder.ThumbnailCard(session)
                    .title("Thumbnail Card")
                    .subtitle("Pikes Place Market")
                    .text("<b>Pike Place Market</b> is a public market overlooking the Elliott Bay waterfront in Seattle, Washington, United States.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/PikePlaceMarket.jpg/320px-PikePlaceMarket.jpg")
                    ])
            ]);
        session.endDialog(msg);
    }
]);

bot.dialog('/carousel', [
    function (session) {
        session.send("You can pass a custom message to Prompts.choice() that will present the user with a carousel of cards to select from. Each card can even support multiple actions.");
        
        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                new builder.HeroCard(session)
                    .title("Space Needle")
                    .text("The <b>Space Needle</b> is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                            .tap(builder.CardAction.showImage(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/800px-Seattlenighttimequeenanne.jpg")),
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Wikipedia"),
                        builder.CardAction.imBack(session, "select:100", "Select")
                    ]),
                new builder.HeroCard(session)
                    .title("Pikes Place Market")
                    .text("<b>Pike Place Market</b> is a public market overlooking the Elliott Bay waterfront in Seattle, Washington, United States.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/PikePlaceMarket.jpg/320px-PikePlaceMarket.jpg")
                            .tap(builder.CardAction.showImage(session, "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/PikePlaceMarket.jpg/800px-PikePlaceMarket.jpg")),
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Pike_Place_Market", "Wikipedia"),
                        builder.CardAction.imBack(session, "select:101", "Select")
                    ]),
                new builder.HeroCard(session)
                    .title("EMP Museum")
                    .text("<b>EMP Musem</b> is a leading-edge nonprofit museum, dedicated to the ideas and risk-taking that fuel contemporary popular culture.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Night_Exterior_EMP.jpg/320px-Night_Exterior_EMP.jpg")
                            .tap(builder.CardAction.showImage(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Night_Exterior_EMP.jpg/800px-Night_Exterior_EMP.jpg"))
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/EMP_Museum", "Wikipedia"),
                        builder.CardAction.imBack(session, "select:102", "Select")
                    ])
            ]);
        builder.Prompts.choice(session, msg, "select:100|select:101|select:102");
    },
    function (session, results) {
        var action, item;
        var kvPair = results.response.entity.split(':');
        switch (kvPair[0]) {
            case 'select':
                action = 'selected';
                break;
        }
        switch (kvPair[1]) {
            case '100':
                item = "the <b>Space Needle</b>";
                break;
            case '101':
                item = "<b>Pikes Place Market</b>";
                break;
            case '102':
                item = "the <b>EMP Museum</b>";
                break;
        }
        session.endDialog('You %s "%s"', action, item);
    }    
]);

bot.dialog('/receipt', [
    function (session) {
        session.send("You can send a receipts for purchased good with both images and without...");
        
        // Send a receipt with images
        var msg = new builder.Message(session)
            .attachments([
                new builder.ReceiptCard(session)
                    .title("Recipient's Name")
                    .items([
                        builder.ReceiptItem.create(session, "$22.00", "EMP Museum").image(builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/a/a0/Night_Exterior_EMP.jpg")),
                        builder.ReceiptItem.create(session, "$22.00", "Space Needle").image(builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/7/7c/Seattlenighttimequeenanne.jpg"))
                    ])
                    .facts([
                        builder.Fact.create(session, "1234567898", "Order Number"),
                        builder.Fact.create(session, "VISA 4076", "Payment Method"),
                        builder.Fact.create(session, "WILLCALL", "Delivery Method")
                    ])
                    .tax("$4.40")
                    .total("$48.40")
            ]);
        session.send(msg);

        // Send a receipt without images
        msg = new builder.Message(session)
            .attachments([
                new builder.ReceiptCard(session)
                    .title("Recipient's Name")
                    .items([
                        builder.ReceiptItem.create(session, "$22.00", "EMP Museum"),
                        builder.ReceiptItem.create(session, "$22.00", "Space Needle")
                    ])
                    .facts([
                        builder.Fact.create(session, "1234567898", "Order Number"),
                        builder.Fact.create(session, "VISA 4076", "Payment Method"),
                        builder.Fact.create(session, "WILLCALL", "Delivery Method")
                    ])
                    .tax("$4.40")
                    .total("$48.40")
            ]);
        session.endDialog(msg);
    }
]);

bot.dialog('/signin', [ 
    function (session) { 
        // Send a signin 
        var msg = new builder.Message(session) 
            .attachments([ 
                new builder.SigninCard(session) 
                    .text("You must first signin to your account.") 
                    .button("signin", "http://example.com/") 
            ]); 
        session.endDialog(msg); 
    } 
]); 


bot.dialog('/actions', [
    function (session) { 
        session.send("Bots can register global actions, like the 'help' & 'goodbye' actions, that can respond to user input at any time. You can even bind actions to buttons on a card.");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    .title("Hero Card")
                    .subtitle("Space Needle")
                    .text("The <b>Space Needle</b> is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                    ])
                    .buttons([
                        builder.CardAction.dialogAction(session, "weather", "Seattle, WA", "Current Weather")
                    ])
            ]);
        session.send(msg);

        session.endDialog("The 'Current Weather' button on the card above can be pressed at any time regardless of where the user is in the conversation with the bot. The bot can even show the weather after the conversation has ended.");
    }
]);

// Create a dialog and bind it to a global action
bot.dialog('/weather', [
    function (session, args) {
        session.endDialog("The weather in %s is 71 degrees and raining.", args.data);
    }
]);
bot.beginDialogAction('weather', '/weather');   // <-- no 'matches' option means this can only be triggered by a button.
*/