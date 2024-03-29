define('Game', [ 'Measure', 'BeatSet' ], function (Measure, BeatSet) {
    function Game() {
        this.view = new window.Assets.Game();
        this.view.addEventListener(sp.MouseEvent.MOUSE_DOWN, this.onMouseDown.bind(this));
        this.view.addEventListener(sp.TouchEvent.TOUCH_BEGIN, this.onMouseDown.bind(this));
        this.view.addEventListener(sp.Event.ENTER_FRAME, this.onEnterFrame.bind(this));

        this.beatViews = [
            this.view.beatA,
            this.view.beatB,
            this.view.beatC
        ];

        var soundExtension = sp.bridge.platform === 'flash' ? 'mp3' : 'wav';

        this.beatSounds = [
            new sp.Sound(new sp.URLRequest('assets/bark_s.' + soundExtension)),
            new sp.Sound(new sp.URLRequest('assets/baa_s.' + soundExtension)),
            new sp.Sound(new sp.URLRequest('assets/quack_s.' + soundExtension))
        ];

        this.measure = new Measure(120, 8);
        this.measure.timer.addEventListener(sp.TimerEvent.TIMER, this.onMeasureTick.bind(this));

        var self = this;
        self.measure.timer.stop();
        setTimeout(function () {
            Sounds.loops[0].play(0, 9999);
            self.measure.timer.reset();
            self.onMeasureTick();
        }, 1000);

        this.setState('playing');
    }

    Game.prototype = {
        onMouseDown: function onMouseDown(event) {
            var index = this.beatViews.indexOf(event.target);
            if (index >= 0) {
                this.beatClicked(index);
            }
        },

        onEnterFrame: function onEnterFrame(event) {
        },

        onMeasureStart: function onMeasureStart(event) {
            if (this.state === 'recording') {
                this.setState('playing');
                this.measure.reset();
            } else {
                if (this.playingBeatSet && this.recordingBeatSet) {
                    console.log(this.playingBeatSet.getMisses(this.recordingBeatSet));
                }

                this.setState('recording');
                this.measure.reset();
            }
        },

        onMeasureTick: function onMeasureTick(event) {
            console.log(this.measure.getCurrentBeat(), this.measure.getCurrentMeasure());
            this.view.measure.gotoAndPlay('tick');

            if (this.measure.getCurrentBeat() === 0) {
                // Measure ended
                this.onMeasureStart();
            }
        },

        setState: function setState(state) {
            this.state = state;
            this.view.gotoAndPlay(state);

            switch (this.state) {
            case 'recording':
                this.recordingBeatSet = new BeatSet();
                break;
            case 'playing':
                this.playingBeatSet = new BeatSet();
                break;
            }
        },

        beatClicked: function beatClicked(beatIndex) {
            var beatView = this.beatViews[beatIndex];
            beatView.gotoAndPlay('hit');

            var beatSound = this.beatSounds[beatIndex];
            beatSound.play();

            switch (this.state) {
            case 'recording':
                this.recordingBeatSet.addBeatAt(this.measure.getCurrentTime(), beatIndex);
                break;
            case 'playing':
                this.playingBeatSet.addBeatAt(this.measure.getCurrentTime(), beatIndex);
                break;
            }
        }
    };

    return Game;
});
