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
