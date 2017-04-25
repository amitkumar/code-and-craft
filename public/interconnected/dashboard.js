(function() {

    var database = firebase.database();
    var storage = firebase.storage();
    var amOnline = database.ref('.info/connected');
    // var presenseRef = database.ref('interconnected/presence/');
    var chainRef = database.ref('interconnected/chain/');
    var latestCommitsRef = database.ref('interconnected/latest-by-user/');

    var repeatBlock = 1;
    var latestCommitsByUser = {};
    var chain;

    firebase.auth().onAuthStateChanged(function(user) {
        console.log('auth', user);
        if (user) {
            
            latestCommitsRef.on('value', function(snapshot) {
                latestCommitsByUser = snapshot.val();
                console.log('latestCommits', latestCommitsByUser);
            });

            chainRef.on('value', function(snapshot) {
                chain = snapshot.val();
                console.log('chain', chain);
                if (chain && latestCommitsByUser){
                    redraw();
                }
            });

            function redraw(){
                var $grid = $('#grid');

                $grid.empty();
                Object.keys(chain).forEach(function(chainKey, index) {
                    var chainItem = chain[chainKey];
                    var commit = latestCommitsByUser[chainItem.uid];
                    
                    console.log('chainItem', chainItem);
                    console.log('commit', commit)

                    if (commit) {
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