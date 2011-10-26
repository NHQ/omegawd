var reg = new RegExp(/t.co/i), usr = new RegExp(/@[a-z0-9_]*/i);

function append (datum){
	var data = JSON.parse(datum);
	var text = data.txt.split(" ");
	var pic = loadimg(data.pic)
	var txt = _.map(text, function(e){
			if(reg.test(e)){
				return '<a href='+e+'>'+e+'</a>'
			} 
			else if(usr.test(e)){
				return '<a href=http://twitter.com/#!/'+e.slice(1)+'>'+e+'</a>'
			}
			else return e
		}).join(" ")
		var cut = data.pic.indexOf("_normal");
		var pic = data.pic.slice(0, cut)+data.pic.slice(cut+7);
	var html = 	'<li class="post"><div class="img"><a href='+data.home+'><img src='+pic+'></a></div></div class="txt"><p>'+txt+'</p></div></li>';
			$('ul#post').append(html);
}

	var socket = io.connect('http://74.207.246.247:8008');
  socket.on('news', function (data) {
		append(data);
  });
