define('Game', [ 'Measure' ], function (Measure) {
    function Game(view) {
        this.view = view;
        this.view.addEventListener(sp.MouseEvent.MOUSE_DOWN, this.onMouseDown.bind(this));
        this.view.addEventListener(sp.Event.ENTER_FRAME, this.onEnterFrame.bind(this));

        this.beats = [
            view.beatA,
            view.beatB,
            view.beatC
        ];

        this.measure = new Measure(120);
        this.measure.reset();
        this.measure.timer.addEventListener(sp.TimerEvent.TIMER, this.onMeasureTick.bind(this));
    }

    Game.prototype = {
        onMouseDown: function onMouseDown(event) {
            var index = this.beats.indexOf(event.target);
            if (index >= 0) {
                this.beatClicked(this.beats[index]);
            }
        },

        onEnterFrame: function onEnterFrame(event) {
        },

        beatClicked: function beatClicked(beatView) {
            beatView.gotoAndPlay('hit');
        },

        onMeasureTick: function onMeasureTick() {
            this.view.measure.gotoAndPlay('tick');
        }
    };

    return Game;
});
