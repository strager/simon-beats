function main(stage) {
    var gameView = null;
    var beat = null;
    var Game = null;

    function checkDoneLoading() {
        if (gameView && beat && Game) {
            sp.bridge.send('doneloading', null, null, null);

            stage.addChild(gameView);
            new Game(gameView, [ beat ]);
        }
    }

    require({ baseUrl: 'client' }, [ 'Game' ], function (Game_) {
        Game = Game_;

        checkDoneLoading();
    });

    var beatSound = new sp.Sound(new sp.URLRequest('assets/beat1.mp3'));
    beatSound.addEventListener(sp.Event.COMPLETE, function (event) {
        beat = beatSound;

        checkDoneLoading();
    });

    var loader = new sp.Loader();
    var cli = loader.contentLoaderInfo;
    cli.addEventListener(sp.Event.COMPLETE, function (event) {
        gameView = cli.content;

        checkDoneLoading();
    });
    loader.load(new sp.URLRequest('assets/assets.swf'));
}
