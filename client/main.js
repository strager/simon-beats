function main(stage) {
    var loader = new sp.Loader();
    var cli = loader.contentLoaderInfo;

    cli.addEventListener(sp.Event.COMPLETE, function () {
        var gameView = cli.content;
        stage.addChild(gameView);

        gameView.beatA.addEventListener(sp.MouseEvent.MOUSE_DOWN, function () {
            console.log('down');
        });
    });

    loader.load(new sp.URLRequest('assets/assets.swf'));
}
