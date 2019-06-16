$(function () {
	var socket = io();
	$('#form').submit(function () {
		var file = $('#fileinput')[0].files[0];
		if (file != null) {
			var ext = file.name.split('.').pop();
			var filename = getUniqueStr() + '.' + ext;
			var fileReader = new FileReader();

			fileReader.readAsBinaryString(file);
			fileReader.onload = function (e) {
				var data = {
					binary: e.target.result,
					filename: filename
				};
				socket.emit('upload', data);
			}
		}
		return false;
	});
});

function getUniqueStr() {
	var strong = 10000;
	return new Date().getTime().toString(16) + Math.floor(strong * Math.random()).toString(16)
}