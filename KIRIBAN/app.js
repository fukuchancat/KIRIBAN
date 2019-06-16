var express = require('express');
var app = express();

var co = require('co');
var nano = require('nano')('http://localhost:5984');
var db = nano.db.use('kiriban');
var natural = require('natural');
var jade = require('jade');
var fs = require('fs');
var flash = require('connect-flash');
var session = require('express-session');
var sharedsession = require("express-socket.io-session");
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var routes = require('./routes');

// セッションの設定
var sessionMiddleware = session({
	secret: '<SECRET>',
	resave: true,
	saveUninitialized: false
});

// ビューエンジン(Jade)の設定
app.set('view engine', 'jade');	
app.set('views', __dirname + '/views');

// ミドルウェアの設定
app.use(sessionMiddleware);
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(require('stylus').middleware({ src: __dirname + '/public' }));
app.use(express.static(__dirname + '/public'));

// ルーティングの設定
app.use('/', routes.home);
app.use('/login', routes.login);
app.use('/logout', routes.logout);
app.use('/register', routes.register);
app.use('/user', routes.user);
app.use('/id', routes.id);
app.use('/upload', routes.upload);

// Socket.IOでもセッションを使う
io.use(sharedsession(sessionMiddleware, {
    autoSave: true
}));

// ソケット通信の設定
io.on('connection', function (socket) {
	// チャットに参加
	socket.on('chat join', function (channel) {
		socket.join(channel);
	});
	// チャットメッセージ送信
	socket.on('chat message', function (data) {
		post(data, socket.handshake.session);
	});
	// 「いいね」「わるいね」送信
	socket.on('emotion', function (data) {
		emotion(data);
	});
	// ファイルアップロード
	socket.on('upload', function (data) {
		upload(data);
	});
});

// 単純ベイズ分類器の作成
function train() {
	var cf = new natural.BayesClassifier();

	db.view('trainer', 'id', function (err, body) {
		if (!err) {
			var diuse_docs = [];

			body.rows.forEach(function (row) {
				var data = row.value;
				cf.addDocument(data.text, data.stem);
			});

			cf.train();

			var classifier = {
				type: "classifier",
				trainedAt: new Date().toISOString(),
				classifier: JSON.stringify(cf)
			};

			db.view('classifier', 'id', function (err, body) {
				if (!err) {
					body.rows.forEach(function (row) {
						var data = row.value;
						data._deleted = true;
						diuse_docs.push(data);
					});
				}
				db.insert(classifier, function (err, body) {
					db.bulk({ docs: diuse_docs });
				});
			});
		}
	});
}

// 投稿操作
function post(data, session) {
	co(function* () {
		var userPromise = getViewPromise("user", "id", session.passport.user);
		var contentPromise = getViewPromise("content", "id", data.contentId);
		var bodies = yield [userPromise, contentPromise];

		var user = bodies[0][0];
		var content = bodies[1][0];

		data.type = "post";
		data.postedAt = new Date().toISOString();
		data.contentId = content.id;
		data.author = {
			userId: user._id,
			userKey: user.value.userKey,
			userName: user.value.userName,
			icon: user.value.icon
		};

		var type = content.value.contentType;
		if (type === "emotion") {
			// 「感情判定」のコンテンツの場合
			var classifier = yield getViewPromise("classifier", "id");
			var cf = natural.BayesClassifier.restore(JSON.parse(classifier.sort(sortByDate)[0].value.classifier));
			data.emotion = cf.classify(data.body.text);
		}

		db.insert(data, function (err, body) {
			if (!err) {
				var id = body.id;

				data.html = jade.renderFile('./views/_content_' + type + '.jade', {
					post: {
						id: id,
						value: data
					}
				});
				io.to(data.contentId).emit('chat message', data);
			}
		});
	});
}

// 「いいね」「わるいね」の処理
function emotion(data) {
	db.view('post', 'id', {
		key: data.postId
	}, function (err, body) {
		if (!err) {
			var text = body.rows[0].value.body.text;
			var doc = {
				type: "trainer",
				text: text,
				stem: data.stem
			};
			db.insert(doc);
			train();
		}
	});
}

// ファイルアップロード
function upload(data) {
	var path = './public/uploads/' + data.filename;

	var stream = fs.createWriteStream(path);
	stream.on('drain', function () { })
		.on('error', function (exception) {
			console.log("exception:" + exception);
		})
		.on('close', function () {

		})
		.on('pipe', function (src) { });

	stream.write(data.binary, 'binary');
	stream.end();
}

// 機械学習データのソート用
function sortByDate(a, b) {
	var x = new Date(a.value.trainedAt);
	var y = new Date(b.value.trainedAt);
	if (x > y) return -1;
	if (x < y) return 1;
	return 0;
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

http.listen(port, function () {
	console.log('listening on *:' + port);
});