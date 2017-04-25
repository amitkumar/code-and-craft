(function(){
	const socket = io('/interconnected');

	var database = firebase.database();
	var storage = firebase.storage();
	var amOnline = database.ref('.info/connected');
	
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
			
			var userRef = database.ref('interconnected/users/' + uid);
			userRef.child('displayName').set(displayName);
			userRef.child('email').set(email);
			userRef.child('firstName').set(firstName);

			var presenseRef = database.ref('/interconnected/presence/' + uid);
			amOnline.on('value', function(snapshot) {
				if (snapshot.val()) {
					presenseRef.onDisconnect().remove();
					presenseRef.set(true);
				}
			});

			// Maintain a continuously-updated snapshot of the input vars.
			// GLC Compile will request these, and we'll return them synchronously
			var chainRef = database.ref('interconnected/chain');
			var chainInputs = {
				iterations : 100,
				length : 1,
				hue : 20 // 0-360
			};
			chainRef.on('value', function(){
				// If I'm not in the chain, push myself to the chain
				
				// Always: Set my object's inputs to be the output of the prev person. 
				// If no prev person, use seed values
			});
			window.CnC.getChainInputs = function(){
				return chainInputs;
			};


			var commitsPath = 'interconnected/users/' + uid + '/commits';

			var commitsDbRef = database.ref(commitsPath);
			var commitsStorageRef = storage.ref(commitsPath);
		
			var latestCommitRef = database.ref('interconnected/latest-by-user/' + uid);	

			window.CnC.uploadCommitToFirebase = function(code, blob, chainOutputs){
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
						timestamp : timestamp,
						
						// TODO : Store input & output variables
						input : {
							uid : '',
							values : {}
						},
						output : {
							uid : '',
							values : {}
						}
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
					console.log('Finished writing commit to firebase', latestCommitRef);
				});
			};

		} else {
			window.location('/interconnected');
		}
	});


	
	


})();