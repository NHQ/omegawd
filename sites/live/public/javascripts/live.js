var post = {
			'_id' : parsed.id_str,
			'txt': parsed.text, 
			'tags': parsed.entities.hashtags, 
			'links': parsed.entities.urls, 
			'pic': parsed.user.profile_image_url || parsed.user.profile_image_url_https, 
			'time': parsed.created_at,
			'author': parsed.user.name,
			'home': 'http://twitter.com/'+parsed.user.screen_name,
			'score': new Date().getTime() 
};

function append (data){
	var li = document.createElement('li'),
			div = document.createElement('div');
	var html = 	'<img src='+data.pic+'></img><p>'+data.txt+'</p>';
			div.insertBefore(html);
			li.insertBefore(div);
			$('ul#post').append(li);
}

  var socket = io.connect('http://74.207.246.247:8008');
  socket.on('news', function (data) {
    console.log(data);
		append(data);
  });
