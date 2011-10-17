var request = require('request')
var uid = new Buffer('astromanies:michaeljackson2009', encoding='utf8').toString('base64');
var sys = require('sys'),
    twitter = require('twitter');

console.log(uid);

var twit = new twitter({
    consumer_key: 'mw6Dw4adevPW0l67wHk3hw',
    consumer_secret: 'iW0KQprGmvzpTvY0KZuLONdHrdYi9FBErBRIZGH0CM',
    access_token_key: '46961216-ns6DWzNaAUDnKkVUZQTkqQgXfa0Z4SGss1ElQfafA',
    access_token_secret: 'MSY57uqMaIMOtsRSWLvNDfL9DxaZXbrXGFak679tA78'
});

twit.stream('statuses/filter', 'track=nodejs', function(stream) {
    stream.on('data', function (data) {
				console.log(data)
//        sys.puts(sys.inspect(data));
    });
});