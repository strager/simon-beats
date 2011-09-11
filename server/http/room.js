var User = require('../model/User');
var Room = require('../model/Room');

exports.init = function init(app) {
    function checkUser(req, res, next) {
        var uid = req.query.uid;

        if (uid !== String(+uid) || !User.users[uid]) {
            res.writeHead(403);
            res.end();
            return;
        }

        req.user = User.users[uid];
        next();
    }

    app.get('/users', function _users(req, res) {
        res.setHeader('Content-type', app.JSON_CONTENT_TYPE);
        res.end(JSON.stringify(User.users));
    });

    app.get('/rooms', function _rooms(req, res) {
        res.setHeader('Content-type', app.JSON_CONTENT_TYPE);
        res.end(JSON.stringify(Room.rooms));
    });

    app.all('/register', function _register(req, res) {
        var user = new User();

        res.setHeader('Content-type', app.JSON_CONTENT_TYPE);
        res.end(JSON.stringify(user));

        console.log('User', user.toJSON(), 'registered');
    });

    app.all('/room', checkUser, function _room(req, res) {
        var room = new Room();

        room.addUser(req.user);

        res.end(JSON.stringify(room));

        console.log('User', req.user.toJSON(), 'created room', room.toJSON());
    });

    app.all('/room/join/:id', checkUser, function _room_join(req, res) {
        var user = req.user;
        var room = Room.rooms[req.params.id];

        room.addUser(user);

        res.setHeader('Content-type', app.JSON_CONTENT_TYPE);
        res.end(JSON.stringify({ status: 'ok' }));

        console.log('User', user.toJSON(), 'joined room', room.toJSON());
    });

    app.all('/ready', checkUser, function _ready(req, res) {
        req.user.readyConnection = res;

        console.log('User', req.user.toJSON(), 'is ready');

        req.user.room.checkReadyUsers();
    });
};
