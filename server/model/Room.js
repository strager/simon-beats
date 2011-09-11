function Room() {
    this.id = Room.rooms.length;
    Room.rooms.push(this);

    this.users = [ ];
    this.gameStarted = false;
}

Room.prototype = {
    toJSON: function toJSON() {
        return {
            id: this.id,
            gameStarted: this.gameStarted,
            users: this.users
        };
    },

    checkReadyUsers: function checkReadyUsers() {
        if (!this.users.every(function (user) { return !!user.readyConnection; })) {
            // Not everyone is ready =[
            return;
        }

        this.users.forEach(function (user) {
            var res = user.readyConnection;
            res.setHeader('Content-type', app.JSON_CONTENT_TYPE);
            res.end(JSON.stringify(game));

            user.isPlaying = true;
        });

        this.gameStarted = true;
    },

    hasUser: function hasUser(user) {
        return this.users.indexOf(user) >= 0;
    },

    addUser: function addUser(user) {
        if (this.hasUser(user)) return;

        if (user.room) {
            user.room.removeUser(user);
        }

        this.users.push(user);
        user.room = this;
    },

    removeUser: function removeUser(user) {
        if (!this.hasUser(user)) return;

        var index = this.users.indexOf(user);
        this.users.splice(index, 1);
        user.room = null;
    }
};

Room.rooms = [ ];

module.exports = Room;
