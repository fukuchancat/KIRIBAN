var connection = new RTCMultiConnection();

connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
connection.socketMessageEvent = 'video-broadcast-demo';

connection.session = {
	audio: true,
	video: true,
	oneway: true
};

connection.onstream = function (event) {
	$('#paused').hide();
	$("#resumed").show();
	$('#videos').append(event.mediaElement);
	event.mediaElement.play();
	setTimeout(function () {
		event.mediaElement.play();
	}, 5000);
};

connection.onstreamended = function (event) {
	$('#videos').empty();
	$('#paused').show();
	$("#resumed").hide();
};