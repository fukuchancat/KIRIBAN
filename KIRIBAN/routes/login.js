var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var nano = require('nano')('http://localhost:5984');
var db = nano.db.use('kiriban');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// Passportの設定
passport.use(new LocalStrategy({
	usernameField: 'userKey',
	passwordField: 'password'
}, function (username, password, done) {
	var secret = 'ﾝQ秉ｻ0R”７みⅨＭ？6Ｇﾗ畚{４Ｃⅰ媾6Ⅱ9４ⅸDR$’[Ａ～Ｒ：9？';
	var hmac = crypto.createHmac('sha256', secret);
	hmac.update(password);
	var hPass = hmac.digest('hex');

	db.view('user', 'userKey', {
		'key': username
	}, function (err, body) {
		if (!err) {
			var user = body.rows[0];

			if (user.value.hPass == hPass) {
				return done(null, user);
			} else {
				return done(null, false);
			}
		} else {
			return done(err);
		}
	});
})
);

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	db.view('user', 'id', {
		'key': id
	}, function (err, body) {
		return done(err, body.rows[0]);
	});
});

router.get('/', function (req, res) {
	res.render('login',{
		error: req.flash('error')	
	});
});

router.post('/', function (req, res, next) {
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login'
	})(req, res, next);
});

module.exports = router;