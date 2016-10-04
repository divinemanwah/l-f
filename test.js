var request = require('request');
var cheerio = require('cheerio');

request('http://www.lyricsmode.com/lyrics/m/mayonnaise/bakit_part_2.html', function (error, response, body) {
				if (!error && response.statusCode == 200) {
					
					var $ = cheerio.load(body),
						lyrics = $('#lyrics_text').text();
					
					console.log(lyrics)
				}
				else
					console.log(response)
			});