var socket = io();
var contentId = $("#posts").data("content-id");
socket.emit('chat join', contentId);

$('#form').submit(function () {
	var post = {
		contentId: contentId,
		body: {
			text: $('#m').val(),
			reprintingProhibited: false
		}
	};

	var file = $('#fileinput')[0].files[0];
	if (file != null) {
		var ext = file.name.split('.').pop();
		var filename = getUniqueStr() + '.' +  ext;
		var fileReader = new FileReader();

		fileReader.readAsBinaryString(file);
		fileReader.onload = function (e) {
			var data = {
				binary: e.target.result,
				filename: filename
			};
			socket.emit('upload', data);
		}

		post.attach = {
			url: "/uploads/" + filename
		};
	}

	socket.emit('chat message', post );
	$('#m').val("");

	return false;
});

socket.on('chat message', function (post) {
	$('#posts').prepend($(post.html));
});

$("#posts").on('click', '.positive-button', function () {
	$(this).prop("disabled", true);
	var postId = $(this).closest("article").data("postId");
	var emotion = {
		postId: postId,
		stem: "positive"
	};
	socket.emit('emotion', emotion);
});

$("#posts").on('click', '.negative-button', function () {
	$(this).prop("disabled", true);
	var postId = $(this).closest("article").data("postId");
	var emotion = {
		postId: postId,
		stem: "negative"
	};
	socket.emit('emotion', emotion);
});

function getUniqueStr() {
	var strong = 10000;
	return new Date().getTime().toString(16) + Math.floor(strong * Math.random()).toString(16)
}