var fs = require('fs'),
		twitter = require('twitter'),
		_ = require('underscore'),
		redis = require('redis'),
		client = redis.createClient(),
		request = require('request'),
		subscribe = require('./spfr_setup.js'),
		pub = redis.createClient();
		
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


		var switchBoard = {
			mapper: {},
			wipe: [],
			data : require('./makeData.js'),
			tracklist: ['ows', 'occupy', '99', '99percent', 'occupywallstreet','occupywallst', 'occupydc', 'generalstrike'],
			init: function(track){
				_.each(this.tracklist, function(tag){
					this.mapper[tag] = {},
					this.mapper[tag].key = 'Occupy Wall Street'
					this.mapper[tag].latest = []
				}, this)
				_.map(this.data.tracklist, function(value, key, list){
					var hash = 'occupy'+value;
					this.mapper[hash] = {};
					this.mapper[hash].latest = [];
					this.tracklist.push(hash);
				}, this)

				var spfdr = ['occupy', 'ows', 'occupywallstreet', '99percent'];
				this.tracklist.forEach(function(e){
					subscribe(e, 'tumblr')})
			},
			corral: {},
			parse: function(data){
				var parsed = JSON.parse(data);
				if(parsed.entities.hashtags.length){
					var post = {
					      'retweeted': parsed.retweeted ? parsed.retweet_count : false,
								'_id' : parsed.id_str,
								'txt': parsed.text, 
								'tags': parsed.entities.hashtags, 
								'links': parsed.entities.urls, 
								'pic': parsed.user.profile_image_url || parsed.user.profile_image_url_https, 
								'time': parsed.created_at,
								'author': parsed.user.name,
								'location': parsed.user.location ? parsed.user.location : false,
								'home': 'http://twitter.com/'+parsed.user.screen_name,
								'score': new Date().getTime() 
					};
					this.process(post);
					if(parsed["retweeted_status"]){
						var repost = JSON.stringify(parsed["retweeted_status"]);
						this.parse(repost)
					}
					parsed = null;
				}
				else {
					parsed = null;
				}
			},
			process: function(data){
				var data = data;
				var _id = data._id;
				var hashtags = _.intersection(_.map(data.tags, function(e){return e.text.toLowerCase()}), this.tracklist);
				if(hashtags.length){
					hashtags.forEach(function(tag){
						pub.publish(tag+':pub', JSON.stringify({'source' : 'twtr', 'body': data}))
					});
					if(data.links.length){
						this.analyze(hashtags,data)
					}
				}
				else return
			},
			analyze: function(tags, datum){
				var data = datum, tags = tags;
				_.each(data.links, function(url){
					var link = url.url, perma = url.expanded_url;
					if(perma)
					_.each(tags, 
						function(tag){
							console.log(tag);
								client.zincrby(tag+':hotlinks', 1, perma, function(e,r){
									if(e)console.log(e)
								});
								client.zadd(tag+':links', data.score, perma, function(e,r){
									if(e)console.log(e)
								});
								client.hmset(perma, data, function(e,r){
									if(e)console.log(e)
								});
						})
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
		
		switchBoard.init();
		console.log(_.map(switchBoard.tracklist, function(t){return '#'+t}).join());
		twit.stream('statuses/filter', {track: _.map(switchBoard.tracklist, function(t){return '#'+t}).join()}, function(stream) {
		    stream.on('data', function (data) {
					  switchBoard.parse(data);
		    });
				stream.on('error', function(err){
					console.log('error here', err)
				})
		});

module.exports = switchBoard;
