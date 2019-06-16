var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
	if (req.user) {
		// ログイン済の場合はマイページに飛ばす
		res.redirect('/id/' + req.user.id);
	} else {
		res.render('home', {
			passport: req.user
		});
	}
});

module.exports = router;