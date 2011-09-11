define('BeatSet', [ ], function () {
    function BeatSet() {
        this.beats = [ ];
        this.missThreshold = 250;
    }

    function getIndexNearest(beat, array) {
        var minDifference = Infinity;
        var minIndex = -1;

        array.forEach(function (curBeat, i) {
            if (beat.type !== curBeat.type) {
                return;
            }

            var diff = Math.abs(beat.time - curBeat.time);

            if (diff < minDifference) {
                minDifference = diff;
                minIndex = i;
            }
        });

        return minIndex;
    }

    BeatSet.prototype = {
        addBeatAt: function addBeatAt(beatTime, beatType) {
            this.beats.push({ time: beatTime, type: beatType });
        },

        getMisses: function getMisses(referenceBeatSet) {
            var thisBeats = this.beats.slice();
            var referenceBeats = referenceBeatSet.beats.slice();

            var thisNewBeats = [ ];

            for (var i = 0; i < thisBeats.length; ++i) {
                var index = getIndexNearest(thisBeats[i], referenceBeats);
                var diff = Math.abs(thisBeats[i] - referenceBeats[i]);

                if (diff < this.missThreshold) {
                    referenceBeats.splice(index, 1);
                } else {
                    thisNewBeats.push(thisBeats[i]);
                }
            }

            return thisNewBeats.length + referenceBeats.length;
        }
    };

    return BeatSet;
});
