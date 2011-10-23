var http = require('http'), fs = require('fs');

var buff = new Buffer('citizen:peapod2011').toString('base64')

var tags = JSON.parse(fs.readFileSync('./lib/tracklist.json'))
var tats = ['occupy&-#occupy'];
var toots = ['occupy', 'chicago', '-twitter.com'];
subscribe(encodeURIComponent(tats.join("&")))
//subscribe(encodeURIComponent(toots.join('&')))
function subscribe (tag){
		var spfdr = http.createClient(80, 'superfeedr.com');
		var dataw = "hub.mode=subscribe&hub.verify=async&hub.topic=http://superfeedr.com/track/"+tag+"&hub.callback=http://74.207.246.247:8001/feed/"+tag;
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
