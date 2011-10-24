var connect = require('connect')
,		vhost = require('./lib/subDomani')
,		_ = require('underscore')
,		redis = require('redis')
,		client = redis.createClient();

var server = connect();
		server.use(connect.profiler());
		server.use(connect.logger());
		server.use(connect.query());
		server.use(connect.bodyParser());
		server.use(connect.router(function(app){
			
			app.get('/feed/:tag', function(req, res){
				console.log(req.params.tag);
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
			
			app.post('/feed/:tag', function(req, res){
				console.log('spfrd post')
				console.log(req.params.tag)
				res.writeHead('200');
				res.end();
				var tag = req.params.tag;
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
					console.log(d.items[x].permalinkUrl);
					var body = {
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
					client.zadd(tag+'links', new Date().getTime(), d.items[x].permalinkUrl);
					client.zincrby(tag+'hotlinks', 1, d.items[x].permalinkUrl);
					client.hmset(d.items[x].permalinkUrl, body, function(err, reply){if (err){sys.puts(err)}});					
				};
			});
		}))
		server.listen(8001);
		console.log('Listening on ' + server.address().port);