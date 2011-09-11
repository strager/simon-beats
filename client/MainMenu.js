define('MainMenu', [ 'Game' ], function (Game) {
    function MainMenu() {
        this.view = new window.Assets.MainMenu();

        this.view.addEventListener(sp.MouseEvent.MOUSE_DOWN, function () {
            var game = new Game();
            window.setView(game.view);
        });
    }

    return MainMenu;
});
