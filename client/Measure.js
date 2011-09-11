define('Measure', [ ], function () {
    function Measure(bpm, length) {
        this.bpm = bpm;
        this.length = length;

        this.timer = new sp.Timer(60 / bpm * 1000);
        this.timerTicked = false;

        this.timer.addEventListener(sp.TimerEvent.TIMER, function (event) {
            this.timerTicked = true;
        }.bind(this));

        this.reset();
    }

    function time() {
        return +new Date();
    }

    Measure.prototype = {
        reset: function reset() {
            this.startTime = time();
            this.timer.start();
        },

        getCurrentTime: function getCurrentTime() {
            var elapsed = time() - this.startTime;
            return this.bpm * (elapsed / 1000 / 60);
        },

        getBeatsElapsed: function getBeatsElapsed() {
            if (this.timerTicked) {
                return this.timer.currentCount + 1;
            } else {
                return 0;
            }
        },

        getCurrentBeat: function getCurrentBeat() {
            return this.getBeatsElapsed() % this.length;
        },

        getCurrentMeasure: function getCurrentMeasure() {
            return Math.floor(this.getBeatsElapsed() / this.length);
        }
    };

    return Measure;
});
