/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer(),
    redis = require("./redis"),
		connect = require('connect'),
  	_ = require('underscore'),
		client = redis.createClient(),
    sub = redis.createClient(),
    pub = redis.createClient(),
    crypto = require('crypto')
    , http = require('http')
    , url = require('url')
		, querystring = require('querystring')
    , fs = require('fs')
    , sys = require(process.binding('natives').util ? 'util' : 'sys')
    , server
	, RedisStore = require('connect-redis')(express), multi
	, fb = require('facebook-js'),
  async = require('async'),
  request = require('request');

function epoch(){return Math.round(new Date().getTime()/1000.0)};

client.on("error", function (err) {
    console.log("Error " + err);
});

// Configuration

app.configure(function(){
  app.use(express.logger({ format: '\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms' }));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'superSecret!', cookie: {maxAge: 60000 * 2000}, store: new RedisStore()}));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
});



function getSesh (req, res, next){
	if(!req.session.id)
		res.redirect('/fb');
	if(req.session.id)
	{
		console.log(req.session._id)
		client.hgetall(req.session._id, function(err, p){
			console.log(p);
			req.person = p;
			next();
		})
	}
};



function frontis(facts){
	var facts = facts;
	var channel = new Array();
	var articles = new Array();
	client.get(facts+':channels', function (err, channels){
		if(err){console.log(err)}
		channels = JSON.parse(channels);
		for (c in channels)
		{
			client.smembers(facts+':'+channels[c], function (err, source){
				if(err){console.log(err)}
				console.log(source);
				for (s in source)
				{
					client.zrevrangebyscore(source[s], epoch(), epoch()-450061, "limit", "0", "75", function(err, title){
						if(err){console.log(err)}
						client.hmget(title, 'title', 'score', 'feed', 'link', function (err, content){
							if(err){console.log(err)}	
							media = {'channel':channels[c],'feed':source[s],'content':content}
							articles.push(media);
						})
					})
				}
			})		
		}
		return articles
	})
};

// Routes

app.get('/newFeed/', getSesh, function (req, res){
  var feeds = JSON.parse(req.person.feeds);
  var newFeed = req.query.furl, channels = [];
  async.map(feeds, function(each,callback){
    _.each(each.chans, function(e){channels.push(e)})
    callback(null,null);
    }, function(err){
      res.render('newFeed',{locals:{newFeed:newFeed, channels:_.uniq(_.flatten(channels))}});
    })
});

app.get('/link', function (req, res ){
	res.writeHead('200');
	title = decodeURIComponent(req.query.title);
	client.hget(title, 'link', function (err, link){
		res.redirect(link);
		res.end()
	})
});

app.get('/logout', function(req,res){
	res.session.destroy;
	res.redirect('/')
});

app.get('/init', getSesh, function (req, res){
  var feeds = JSON.parse(req.person.feeds);
  channels = [];
  async.map(feeds, function(each, callback){
    _.each(each.chans, function(e){channels.push(e)});
    client.zrevrangebyscore(each.feed, epoch(), epoch()-900061, "limit", "0", "25", function(err, titles){
    if(err){res.write('error')}
		else
		{
			var multi = client.multi();
			for (t in titles)
			{
				multi.hmget(titles[t], 'title', 'feed', 'score', 'link')
			}
			multi.exec(function (err, arrayRay){
        each.titles = arrayRay;
        callback(null, each)
			})
		}
	})}, function(err, content){
			console.log(content);
      req.content = content;
      res.render('index', {locals: {feeds: req.content, channels:_.uniq(_.flatten(channels))}});
  })

});

app.get('/userChannels', getSesh, function (req, res){
		res.writeHead('200');
    res.write(JSON.stringify(req.person.feeds))
    res.end();
});

app.post('/followFeed', getSesh, function (req, res){
  var feeds = JSON.parse(req.person.feeds);
  feeds.push({feed:decodeURIComponent(req.body.feed), chans:req.body.channels});
	console.log(JSON.stringify(feeds));
	client.hset(req.session.id, 'feeds', JSON.stringify(feeds), function(e,r){
		if(e)console.log(e);
		console.log(r);
		follow(req.body.feed);
    res.writeHead('200');
    res.end()
	})
});
	// fix this one!
app.post('/followNot', getSesh, function (req, res){


		followNot(req.query.feed)

});
	// all so broke!
app.post('/addChannel', getSesh, function (req, res){
	// this is an AJAX route
})
app.get('/getFeed', function (req, res){
  console.log(req.query);
	client.zrevrangebyscore(decodeURIComponent(req.query.feed), epoch(), epoch()-450061, "limit", "0", "75", function(err, titles){
		if(err){res.write('error')}
		else
		{
			var multi = client.multi();
			for (t in titles)
			{
				multi.hmget(titles[t], 'title', 'feed', 'score', 'link')
			}
			multi.exec(function (err, arrayRay){
        console.log(arrayRay);
          res.writeHead('200');
				res.write(JSON.stringify(arrayRay));
				res.end();
			})
		}
	})
});

app.error(function(err, req, res, next) {
  if (err instanceof NotFound) {
    res.redirect('/');
  } else {
    next(err);
  }
});

send404 = function(res){
  res.writeHead(404);
	res.redirect('/');
  res.end();
};

function follow(feed){
	var unfurl = decodeURIComponent(feed);
	console.log(unfurl);  
	client.exists(unfurl, function(err,answer){
		if (err){console.log(err)}
		console.log(answer);
		if (answer == 0)
			{
				console.log('subscringing to: '+unfurl);
				client.zadd(unfurl, -1, unfurl);
				client.incr('subs@'+unfurl);
				subscribe(unfurl);
			}
		else
		{
			client.incr('subs@'+unfurl);
		}			
	});
	client.sismember('allfeeds1123848451', unfurl, function(err, answer){
		if (err){console.log(err)}
		if (answer === 0)
		client.sadd('allfeeds1123848451', unfurl);
	});
};

