(function() {

    var database = firebase.database();
    var storage = firebase.storage();
    var amOnline = database.ref('.info/connected');
    var presenseRef = database.ref('/interconnected/presence/');
    var latestCommitsRef = database.ref('interconnected/latest-by-user/');

    firebase.auth().onAuthStateChanged(function(user) {
        console.log('auth', user);
        if (user) {
            var presentUsersIds = [];

            presenseRef.on('value', function(snapshot) {
                snapshot = snapshot.val();
                console.log('presense', snapshot);
                presentUsersIds = Object.keys(snapshot);
                console.log('presentUsers', presentUsersIds);
            });

            latestCommitsRef.on('value', function(snapshot) {
                var latestCommits = snapshot.val();
                console.log('latestCommits', latestCommits);

                var $grid = $('#grid');

                $grid.empty();

                presentUsersIds.forEach(function(userId, index) {
                    var commit = latestCommits[userId];
                    if (commit) {
                        console.log('commit', commit)
                        $grid.append(`<div class="item">
                            <video loop autoplay muted type="video/webm" src=${commit.fileURL}"></video>
                            <p class="name">${commit.firstName}</p>
                        </div>`);
                        $grid.append(`<div class="item">
                            <video loop autoplay muted type="video/webm" src=${commit.fileURL}"></video>
                            <p class="name">${commit.firstName}</p>
                        </div>`);
                        $grid.append(`<div class="item">
                            <video loop autoplay muted type="video/webm" src=${commit.fileURL}"></video>
                            <p class="name">${commit.firstName}</p>
                        </div>`);
                        $grid.append(`<div class="item">
                            <video loop autoplay muted type="video/webm" src=${commit.fileURL}"></video>
                            <p class="name">${commit.firstName}</p>
                        </div>`);
                        $grid.append(`<div class="item">
                            <video loop autoplay muted type="video/webm" src=${commit.fileURL}"></video>
                            <p class="name">${commit.firstName}</p>
                        </div>`);
                        
                    }

                });

                // var presentLatest = snapshot.filter

                // TODO: Template should display video & username & arrow-right. Squares.
                // On hover, can show absolutely-positioned overlay on top of video with 
                // input & output values
            });
        }
    });


})();