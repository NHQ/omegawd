var twitter = require('twitter');
		var twit = new twitter({
		    consumer_key: 'mw6Dw4adevPW0l67wHk3hw',
		    consumer_secret: 'iW0KQprGmvzpTvY0KZuLONdHrdYi9FBErBRIZGH0CM',
		    access_token_key: '46961216-ns6DWzNaAUDnKkVUZQTkqQgXfa0Z4SGss1ElQfafA',
		    access_token_secret: 'MSY57uqMaIMOtsRSWLvNDfL9DxaZXbrXGFak679tA78'
		});

var track = ['occupyla', 'ows', 'occupydc', 'occupychicago', 'occupychi', 'occupysf', 'occupysd', 'occupyaustin', 'occupy'];

		twit.stream('statuses/filter', {track: 'occupy'}, function(stream) {
		    stream.on('data', function (data) {
						console.log(data)
		    });
				stream.on('error', function(err){
					console.log(err)
				})
		});