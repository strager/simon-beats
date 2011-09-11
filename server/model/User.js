var usernames = [
    'Jacky Jill',
    'Wonky Wonka',
    'Scumbag Steve',
    'Good Guy Greg',
    'That One Dude',
    '???'
];

function User() {
    this.id = User.users.length;
    User.users.push(this);

    this.username = usernames[this.id % usernames.length];

    this.readyConnection = null;
    this.isPlaying = false;
    this.room = null;
}

User.prototype = {
    toJSON: function toJSON() {
        return {
            id: this.id,
            name: this.username,
            room: !!this.room
        };
    }
};

User.users = [ ];

module.exports = User;
