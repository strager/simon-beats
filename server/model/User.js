function User() {
    this.id = User.users.length;
    User.users.push(this);

    this.readyConnection = null;
    this.isPlaying = false;
}

User.prototype = {
    toJSON: function toJSON() {
        return {
            id: this.id
        };
    }
};

User.users = [ ];

module.exports = User;
