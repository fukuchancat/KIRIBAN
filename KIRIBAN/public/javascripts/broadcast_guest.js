connection.sdpConstraints.mandatory = {
	OfferToReceiveAudio: true,
	OfferToReceiveVideo: true
};
connection.join(contentId);

(function reCheckRoomPresence() {
	connection.checkPresence(contentId, function (isRoomExists) {
		if (isRoomExists) {
			connection.join(contentId);
			return;
		}
		setTimeout(reCheckRoomPresence, 5000);
	});
})();