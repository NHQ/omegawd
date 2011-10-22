var fs = require('fs'),
		twitter = require('twitter'),
		_ = require('underscore'),
		redis = require('redis'),
		client = redis.createClient(),
		request = require('request');
		
var jQ = fs.readFileSync('./lib/jquery-1.6.2.min.js').toString();
		
		client.on("error", function (err) {
		    console.log("Error " + err);
		});
		client.on("ready", function (res) {
		    console.log(res, "ready");
		});

var twit = new twitter({
    consumer_key: 'mw6Dw4adevPW0l67wHk3hw',
    consumer_secret: 'iW0KQprGmvzpTvY0KZuLONdHrdYi9FBErBRIZGH0CM',
    access_token_key: '46961216-ns6DWzNaAUDnKkVUZQTkqQgXfa0Z4SGss1ElQfafA',
    access_token_secret: 'MSY57uqMaIMOtsRSWLvNDfL9DxaZXbrXGFak679tA78',
		authorize_callback: 'http://74.207.246.247:8000'
});

function merge (a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};

var states = {}, statesJSON = JSON.parse(fs.readFileSync('lib/States.json', encoding='utf8')).states.state; // this is an array 

_.each(statesJSON, function (obj, key){
		var name = obj['@attributes'].name
		,		abbr = obj['@attributes'].abbreviation;
		states[name] = abbr;
})

var track = {
	'New York City': 'nyc',
	'Los Angeles': 'la',
	Chicago: 'chi',
	Houston: null,
	Philadelphia: 'philly',
	Pheonix: null,
	'San Antonio': 'sananto',
	'San Diego': 'sd',
	Dallas: null,
	'San Jose': 'sj',
	Jacksonville: null,
	Indianapolis: 'indy', 
	'San Francisco': 'sf',
	Austin: null,
	Columbus: null,
	'Fort Worth': null,
	Charlotte: null,
	Detroit: null,
	'El Paso': 'ep',
	Memphis: null,
	Baltimore: null,
	Boston: null,
	Seattle: null,
	DC: 'kstreet',
	Nashville: null,
	Denver:  null,
	Louisville: null,
	Milwaukee: null,
	Portland: null,
	'Las Vegas': 'lv',
	'Oklahoma City': 'oklahoma',
	Albuquerque: 'abq',
	Tucson: null,
	Fresno: null,
	Sacramento: 'sac',
	'Kansas City': 'kc',
	Atlanta: null,
	'Colorado Springs': 'cs',
	Omaha: null,
	Atlanta: 'atl',
	Miami: null,
	Cleveland: null,
	Tulsa: null,
	Oakland: null,
	Minneapolis: null,
	'New Orleans': 'no',
	Pittsburgh:  null,
	'St Louis': 'stl',
	Cincinnati: null,
	'Saint Paul': 'sp',
	Lincoln: null,
	Madison: null,
	'Baton Rouge': null,
	Spokane: null,
	Cheyenne: null,
	Rochester: null,
	Birmingham: null,
	'San Bernardino': null,
	'Des Moines': null,
	Boise: null,
	Richmond: null,
	Montgomery: null,
	'Little Rock': null,
	'Salt Lake City':'slc',
	Tallahassee: null,
	Providence: null,
	Jackson: null,
	Salem: null,
	Topeka: null,
	Springfield:  null,
	Lansing: null,
	Juneau: null,
	Hartford: null,
	Dover: null,
	Hawaii: null,
	Augusta: null,
	Annapolis: null,
	'Jefferson City': 'jc',
	Montana: null,
	'Carson City': 'cc',
	Concord: null,
	Trenton: null,
	'Santa Fe': null,
	Albany: null,
	Bismarck: null,
	Harrisburg: null,
	Providence: null,
	Columbia: null,
	Pierre: null,
	Montpelier: 'mtp',
	Olympia: null,
	Charleston: null
};

var tick = 0;

		var switchBoard = {
			mapper: {},
			wipe: [],
			data : require('./makeData.js'),
			tracklist: ['ows', 'occupy', '99', '99percent', 'occupywallstreet', 'occupydc'],
			init: function(track){
				_.each(this.tracklist, function(tag){
					this.mapper[tag] = {},
					this.mapper[tag].key = 'Occupy Wall Street'
					this.mapper[tag].latest = []
				}, this)
				_.map(this.data.tracklist, function(value, key, list){
					var hash = 'occupy'+key;
					this.mapper[hash] = {};
					this.mapper[hash].key = key;
					this.mapper[hash].latest = [];
					this.tracklist.push(hash);
				}, this)
			},
			corral: {},
			parse: function(data){
				var parsed = JSON.parse(data);
				if(post.tags.length){
					var post = {
								_id : parsed.id_str,
								txt: parsed.text, 
								tags: parsed.entities.hashtags, 
								links: parsed.entities.urls, 
								pic: parsed.user.profile_image_url || parsed.user.profile_image_url_https, 
								time: parsed.created_at,
								author: parsed.user.name,
								home: 'http://twitter.com/'+parsed.user.screen_name,
								score: new Date().getTime() };
					parsed = null;
					this.process(post);
				}
				else {
					parsed = null;
				}
			},
			process: function(data){
				var _id = data._id;
				var hashtags = _.intersection(_.map(data.tags, function(e){return e.text.toLowerCase()}), this.tracklist);
				if(hashtags.length){
				_.each(hashtags, function(tag){
					console.log(tag);
						this.mapper[tag].latest.unshift(_id);
						++tick;
					//	this.file(tag, _id);
						this.stat(tag);
					},this);
					if(data.links.length){
						this.analyze(hashtags,data)
					}
				}
				else return
			},
			analyze: function(tags, data){
				_.each(data.links, function(url){
					var link = url.url, perma = url.expanded_url;
					_.each(tags, function(tag){client.zincrby(tag+':links', 1, JSON.stringify([link, perma]))})
					})
			},
			domit: function(b,tags){
				console.log(tags)
				var dom = jsdom.env({
					html: b,
					scripts: jQ,
					done: function(err, window) {
							if(err){console.log(err);return}
					    var $ = window.$;
							var link = window.location;
					    var link_title = $('title')[0].html() || null;
							_.each(tags, function(tag){
								client.zincrby(tag+':links', 1, JSON.stringify([link, link_title]), redis.print)
							})
					    }
					})
			},
			file: function(tag, _id){
				// client.zadd(tag, this.corral[_id].score, JSON.stringify(this.corral[_id]));
			},
			stat: function(tag){
				var len = this.mapper[tag].latest.length;
				if(len > 200) {
					this.wipe.unshift(this.mapper[tag].latest.splice(200, len - 1));
					_.map(_.uniq(this.wipe), this.del, this)
				}
			},
			del: function(_id){
				delete this.corral[_id];
			},
			lingoProcess: function(data){
				
			}
		};
		
		switchBoard.init(track);

		console.log(switchBoard.tracklist);

		twit.stream('statuses/filter', {track: _.map(switchBoard.tracklist, function(t){return '#'+t}).join()}, function(stream) {
		    stream.on('data', function (data) {
					  switchBoard.parse(data);
		    });
				stream.on('error', function(err){
					console.log('error here', err)
				})
		});

module.exports = switchBoard;
