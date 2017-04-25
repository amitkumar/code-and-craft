(function() {

    var database = firebase.database();
    var storage = firebase.storage();
    var amOnline = database.ref('.info/connected');
    var presenseRef = database.ref('interconnected/presence/');
    var latestCommitsRef = database.ref('interconnected/latest-by-user/');

    var repeatBlock = 1;
    var latestCommits = [];

    firebase.auth().onAuthStateChanged(function(user) {
        console.log('auth', user);
        if (user) {
            var presentUsersIds = [];

            presenseRef.on('value', function(snapshot) {
                var presentUsers = snapshot.val();
                console.log('presense', presentUsers);
                if (presentUsers){
                    presentUsersIds = Object.keys(presentUsers);
                    console.log('presentUsers', presentUsersIds);    
                }
            });

            latestCommitsRef.on('value', function(snapshot) {
                latestCommits = snapshot.val();
                console.log('latestCommits', latestCommits);
                redraw();
            });

            function redraw(){
                var $grid = $('#grid');

                $grid.empty();
                presentUsersIds.forEach(function(userId, index) {
                    var commit = latestCommits[userId];
                    if (commit) {
                        console.log('commit', commit)
        
                        for (var i = 0; i < repeatBlock; i++){
                            $grid.append(`<div class="item">
                                <video loop autoplay muted type="video/webm" src=${commit.fileURL}"></video>
                                <p class="name">${commit.firstName}</p>
                            </div>`);    
                        }
                    }
                });
            }

            database.ref('interconnected/settings/dashboard-css').on('value', function(snapshot){
                document.getElementById('dynamic-styles').innerHTML = snapshot.val();
            });

            database.ref('interconnected/settings/repeat-blocks').on('value', function(snapshot){
                repeatBlock = snapshot.val();
                redraw();
            });
        }
    });


    
})();