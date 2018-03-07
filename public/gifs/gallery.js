(function() {

    var database = firebase.database();
    var storage = firebase.storage();
    var amOnline = database.ref('.info/connected');
    var presenseRef = database.ref('gifs/presence/');
    var chainRef = database.ref('gifs/chain/');
    var latestCommitsRef = database.ref('gifs/latest-by-user/');

    var repeatBlock = 1;
    var latestCommitsByUser = {};
    var chain;

    firebase.auth().onAuthStateChanged(function(user) {
        console.log('auth', user);
        if (user) {
            
            latestCommitsRef.on('value', function(snapshot) {
                latestCommitsByUser = snapshot.val();
                if (chain && latestCommitsByUser){
                    redraw();
                }
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
                            var $item = $(`<div class="item">
                                <video loop autoplay muted type="video/webm" src=${commit.fileURL}"></video>
                                <p class="name">${commit.firstName}</p>
                            </div>`);
                            $item.data('commit', commit);
                            $grid.append($item);    
                        }
                    }
                });
            }

            database.ref('gifs/settings/gallery-css').on('value', function(snapshot){
                document.getElementById('dynamic-styles').innerHTML = snapshot.val();
            });

            database.ref('gifs/settings/repeat-blocks').on('value', function(snapshot){
                repeatBlock = snapshot.val();
                redraw();
            });
        }
    });


    $('#grid').on('click', '.item', function(e){
        var commit = $(this).data('commit');
        console.log(commit);

        var $modal = $('#commitModal');
        $modal.find('.modal-title').text(commit.displayName + "'s Current Code");
        $modal.find('.modal-commit-code').html(commit.code);
        $('#commitModal').modal();
    });
})();