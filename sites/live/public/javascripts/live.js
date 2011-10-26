function append (datum){
	var data = JSON.parse(datum);
	var html = 	'<li class="post"><img class="thumb" src='+data.pic+'></img><p>'+data.txt+'</p></li>';
			$('ul#post').append(html);
}

	var socket = io.connect('http://74.207.246.247:8008');
  socket.on('news', function (data) {
    console.log(data);
		append(data);
  });
