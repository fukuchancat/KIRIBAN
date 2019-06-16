$("#start-broadcast").on("click", function () {
	connection.sdpConstraints.mandatory = {
		OfferToReceiveAudio: false,
		OfferToReceiveVideo: false
	};
	connection.open(contentId);
});

$("#stop-broadcast").on("click", function () {
	connection.streams.stop();
});