define('Game', [ 'Measure', 'BeatSet' ], function (Measure, BeatSet) {
    function Game(view) {
        this.view = view;
        this.view.addEventListener(sp.MouseEvent.MOUSE_DOWN, this.onMouseDown.bind(this));
        this.view.addEventListener(sp.Event.ENTER_FRAME, this.onEnterFrame.bind(this));

        this.beats = [
            view.beatA,
            view.beatB,
            view.beatC
        ];

        this.measure = new Measure(120, 8);
        this.measure.timer.addEventListener(sp.TimerEvent.TIMER, this.onMeasureTick.bind(this));

        this.recordingBeatSet = new BeatSet();
        this.playingBeatSet = new BeatSet();
        this.setState('playing');
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

        onMeasureStart: function onMeasureStart(event) {
            if (this.state === 'recording') {
                this.setState('playing');
                this.measure.reset();
            } else {
                this.setState('recording');
                this.measure.reset();
            }
        },

        onMeasureTick: function onMeasureTick(event) {
            this.view.measure.gotoAndPlay('tick');

            if (this.measure.getCurrentBeat() === 0) {
                // Measure ended
                this.onMeasureStart();
            }
        },

        setState: function setState(state) {
            this.state = state;
            this.view.gotoAndPlay(state);
        },

        beatClicked: function beatClicked(beatView) {
            beatView.gotoAndPlay('hit');

            switch (this.state) {
            case 'recording':
                this.recordingBeatSet.addBeatAt(this.measure.getCurrentTime());
                break;
            case 'playing':
                this.playingBeatSet.addBeatAt(this.measure.getCurrentTime());
                break;
            }
        }
    };

    return Game;
});
