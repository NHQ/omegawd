var connect = require('connect')
,		vhost = require('./lib/subDomani')
,		_ = require('underscore')
,		redis = require('redis')
,		client = redis.createClient()
, sys = require('util');

var server = connect();
		server.use(connect.profiler());
		server.use(connect.logger());
		server.use(connect.query());
		server.use(connect.bodyParser());
		server.use(connect.router(function(app){
			
			app.get('/feed/:tag', function(req, res){
				if (req.query['hub.challenge'])
				{	res.writeHead('200');
				//path = url.parse(req.url).query;
				//queriness = querystring.parse(path, sep='&', eq='=');
				var challenge = req.query['hub.challenge'];
				res.write(challenge);
				res.end();
				else
				{
					res.writeHead('200');
					res.end();
				}
			});
			
			app.post('/feed/:tag', function(req, res){
				res.writeHead('200');
				res.end();
				var tag = req.params.tag;
				var d = req.body;
				console.log(d);
				var dl = d.items.length;
				var unfurl = d.status.feed
				for (x = 0; x < dl; ++x){
					var picture = null; // need stock pic
					var content = null;	
					var summary = null;
					if (d.items[x].standardLinks && d.items[x].standardLinks.picture){
						picture = d.items[x].standardLinks.picture[0].href
					};
					if (d.items[x].content){
						content = d.items[x].content.slice(0,200)
					};
					if (d.items[x].summary){
						summary = d.items[x].summary
					};
					var title = d.items[x].title.replace(/&nbsp;/g, " ");
					var body = {
						'tag': tag,
						'_id': 'spfdr' + Math.random().toString().slice(2), 
						"title": title,
						"content": content,
						"summary": summary,
						"link": d.items[x].permalinkUrl,
						"title":title,
						"pic": picture,
						"furl": unfurl,
						"score": d.items[x].postedTime,
						"created": d.items[x].postedTime,
						"feed": d.status.feed
					};
					client.publish(tag+':pub', JSON.stringify({'source': 'spfdr', 'body': body}));
					client.sadd(tag+':superfeedr', d.items[x].permalinkUrl, function(err, reply){if (err){console.log(err)}})
					client.zadd(tag+':links', new Date().getTime(), d.items[x].permalinkUrl, function(err, reply){if (err){console.log(err)}});
					client.zadd(tag+':superlinks', new Date().getTime(), JSON.stringify(body), function(err, reply){if (err){console.log(err)}});
					client.zincrby(tag+':hotlinks', 5, d.items[x].permalinkUrl,  function(err, reply){if (err){console.log(err)}});
					client.zadd(tag+':latest', body.score, body, function(e,r){
						if(e)console.log(e)
						client.zremrangebyrank(tag+':latest', 0, (new Date().getTime() / 1000) - (3600 * 5),function(err){if (err)console.log(err)})
					});
					// client.hmset(body._id, body, function(err, reply){if (err){console.log(err)}});					
				};
			});
		}))
		server.listen(8001);
		console.log('Listening on ' + server.address().port);