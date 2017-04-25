(function(){
	const socket = io('/interconnected');

	// .addEventListener('click', event => {
	//     fetch('/compile',{
	//       method: 'POST',
	//       headers: {'Content-Type': 'application/json'},
	//       body: JSON.stringify({
	//         'source.txt': cm.getDoc().getValue()
	//       }),
	//       credentials: 'same-origin'
	//     })
	// })

	var database = firebase.database();
	var storage = firebase.storage();
	var amOnline = database.ref('.info/connected');
	
	console.log('interconnected', firebase);

	firebase.auth().onAuthStateChanged(function(user) {
		console.log('auth', user);
		if (user) {
			// User is signed in.
			var displayName = user.displayName;
			var email = user.email;
			var emailVerified = user.emailVerified;
			var photoURL = user.photoURL;
			var isAnonymous = user.isAnonymous;
			var uid = user.uid;
			var providerData = user.providerData;
			
			var presenseRef = database.ref('/interconnected/presence/' + uid);
			

			amOnline.on('value', function(snapshot) {
				if (snapshot.val()) {
					presenseRef.onDisconnect().remove();
					presenseRef.set(true);
				}
			});

			var commitsPath = 'interconnected/users/' + uid + '/commits';

			var commitsDbRef = database.ref(commitsPath);
			var commitsStorageRef = storage.ref(commitsPath);
			

			window.CnC.uploadCommitToFirebase = function(code, blob){
				var newCommit = commitsDbRef.push();
				var newCommitKey = newCommit.key;
				newCommit.set({
					code : code,
					timestamp : Date.now()
				});

				var fileRef = commitsStorageRef.child(newCommitKey + '.webm');
				fileRef.put(blob, { contentType : 'video/webm' }).then(function(snapshot) {
					console.log('Uploaded a blob or file!', snapshot);
					newCommit.set({
						fileMetadata : {
							bucket : snapshot.metadata.bucket,
							fullPath : snapshot.metadata.fullPath,
							name  : snapshot.metadata.name,
							size  : snapshot.metadata.size,
							timeCreated  : snapshot.metadata.timeCreated
						},
						fileURL : snapshot.downloadURL,
						code : code,
						timestamp : Date.now()
					});
				});
			};

		} else {
			window.location('/interconnected');
		}
	});


	
	


})();