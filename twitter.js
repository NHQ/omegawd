var twitter = require('twitter'),
		_ = require('underscore'),
		client = require('redis');

var twit = new twitter({
    consumer_key: 'mw6Dw4adevPW0l67wHk3hw',
    consumer_secret: 'iW0KQprGmvzpTvY0KZuLONdHrdYi9FBErBRIZGH0CM',
    access_token_key: '46961216-ns6DWzNaAUDnKkVUZQTkqQgXfa0Z4SGss1ElQfafA',
    access_token_secret: 'MSY57uqMaIMOtsRSWLvNDfL9DxaZXbrXGFak679tA78',
		authorize_callback: 'http://74.207.246.247:8000'
});

var track = {
	'Occupy':'',
	'Wall Street': 'ows',
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
	Madions: null,
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
	
	var tracklist = [];
	var mapper = {};
	var t = new RegExp(/#occupy*/);
	var tps = function(key){
		this.name = key;
		this.init = function(){
			this.timer = setInterval(this.set(), 1000)
		};
		this.set = function(){
				console.log(this.name, this.tick);
				this.tick = 0;
		};
		this.tick = 0
	}
	
	_.map(track, function(value, key, list){
		var hash = '#occupy'+key.replace(/\s/g,"");
		mapper[hash] = {};
		mapper[hash].key = key;
		mapper[hash].latest = [];
		mapper[hash].tps = new tps(key);
		tracklist.push(one);
		mapper[key].tags.push(one)
		if (value){
			var hash2 = '#occupy'+value;
			tracklist.push(hash2);
			mapper[hash2].tags.push(two);
			mapper[hash2].name = key;
			mapper[hash2].latest = [];
			mapper[hash2].tps = new tps(key);
		}
	})

		this.switchBoard = {
			corral: {},
			parse: function(data){
				var parsed = JSON.parse(data);
				this.corral[parsed.id_str] = {
							_id : parsed.id_str,
							txt: parsed.text, 
							tags: parsed.entities.hashtags, 
							links: parsed.entities.urls, 
							pic: parsed.user.profile_image_url || parsed.user.profile_image_url_https, 
							time: parsed.created_at };
				if(parsed.tags.length){
					this.process([parsed.id_str, parsed.tags]);
				}
//				else {
//					this.lingoProcess([parsed.id_str, parsed.text])
//				}
			},
			process: function(data){
				_.each.(data[1], function(hash){
					if(_.contains(tracklist, hash)){
						mapper[hash].latest.shift(this.corral[data[0]])
						++mapper[hash].tps.tick
					}
				}
			},
			lingoProcess: function(date){
				
			}
		}

		twit.stream('statuses/filter', {track: '#ows'}, function(stream) {
		    stream.on('data', function (data) {
						this.switchBoard.parse(data)
		    });
				stream.on('error', function(err){
					console.log(err)
				})
		});
		
