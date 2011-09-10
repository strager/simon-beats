define('Game', [ ], function () {
    function Game(view) {
        this.view = view;

        this.view.addEventListener(sp.MouseEvent.MOUSE_DOWN, this.onMouseDown.bind(this));
    }

    Game.prototype = {
        onMouseDown: function onMouseDown(event) {
            this.beatClicked(event.target);
        },

        beatClicked: function beatclicked(beatView) {
            beatView.gotoAndPlay('hit');
        }
    };

    return Game;
});
