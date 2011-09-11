function User() {
    this.id = User.users.length;
    User.users.push(this);

    this.readyConnection = null;
    this.isPlaying = false;
    this.room = null;
}

User.prototype = {
    toJSON: function toJSON() {
        return {
            id: this.id,
            room: !!this.room
        };
    }
};

User.users = [ ];

module.exports = User;
