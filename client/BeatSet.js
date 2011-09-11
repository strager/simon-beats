define('BeatSet', [ ], function () {
    function BeatSet() {
        this.beats = [ ];
        this.missThreshold = 250;
    }

    function getIndexNearest(value, array) {
        var minDifference = Infinity;
        var minIndex = -1;

        array.forEach(function (curValue, i) {
            var diff = Math.abs(value - curValue);

            if (diff < minDifference) {
                minDifference = diff;
                minIndex = i;
            }
        });

        return minIndex;
    }

    BeatSet.prototype = {
        addBeatAt: function addBeatAt(beatTime) {
            this.beats.push(beatTime);
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
