function main(stage) {
    var loader = new sp.Loader();
    var cli = loader.contentLoaderInfo;

    cli.addEventListener(sp.Event.COMPLETE, function () {
        var gameView = cli.content;

        require({ baseUrl: 'client' }, [ 'Game' ], function (Game) {
            stage.addChild(gameView);
            new Game(gameView);
        });
    });

    loader.load(new sp.URLRequest('assets/assets.swf'));
}
