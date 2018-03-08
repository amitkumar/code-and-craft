
(function(){
	// const socket = io('/interconnected');

	var database = firebase.database();
	var storage = firebase.storage();
	var amOnline = database.ref('.info/connected');
	

	var isFirstInputRead = true;

	var codeTemplates = {
        getBeginning : function(){
			return ``;
		}
    };

	var seedRef = database.ref('gifs/seed');
	seedRef.once('value', function(snapshot){
		var seed = snapshot.val();

		CnC.seed = seed;
		
	});

	

	firebase.auth().onAuthStateChanged(function(user) {
		console.log('auth', user);
		if (user) {
			// User is signed in.
			var displayName = user.displayName;
			var firstName = displayName.split(' ')[0];
			var email = user.email;
			var emailVerified = user.emailVerified;
			var photoURL = user.photoURL;
			var isAnonymous = user.isAnonymous;
			var uid = user.uid;
			var providerData = user.providerData;
			
			var userRef = database.ref('gifs/users/' + uid);
			userRef.child('displayName').set(displayName);
			userRef.child('email').set(email);
			userRef.child('firstName').set(firstName);

			var presenseRef = database.ref('gifs/presence/' + uid);
			amOnline.on('value', function(snapshot) {
				if (snapshot.val()) {
					presenseRef.onDisconnect().remove();
					presenseRef.set(true);
				}
			});

			// Maintain a continuously-updated snapshot of the input vars.
			// GLC Compile will request these, and we'll return them synchronously
			var chainRef = database.ref('gifs/chain');
			// var myChainRef = chainRef.child(uid);
			
			var myChainRef;

			chainRef.on('value', function(snapshot){
				if (myChainRef){
					// myChainRef.off();
				}
				
				var prevChild;
				var precedingChainUser;

				// If I'm not in the chain, push myself to the chain
				snapshot.forEach(function(childSnapshot) {
					
					var childKey = childSnapshot.key;
					var childData = childSnapshot.val();
					
					console.log('uid, child.uid, childKey, childData', uid, childData.uid, childKey, childData);

					if (childData.uid === uid){
						console.log('found my user in chain', childSnapshot);
						myChainRef = childSnapshot.ref;
						precedingChainUser = prevChild;
					}

					prevChild = childSnapshot;
				});

				var inputs = {};

				// Always: Set my object's inputs to be the output of the prev person. 
				// If no prev person, use seed values

				if (precedingChainUser && myChainRef && precedingChainUser.key !== myChainRef.key){
					inputs = precedingChainUser.val().outputs;
				} else {
					inputs =  CnC.seed;
				}

				if (isFirstInputRead){
					isFirstInputRead = false;
					if (window.GLCMainController){
						window.GLCMainController.compile();
					}
				}

				if (!myChainRef){
					console.log('myChainRef does not exist, pushing to chain');
					myChainRef = chainRef.push({
						uid : uid,
						displayName : displayName
					});
				}
				// myChainRef.onDisconnect().remove();
				console.log('myChainRef', myChainRef);
			});


			var commitsPath = 'gifs/users/' + uid + '/commits';

			var commitsDbRef = database.ref(commitsPath);
			var commitsStorageRef = storage.ref(commitsPath);
		
			var latestCommitRef = database.ref('gifs/latest-by-user/' + uid);	

			CnC.uploadCommitToFirebase = function(code, blob, chainOutputs){
				var newCommit = commitsDbRef.push();
				var newCommitKey = newCommit.key;
				var timestamp = Date.now();

				newCommit.set({
					code : code,
					timestamp : timestamp
				});

				var fileRef = commitsStorageRef.child(newCommitKey + '.webm');
				fileRef.put(blob, { contentType : 'video/webm' }).then(function(snapshot) {
					console.log('Uploaded blob to firebase', snapshot);
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
						timestamp : timestamp
					});

					latestCommitRef.set({
						uid : uid,
						displayName : displayName,
						firstName : firstName,
						timestamp : timestamp,
						code : code,
						fileURL : snapshot.downloadURL,
						commitPath : newCommit.toString()
					});

					myChainRef.set({
						uid : uid,
						displayName : displayName
					})

					console.log('Finished writing commit to firebase', latestCommitRef);
				});
			};

		} else {
			window.location('/gifs');
		}
	});


})();
