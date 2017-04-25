
(function(){
	// const socket = io('/interconnected');

	var database = firebase.database();
	var storage = firebase.storage();
	var amOnline = database.ref('.info/connected');
	


	var codeTemplates = {
        beginning : 
`/* [codeandcraft] */
// Code & Craft Chained Variables. Use these at least once in your code. 
// And feel free to modify them before they get sent to the next participant!

window.CnC.length = window.CnC.length;
window.CnC.hue = window.CnC.hue;
window.CnC.quantity = window.CnC.quantity;
/* [/codeandcraft] */

`,
        end : 
`
/* Ending Code & Craft Chained Variables: */
`
    };

    window.wrapCodeWithCnC = function(code){
        console.log('wrapCodeWithCnC', code);
        if (code.indexOf('/* [codeandcraft] */') < 0){
            code = [
                codeTemplates.beginning,
                code,
                codeTemplates.end
            ].join('');
        }
        return code;
    };

	var seedRef = database.ref('interconnected/seed');
	seedRef.once('value', function(snapshot){
		var seed = snapshot.val();

		window.CnC.seed = seed;
		
	});

	
	window.refreshEditorVariables = function(){
		// Active values for code editor. Will read back out from these when time for export
		if (window.CnC.inputs){
			window.CnC.length = window.CnC.inputs.length;
			window.CnC.hue = window.CnC.inputs.hue;
			window.CnC.quantity = window.CnC.inputs.quantity;	
		} else {
			window.CnC.length = 1;
			window.CnC.hue = 1;
			window.CnC.quantity = 1;
		}
		console.log('Reading inputs', window.CnC.inputs);
	}

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

			var presenseRef = database.ref('interconnected/presence/' + uid);
			amOnline.on('value', function(snapshot) {
				if (snapshot.val()) {
					presenseRef.onDisconnect().remove();
					presenseRef.set(true);
				}
			});

			// Maintain a continuously-updated snapshot of the input vars.
			// GLC Compile will request these, and we'll return them synchronously
			var chainRef = database.ref('interconnected/chain');
			// var myChainRef = chainRef.child(uid);
			var chainInputs = {
				iterations : 100,
				length : 1,
				hue : 20 // 0-360
			};
			
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

					prevChild = childSnapshot.ref;
				});

				var inputs = {};

				// Always: Set my object's inputs to be the output of the prev person. 
				// If no prev person, use seed values

				if (precedingChainUser && myChainRef && precedingChainUser.key !== myChainRef.key){
					inputs = precedingChainUser.val().outputs;
				} else {
					inputs =  window.CnC.seed;
				}

				// Only using this object to store for later storage when committing
				window.CnC.inputs = inputs;
				window.CnC.inputs.uid = precedingChainUser ? precedingChainUser.val().uid : uid;
				

				if (!myChainRef){
					console.log('myChainRef does not exist, pushing to chain');
					myChainRef = chainRef.push({
						uid : uid,
						inputs : window.CnC.inputs,
						outputs : {
							length : window.CnC.length,
							hue : window.CnC.hue,
							quantity : window.CnC.quantity
						}
					});
				}
				// myChainRef.onDisconnect().remove();
				console.log('myChainRef', myChainRef);
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
						inputs : window.CnC.inputs,
						outputs : {
							length : window.CnC.length,
							hue : window.CnC.hue,
							quantity : window.CnC.quantity
						}
					});

					latestCommitRef.set({
						uid : uid,
						displayName : displayName,
						firstName : firstName,
						timestamp : timestamp,
						code : code,
						fileURL : snapshot.downloadURL,
						commitPath : newCommit.toString(),
						inputs : window.CnC.inputs,
						outputs : {
							length : window.CnC.length,
							hue : window.CnC.hue,
							quantity : window.CnC.quantity
						}
					});

					myChainRef.set({
						uid : uid,
						inputs : window.CnC.inputs,
						outputs : {
							length : window.CnC.length,
							hue : window.CnC.hue,
							quantity : window.CnC.quantity
						}
					})

					console.log('Finished writing commit to firebase', latestCommitRef);
				});
			};

		} else {
			window.location('/interconnected');
		}
	});


	
	


})();