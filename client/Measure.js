define('Measure', [ ], function () {
    function Measure(bpm, length) {
        this.bpm = bpm;
        this.length = length;

        this.timer = new sp.Timer(60 / bpm * 1000);

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

        getCurrentBeat: function getCurrentBeat() {
            return (this.timer.currentCount + 1) % this.length;
        },

        getCurrentMeasure: function getCurrentMeasure() {
            return Math.floor((this.timer.currentCount + 1) / this.length);
        }
    };

    return Measure;
});
