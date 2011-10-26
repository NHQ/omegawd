var reg = new RegExp(/t.co/i), usr = new RegExp(/@[a-z0-9_]*/i);

function loadimg (data){
	var cut = data.indexOf("_normal");
	var pic = data.slice(0, cut)+data.slice(cut+7)
	var img = new Image;
	img.src = pic;
	return img
}


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
	
	var html = 	'<li class="post"><div class="img"><a href='+data.home+'>'+pic+'</a></div></div class="txt"><p>'+txt+'</p></div></li>';
			$('ul#post').append(html);
}

	var socket = io.connect('http://74.207.246.247:8008');
  socket.on('news', function (data) {
    console.log(data);
		append(data);
  });
