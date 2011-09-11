var User = require('../model/User');

exports.init = function init(app) {
    app.get('/users', function _users(req, res) {
        res.setHeader('Content-type', app.JSON_CONTENT_TYPE);
        res.end(JSON.stringify(User.users));
    });

    app.all('/register', function _register(req, res) {
        var user = new User();

        res.setHeader('Content-type', app.JSON_CONTENT_TYPE);
        res.end(JSON.stringify(user));

        console.log('User registered:', user.toJSON());
    });

    function checkReadyUsers() {
        if (!User.users.every(function (user) { return !!user.readyConnection; })) {
            // Not everyone is ready =[
            return;
        }

        User.users.forEach(function (user) {
            var game = { }; // TODO

            var res = user.readyConnection;
            res.setHeader('Content-type', app.JSON_CONTENT_TYPE);
            res.end(JSON.stringify(game));

            user.isPlaying = true;
        });
    }

    app.all('/ready', function _play(req, res) {
        var user = User.users[req.query.uid];
        user.readyConnection = res;

        console.log('User ready:', user.toJSON());

        checkReadyUsers();
    });
};
