var express = require('express');
var crypto = require("crypto");
var base64url = require('base64url');
var mailer = require('nodemailer');
var nano = require('nano')('http://localhost:5984');
var db = nano.db.use('kiriban');
var router = express.Router();

var smtp = mailer.createTransport({
	service: 'Gmail',
    auth: {
        user: '<MAILADDRESS>',
        pass: '<PASSWORD>'
    }
});

router.get('/', function (req, res) {
	res.render('register');
});

// メールアドレスの確認
router.post('/', function (req, res) {
	var token = getRandomString(20);
	var email = req.body.email;

	var doc = {
		type: "verifier",
		email: email,
		token: token
	};

	db.insert(doc, function (err, body) {
		if (!err) {
			var html = `
			<h1>KIRIBAN 登録のご確認</h1>
			<p>下のリンクより登録を行ってください。</p>
			<p>
				<a href="http://localhost:1337/register/verify/${email}/${token}">登録する</a>
			</p>
			`
			smtp.sendMail({
				from: "register@kiriban.net",
				to: email,
				subject: "KIRIBAN 登録確認メール",
				html: html
			}, function (err, res) {
				if (err) {
					console.log(err);
				}
				smtp.close();
			});
			res.render('register');
		} else {
			res.render('error');
		}
	});

	
});

// 登録処理
router.get('/verify/:email/:token', function (req, res) {
	db.view('verifier', 'email', {
		'key': req.params.email
	}, function (err, body) {
		if (!err) {
			if (body.rows.length > 0) {
				var token = req.params.token;
				var value = body.rows[0].value;

				if (value.token == token) {
					req.session.email = value.email;
					res.render('verify', {
						email: value.email
					});
				}
			} else {
				res.render('error');
			}
		} else {
			res.render('error');
		}
	});
});

// 登録完了
router.post('/complete', function (req, res) {
	db.view('verifier', 'email', {
		'key': req.session.email
	}, function (err, body) {
		if (!err) {
			if (body.rows.length > 0) {
				var value = body.rows[0].value;

				var secret = '<SECRET>';
				var hmac = crypto.createHmac('sha256', secret);
				hmac.update(req.body.password);
				var hPass = hmac.digest('hex');

				var doc = {
					type: "user",
					email: req.body.email,
					userKey: req.body.userKey,
					userName: req.body.userName,
					hPass: hPass,
					icon: "/images/15d070aca4e202f.png",
					banner: "/images/15d70013a23241a.jpg",
					description: ""
				};

				db.insert(doc, function (err, body) {
					if (!err) {
						value._deleted = true;
						var documents = [value];

						db.bulk({ docs: documents });

						res.render('complete');
					} else {
						res.render('error');
					}
				});
			} else {
				res.render('error');
			}
		} else {
			res.render('error');
		}
	});
})

function getRandomString(size) {
	return base64url(crypto.randomBytes(size));
}

module.exports = router;