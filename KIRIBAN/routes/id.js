var express = require('express');
var nano = require('nano')('http://localhost:5984');
var db = nano.db.use('kiriban');
var router = express.Router();

router.get('/:id([a-z0-9]{32})$', function (req, res) {
	db.view('user', 'id', {
		'key': req.params.id
	}, function (err, body) {
		if (!err) {
			if (body.rows.length > 0)
				res.redirect('/user/' + body.rows[0].value.userKey);
			else
				res.render('error');
		} else {
			res.render('error');
		}
	});
});

module.exports = router;