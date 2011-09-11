define('MainMenu', [ 'Game' ], function (Game) {
    function MainMenu() {
        this.view = new window.Assets.MainMenu();

        this.view.addEventListener(sp.MouseEvent.MOUSE_DOWN, function () {
            var game = new Game();
            window.setView(game.view);
        });

        this.roomViews = [ ];
        this.roomDatas = [ ];
        this.updateRooms([ ]);

        this.requestRooms();
    }

    MainMenu.prototype = {
        requestRooms: function requestRooms() {
            var self = this;

            var request = new sp.URLRequest('/rooms');
            request.method = 'GET';

            var urlLoader = new sp.URLLoader(request);
            urlLoader.addEventListener(sp.Event.COMPLETE, function (event) {
                self.updateRooms(JSON.parse(urlLoader.data));

                setTimeout(function () {
                    self.requestRooms();
                }, 1000);

                urlLoader.destroy();
            });
        },

        updateRooms: function updateRooms(rooms) {
            this.roomViews.forEach(function (roomView) {
                roomView.destroy();
            });

            this.roomViews = rooms.map(function (room) {
                var roomView = new Assets.Room();
                // TODO

                return roomView;
            });

            var x = this.view.roomsBlank.x;
            var y = this.view.roomsBlank.y;
            var dx = this.view.rooms2Blank.x - x;
            var dy = this.view.rooms2Blank.y - y;

            this.roomViews.forEach(function (roomView, i) {
                roomView.x = x + dx * i;
                roomView.y = y + dy * i;

                this.view.addChild(roomView);
            }, this);

            if (this.roomViews.length === 0) {
                this.view.noRoomsText.visible = true;
            } else {
                this.view.noRoomsText.visible = false;
            }

            this.roomDatas = rooms;
        }
    };

    return MainMenu;
});
