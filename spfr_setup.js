var http = require('http'), fs = require('fs')
,   buff = new Buffer('citizen:peapod2011').toString('base64')
,   antiTags = ['twitter', 'wikipedia', 'etsy', 'raveis', 'getglue']
,   tracks = []
;


var spfdr = Object.create(null);
spfdr.api = function(mode, url, tag){
  tracks.push(url);
  console.log(url)
  var spfdr = http.createClient(80, 'superfeedr.com')
  ,   address = tag ? encodeURI(tag) : ''
  ,   data = "hub.mode="+mode+"&hub.verify=async&hub.topic="+encodeURIComponent(url)+"&hub.callback=http://74.207.246.247:8001/feed/"+address
  ,   request = spfdr.request('POST', '/hubbub', {
		    'Host':'superfeedr.com',
		    "Authorization":"basic "+buff,
		    'Accept':'application/json',
		    'Content-Length': data.length,
		    'options.agent':false
  			
	    });
	    request.write(data, encoding='utf8');
  		request.on('response', function (res){
        console.log(res.headers);
  			res.on('data', function (stuff){
  			})
  		})
  		request.end();
};
spfdr.pubsub = function(mode, feed){ // arrays only please!
  if (Array.isArray(feed)){
    console.log('array');
    var anti = antiTags.length ? '&-'+antiTags.join('&-') : ''
    ,   url = "http://superfeedr.com/track/";
    feed.forEach(function(tag){
      console.log(tag);
      spfdr.api(mode, url + tag + anti, tag)
    }); 
    return}
  else 
    {spfdr.api(mode, feed, null); return}
      
}
spfdr.addSpam = function(tag){
  antiTags.push(tag)
}
spfdr.addTag = function(tag){
  tags.push(tag)
}
spfdr.trackAll = function(){
  tracks.forEach(
    function(tag){
    spfdr.pubsub('subscribe', null, tag)
    }
  )
}
spfdr.halt = function(){
  tracks.forEach(
    function(tag){
    spfdr.pubsub('subscribe', null, tag)
    }
  )
}

spfdr.subscribe = function (word, src){
		var tag = word+'&-twitter&-wikipedia&-etsy&-raveis&-getglue';
		var url = encodeURIComponent("http://superfeedr.com/track/"+tag)
		var spfdr = http.createClient(80, 'superfeedr.com');
		var dataw = "hub.mode=subscribe&hub.verify=async&hub.topic="+url+"&hub.callback=http://74.207.246.247:8001/feed/"+word;
		var request = spfdr.request('POST', '/hubbub', {
			'Host':'superfeedr.com',
			"Authorization":"basic "+buff,
			'Accept':'application/json',
			'Content-Length': dataw.length,
			'options.agent':false
      
		});
		request.write(dataw, encoding='utf8');
		request.on('response', function (response){
			response.on('data', function (stuff){
			})
		})
		request.end();
};
module.exports = spfdr;

