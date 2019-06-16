var express = require('express');
var co = require('co');
var nano = require('nano')('http://localhost:5984');
var db = nano.db.use('kiriban');
var router = express.Router();

// プロフィールページ
router.get('/:key([a-z0-9]+)$', function (req, res) {
	var key = req.params.key;

	co(function* () {
		var users = yield getViewPromise('user', 'userKey', key);

		if (req.user)
			count(users[0].id, req.user.id);
		var counters = yield getViewPromise('counter', 'userId', users[0].id);

		return {
			'passport': req.user,
			'user': users[0],
			'contents': yield getViewPromise('content', 'userId', users[0].id),
			'counters': counters
		};

	}).then(function (value) {
		res.render('user_profile', value);
	}).catch(function (err) {
		res.render('error');
	});
});

// コンテンツページ
router.get('/:key([a-z0-9]+)/:contentId([a-z0-9]{32})$', function (req, res) {
	var key = req.params.key;
	var contentId = req.params.contentId;

	req.session.contentId = contentId;

	co(function* () {
		var userPromise = getViewPromise('user', 'userKey', key);
		var postsPromise = getViewPromise('post', 'contentId', contentId);
		var contentPromise = getViewPromise('content', 'id', contentId);
		var bodies = yield [userPromise, postsPromise, contentPromise];

		if (req.user)
			count(bodies[0][0].id, req.user.id);
		var counters = yield getViewPromise('counter', 'userId', bodies[0][0].id);

		return {
			'passport': req.user,
			'user': bodies[0][0],
			'posts': bodies[1].sort(sortByPostedDate),
			'content': bodies[2][0],
			'contents': yield getViewPromise('content', 'userId', bodies[0][0].id),
			'counters': counters
		};

	}).then(function (value) {
		switch (value.content.value.contentType) {
			case 'broadcast':
				res.render('user_content_broadcast', value);
				break;
			case 'emotion':
				res.render('user_content_emotion', value);
				break;
			case 'categorize':
				res.render('user_content_categorize', value);
				break;
			default:
				res.render('user_content_normal', value);
				break;
		}
	}).catch(function (err) {
		res.render('error');
	});
});

// コンテンツ追加ページ
router.get('/:key([a-z0-9]+)/add', function (req, res) {
	var key = req.params.key;

	co(function* () {
		var users = yield getViewPromise('user', 'userKey', key);
		var counters = yield getViewPromise('counter', 'userId', users[0].id);

		return {
			'passport': req.user,
			'user': users[0],
			'contents': yield getViewPromise('content', 'userId', users[0].id),
			'counters': counters
		};

	}).then(function (value) {
		if (value.user.id == value.passport.id) {
			res.render('user_add', value);
		} else {
			res.render('error');
		}
	}).catch(function (err) {
		res.render('error');
	});
});

router.post('/:key([a-z0-9]+)/add', function (req, res) {
	var userId = req.user.id;
	var userKey = req.user.value.userKey;
	var contentName = req.body.contentName;
	var contentType = req.body.contentType;

	var document = {
		type: "content",
		contentType: contentType,
		contentName: contentName,
		userId: userId
	};

	db.insert(document, function (err, body) {
		if (!err) {
			contentId = body.id;
			res.redirect('/user/' + userKey + '/' + contentId);
		} else {
			res.render('error');
		}
	});
});

// 訪問者数のカウント
function count(userId, visiterUserId) {
	var doc = {
		type: "counter",
		userId: userId,
		visiterUserId: visiterUserId,
		visitedAt: new Date().toISOString()
	};
	db.insert(doc);
}

// db.viewのPromise
function getViewPromise(view, index, key) {
	return new Promise(function (resolve, reject) {
		db.view(view, index, {
			'key': key
		}, function (err, body) {
			err ? reject(err) : resolve(body.rows);
		});
	});
}

function sortByPostedDate(a, b) {
	var x = new Date(a.value.postedAt);
	var y = new Date(b.value.postedAt);
	if (x > y) return -1;
	if (x < y) return 1;
	return 0;
}

function sortByVisitedDate(a, b) {
	var x = new Date(a.value.visitedAt);
	var y = new Date(b.value.visitedAt);
	if (x > y) return -1;
	if (x < y) return 1;
	return 0;
}

module.exports = router;