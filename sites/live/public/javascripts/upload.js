
	var ui = {}
	ui.readFile = function (file) {
    console.log(file);
    var reader = new FileReader();
		if(file.webkitSlice){
			var blob = file.webkitSlice(0,1024 * 1024)			
		}
		if(file.mozSlice){
     var blob = file.mozSlice(0, 1024 * 1024);			
		}
		ui.socket.emit('blob', blob);
    reader.onloadend = function(event) {
//      document.getElementById('console').textContent = event.target.result;
//				var thing = Uint8Array(event.target.result)
				var data = new DataView(event.target.result);
				var uInt8Array = new Uint8Array(event.target.result);
				var byte3 = uInt8Array[4];
				var i = data.getUint8(4, 6);
				console.log('length',i, data, uInt8Array.length)
        $('#console').html(i)
					ui.socket.emit('blob', [0, uInt8Array])
    };

    reader.onerror = function(x) {
//      document.getElementById('console').innerHTML = 'Unable to read ' + file.fileName;
      console.log(x, 'error summin abt', file.fileName)
    };

    reader.readAsArrayBuffer(blob);
  }
	ui.cancel = function (e) {
	  e.preventDefault()
	  return false
	};
	ui.drop = function (e) {
	  e.preventDefault();
	  var dt = e.dataTransfer;
	  var files = dt.files;
  	  var File = files[0];
  	  ui.readFile(File);
  	  return false
}
	ui.init = function(){
		this.socket = io.connect('http://localhost:8008');
		this.socket.on('connect', function(){
			console.log('connected')
		})
		this.socket.on('conf', function(e,r){
			console.log('conf', e, r)
		})
		var dropFile;

		dropFile = document.getElementById("dropFile");
		dropFile.addEventListener("dragenter", ui.cancel, false);
		dropFile.addEventListener("dragover", ui.cancel, false);
		dropFile.addEventListener("drop", ui.drop, false);
		
		this.x = window.innerHeight,
		this.y = window.innerWidth;
		$('#console').css({
			left : ( ui.y - 667 ) / 2
		})
		$(window).one('resize', function(e){	ui.init()})
	};
	ui.init()
