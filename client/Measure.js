define('Measure', [ ], function () {
    function Measure(bpm) {
        this.bpm = bpm;
        this.timer = new sp.Timer(60 / bpm * 1000);
        this.timer.start();

        this.reset();
    }

    function getCurrentTime() {
        return +new Date();
    }

    Measure.prototype = {
        reset: function reset() {
            this.startTime = getCurrentTime();
            this.timer.reset();
        },

        getCurrentBeat: function getCurrentBeat() {
            var elapsed = getCurrentTime() - this.startTime;
            return this.bpm * (elapsed / 1000 / 60);
        }
    };

    return Measure;
});
