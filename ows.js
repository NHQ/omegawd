var fs = require('fs'),
		twitter = require('twitter'),
		_ = require('underscore'),
		redis = require('redis'),
		client = redis.createClient(),
		request = require('request'),
		spfdr = require('./spfr_setup.js'),
		pub = redis.createClient(),
    hurl = require('url'),
    src = 'twtr',
    ben = require('ben');
		console.log(spfdr)
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
			tracklist: ['ows', 'occupy', '#99', '99percent', 'occupywallstreet','occupywallst', 'occupydc', 'generalstrike'],
			init: function(track){
        this.begin = new Date().getTime() / 1000;
				_.each(this.tracklist, function(tag){
					this.mapper[tag] = {},
					this.mapper[tag].key = 'Occupy Wall Street'
					this.mapper[tag].latest = []
				}, this)
				_.map(this.data.tracklist, function(value, key, list){
					var hash = value.replace(/\s/g,"");
					this.mapper[hash] = {};
					this.mapper[hash].latest = [];
					this.tracklist.push(hash);
				}, this)
				_.map(this.data.states, function(value, key, list){
					var hash = key;
          Object.keys(value.cities).forEach(function(e){this.tracklist.push(e.replace(/\s/g, "").toLowerCase())}, this)
					this.tracklist.push(hash.toLowerCase());
				}, this)
        fs.writeFileSync('lib/all-tracks.json', JSON.stringify(switchBoard.tracklist));
        this.reglist = _.map(this.tracklist, function(tag){return new RegExp(tag, "i")})
//        console.log(this.reglist);
       
				spfdr.pubsub('subscribe', this.tracklist)
        
			},
			corral: {},
      rly: true,
      count: 0,
      tps: function(){
        return this.count / ((new Date().getTime() / 1000) - this.begin)
      },
			parse: function(data){
        this.count += Buffer.byteLength(data, 'utf8')
//        console.log(this.tps());
				var parsed = JSON.parse(data);
				if(parsed.entities.urls && parsed.entities.urls.length){
					var post = {
                'title': null,
					      'retweeted': parsed.retweeted ? parsed.retweet_count : 0,
								'_id' : parsed.id_str,
								'content': parsed.text, 
								'tags': parsed.entities.hashtags, 
								'links': parsed.entities.urls, 
								'pic': parsed.user.profile_image_url || parsed.user.profile_image_url_https, 
								'time': parsed.created_at,
								'author': parsed.user.name,
								'location': parsed.user.location ? parsed.user.location : false,
								'author_home': 'http://twitter.com/'+parsed.user.screen_name,
								'score': new Date().getTime() / 1000
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
      regTest: function(word){
        return _.find(switchBoard.tracklist, function(tag){
            return word.match(tag)
        })
      },
      apt: function(a,b){
       console.log(b-a);
      },
			process: function(data){
        var a = new Date().getTime()/1000, b;
				var data = data;
				var _id = data._id;
        var natty = data.content.toLowerCase().split(/\s/);
        var tags = _.compact(_.map(this.tracklist, function(reg){
          var match = data.content.indexOf(reg);
          if (match > -1){return reg};
          return
        },this));
/*        var tags = _.compact(_.map(natty, function(word){
          var match = _.find(switchBoard.reglist, function(reg){
//            var winning = word.match(reg);
//            if (winning) return winning[0];
            return word.match(reg)
          })
          return word.match(match)[0] || null 
          b = new Date().getTime()/1000;

        }))
       var tags = _.filter(natty, function(word){
          var word = word;
          return _.find(switchBoard.reglist, function(reg){
//            var winning = word.match(reg);
//            if (winning) return winning[0];
            return word.match(reg)
          })
        }, this)
*///        var tags = _.intersection(_.map(switchBoard.tracklist, function(e){return e.toLowerCase()}) ,_.map(natty, function(e){return reg.exec(e.toLowerCase()}));
//        if(!tags.length)console.log('no tags', natty);
        tags.forEach(function(tag){
          console.log(tag);
          client.zincrby(src+':tags:all', 1, tag, function(err, reply){if (err){console.log(err)}})  
        })
        //var hashtags = _.map(data.tags, function(e){return e.text.toLowerCase()}) //_.intersection(_.map(data.tags, function(e){return e.text.toLowerCase()}) ,_.map(this.tracklist, function(e){return e.toLowerCase()}));
//				if(data.links.length){
					this.analyze(tags,data) // <-- you stoopid
//				}
/*        if(hashtags.length){
					hashtags.forEach(function(tag){
            client.zincrby('twtr:tags:analytics', 1, tag, function(e,r){if(e)console.log(e)})
						pub.publish(tag+':pub', JSON.stringify({'source' : 'twtr', 'body': data}))
					});
				}
				else {

        }
*/			},
			analyze: function(tags, datum){
				var data = datum, tags = tags;
				if(data.retweeted){ // most retweeted links here, by RT count
					client.zincrby(src+':'+tag+':rt', data.retweeted, perma, function(e,r){
						if(e)console.log(e)
					});
				}
				_.each(data.links, function(url){
					var link = url.url, perma = url.expanded_url;
					if(perma)
            var host = hurl.parse(perma).host;
//            client.zadd('twtr:'+host, new Date().getTime()/1000, perma, function(err, reply){if (err){console.log(err)}})  
            client.zincrby(src+':hosts:all', 1, host, function(err, reply){if (err){console.log(err)}});
            client.zincrby(src+':'+host+':links', 1, perma, function(err, reply){if (err){console.log(err)}});
					_.each(tags, 
						function(tag){      
                client.zincrby(src+':'+host+':tags', 1, tag, function(err, reply){if (err){console.log(err)}});
                client.zincrby(src+':'+tag+':hosts', 1, host, function(err, reply){if (err){console.log(err)}});
                client.zincrby(src+':'+tag+':links', 1, perma, function(err, reply){if (err){console.log(err)}});
/*
								client.zincrby(tag+':hotlinks', 1, perma, function(e,r){
									if(e)console.log(e)
								});
								client.zadd(tag+':links', data.score, perma, function(e,r){
									if(e)console.log(e)
								});
						    client.zadd(tag+':latest', data.score, data, function(e,r){
									if(e)console.log(e)
									client.zremrangebyrank(tag+':latest', 0, Math.floor((new Date().getTime() / 1000) - (3600 * 5)),function(err){if (err)console.log(err)})
								});
*/
						})
				})
			},
			domit: function(b,tags){
				var dom = jsdom.env({
          parser: 'someday set this parser to browser spec',
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
		var timeout = 1000
		switchBoard.init();
//		console.log(_.map(switchBoard.tracklist, function(t){return t}).join());
    function streamOn(){
      	twit.stream('statuses/filter', {track: _.map(switchBoard.tracklist, function(t){return t}).join()}, function(stream) {
		    stream.on('data', function (data) {
					  switchBoard.parse(data);
		    });
				stream.on('error', function(err){
					console.log('error here', err)
				});
  			stream.on('end', function(){
          stream.destroy();
					console.log('end here');
          timeout = timeout * 1.5;
          setTimeout(streamOn,timeout);
				})        
		});
    }
    //streamOn();
module.exports = switchBoard;
