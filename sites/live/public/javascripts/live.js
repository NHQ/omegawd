  var socket = io.connect('http://74.207.246.247:8008');
  socket.on('news', function (data) {
    console.log(data);
		var post = JSON.parse(data);
		$('body').append(post.txt)
  });