function followNot (furl){
	var unfurl = decodeURIComponent(furl);
	client.decr('subs@'+unfurl, function(err, score){
		if (score === 0){
		client.del(unfurl);
		unsubscribe(unfurl)
	}});
};

function unsubscribe (feed){
	var buff = new Buffer('citizen:peapod2011').toString('base64');
		spfdr = http.createClient(80, 'superfeedr.com');
		datat = "hub.mode=unsubscribe&hub.verify=sync&hub.topic="+feed+"&hub.callback=http://74.207.246.247:8002/feed";
		var request = spfdr.request('POST', '/hubbub', {
			'Host':'superfeedr.com',
			"Authorization":"basic "+buff,
			'Accept':'application/json',
			'Content-Length': datat.length
		});
		request.write(datat, encoding='utf8');
		request.on('response', function (response){
			response.on('data', function (stuff){
				console.log(stuff.toString('utf8', 0, stuff.length))
			})
		})
		request.end();
};

function subscribe (feed){
	var buff = new Buffer('citizen:peapod2011').toString('base64');
	
		var spfdr = http.createClient(80, 'superfeedr.com');
		var dataw = "hub.mode=subscribe&hub.verify=async&hub.topic="+feed+"&hub.callback=http://74.207.246.247:8002/feed";
		var request = spfdr.request('POST', '/hubbub', {
			'Host':'superfeedr.com',
			"Authorization":"basic "+buff,
			'Accept':'application/json',
			'Content-Length': dataw.length
		});
		request.write(dataw, encoding='utf8');
		request.on('response', function (response){
			response.on('data', function (stuff){
				console.log(stuff.toString('utf8', 0, stuff.length))
			})
		})
		request.end();
};

app.get('/feed', function(req, res){
	if (req.query['hub.challenge'])
	{	res.writeHead('200');
	//path = url.parse(req.url).query;
	//queriness = querystring.parse(path, sep='&', eq='=');
	var challenge = req.query['hub.challenge'];
	res.write(challenge);
	res.end();
	console.log(req.headers);
	console.log(challenge);}
	else
	{
		res.writeHead('200');
		res.end();
	}
});

app.post('/feed', function(req, res){
	var path = url.parse(req.url).query;
	var queriness = querystring.parse(path, sep='&', eq='=');
	var channel = queriness.channel;
	res.writeHead('200');
	res.end();
	var d = req.body;
	var dl = d.items.length;
	var unfurl = d.status.feed
	for (x = 0; x < dl; ++x){
		var picture = ""; // do what the green line says!
		var content = "";	
		var summary = "";
		if (d.items[x].standardLinks && d.items[x].standardLinks.picture){
			picture = d.items[x].standardLinks.picture[0].href
		};
		if (d.items[x].content){
			content = d.items[x].content
		};
		if (d.items[x].summary){
			summary = d.items[x].summary
		};
		var title = d.items[x].title.replace(/&nbsp;/g, " ");
		client.zadd(unfurl, d.items[x].postedTime, title.replace(/\s/g, "_"), function(err, reply){if (err){sys.puts(err)}});
		client.zadd(unfurl,-2, d.status.feed, function(err, reply){if (err){sys.puts(err)}});
		client.hmset(title.replace(/\s/g, "_"), 
			{
				"content": content,
				"summary": summary,
				"link": d.items[x].permalinkUrl,
				"title":title,
				"pic": picture,
				"furl": unfurl,
				"score": d.items[x].postedTime,
				"created": d.items[x].postedTime,
				"feed": d.status.feed
			}, function(err, reply){
				if (err)
					{
						console.log("error: " + err)
					}
			});	
		console.log(d)
	};
});

app.get('/fb', function (req, res) {
  res.redirect(fb.getAuthorizeUrl({
    client_id: '190292354344532',
    redirect_uri: 'http://74.207.246.247:8002/fb/auth',
    scope: 'user_location,user_photos'
  }));
});

app.get('/fb/auth', function (req, res) {
  fb.getAccessToken(
		'190292354344532'
		, 'ac9d7f273a15e91ac035871d04ef1915'
		, req.param('code')
		, 'http://74.207.246.247:8002/fb/auth'
		, function (error, access_token, refresh_token) {
  			fb.apiCall('GET', '/me',
 				{access_token: access_token, fields:'id,gender,first_name, middle_name,last_name,location,locale,friends,website'},
 				function (err, response, body){
					req.session._id = body.id;
    			client.exists(body.id, function(err,que){
      			console.log(que);
      			if (que == 0){
							var person = {
									fname: body.first_name,
									mname: body.middle_name,
									lname: body.last_name,
									gender: body.gender, 
									website: body.website,
									fb_access_token: access_token,
									fbx: JSON.stringify(body.friends.data),
									fb_id: body.id,
									feeds:JSON.stringify([]) // each feed is obj {feed:,channels:}, redis requires strings only
							};
							client.hmset(body.id, person, function(err, r){
								if(err){console.log(err)}
								res.redirect('/init')
							})
						}
      			if (que == 1){
          		client.hset(body.id, 'fb_access_token', 'access_token', 'fbx', 'body.friends.data', function(e,r){
            		if(err)console.log(err)
								res.redirect('/init')
              })            
        		}
    			})	
			});
 		});
});


if (!module.parent) {
  app.listen(8002);
  sys.puts("Express server listening on port %d", app.address().port);
}
