var Assets = null;
var Sounds = { };

function setView(view) {
    view.x = sp.stage.stageWidth / 2;
    view.y = sp.stage.stageHeight / 2;

    while (sp.stage.numChildren > 0) {
        sp.stage.removeChildAt(0);
    }

    sp.stage.addChild(view);
}

function main(stage) {
    var SOUND_COUNT = 1;
    var loadedSounds = 0;

    function checkDoneLoading() {
        if (Assets && loadedSounds === SOUND_COUNT) {
            require({ baseUrl: 'client' }, [ 'MainMenu' ], function (MainMenu) {
                var mainMenu = new MainMenu();
                setView(mainMenu.view);

                sp.bridge.send('doneloading', null, null, null);
            });
        }
    }

    // Assets
    var loader = new sp.Loader();
    var cli = loader.contentLoaderInfo;
    cli.addEventListener(sp.Event.COMPLETE, function (event) {
        Assets = cli.applicationDomain.definitions;

        checkDoneLoading();
    });
    loader.load(new sp.URLRequest('assets/assets.swf'));

    // Sounds
    Sounds.loops = [ ];

    var beat1 = new sp.Sound(new sp.URLRequest('assets/beat1.mp3'));
    Sounds.loops.push(beat1);
    beat1.addEventListener(sp.Event.COMPLETE, function (event) {
        ++loadedSounds;

        checkDoneLoading();
    });
}
