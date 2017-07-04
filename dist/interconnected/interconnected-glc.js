
(function(){
	// const socket = io('/interconnected');

	var database = firebase.database();
	var storage = firebase.storage();
	var amOnline = database.ref('.info/connected');
	

	var isFirstInputRead = true;

	var codeTemplates = {
        getBeginning : function(){
        	return `/* [codeandcraft] */
// Code & Craft Chained Variables. 
// Use these at least once in your code. 
// Modify them before they get sent to the next participant. 
// You're getting inputs from: ${ CnC.inputs ? CnC.inputs.displayName : 'seed'}
CnC.size = ${ CnC.inputs ? CnC.inputs.size : 1 }; 
CnC.color = '${ CnC.inputs ? CnC.inputs.color : 'green' }'; 
CnC.quantity = ${ CnC.inputs ? CnC.inputs.quantity : 1 }; 

/*
// Use these in your code with something like this:
glc.renderList.addCircle({
	x: 80,
	y: 80,
	radius: CnC.size,
	fillStyle: CnC.color,
	startAngle: [0, 90],
	endAngle: [360, 270],
	lineWidth: 30,
	lineCap: "butt"
});
*/

/*
// At the end of your code, set them to new values that you invent in your weird brain.
// Something like this:
CnC.size = 1; // tiny!
CnC.color = 'palevioletred';
CnC.quantity = 1000000; // what omg so many
*/ 

// Have fun!
/* [/codeandcraft] */

`;
		}
    };

    window.wrapCodeWithCnC = function(code){
        // console.log('wrapCodeWithCnC', code);
		console.log('wrapCodeWithCnC');
        console.log(codeTemplates.getBeginning());
        
        var headerIndex = code.indexOf('/* [/codeandcraft] */');

        if (headerIndex > 0){
        	var lastIndexOfHeader = headerIndex + ('/* [/codeandcraft] */'.length) + 2;
        	code = code.slice(lastIndexOfHeader);
        	console.log('sliced off header');
        }
        
        code = [
            codeTemplates.getBeginning(),
            code
        ].join('');

        return code;
    };

	var seedRef = database.ref('interconnected/seed');
	seedRef.once('value', function(snapshot){
		var seed = snapshot.val();

		CnC.seed = seed;
		
	});

	
	window.refreshEditorVariables = function(){
		// Active values for code editor. Will read back out from these when time for export
		if (CnC.inputs){
			CnC.size = CnC.inputs.size;
			CnC.color = CnC.inputs.color || 'green';
			CnC.quantity = CnC.inputs.quantity;	
		} else {
			CnC.size = 1;
			CnC.color = 'green';
			CnC.quantity = 1;
		}
		console.log('Reading inputs', CnC.inputs);
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

				// Only using this object to store for later storage when committing
				CnC.inputs = inputs;
				CnC.inputs.uid = precedingChainUser ? precedingChainUser.val().uid : uid;
				CnC.inputs.displayName = precedingChainUser ? precedingChainUser.val().displayName : displayName;
				
				if (isFirstInputRead){
					isFirstInputRead = false;
					window.refreshEditorVariables();
					if (window.GLCMainController){
						window.GLCMainController.compile();
					}
				}

				if (!myChainRef){
					console.log('myChainRef does not exist, pushing to chain');
					myChainRef = chainRef.push({
						uid : uid,
						displayName : displayName,
						inputs : CnC.inputs,
						outputs : {
							size : CnC.size,
							color : CnC.color,
							quantity : CnC.quantity
						}
					});
				}
				// myChainRef.onDisconnect().remove();
				console.log('myChainRef', myChainRef);
			});


			var commitsPath = 'interconnected/users/' + uid + '/commits';

			var commitsDbRef = database.ref(commitsPath);
			var commitsStorageRef = storage.ref(commitsPath);
		
			var latestCommitRef = database.ref('interconnected/latest-by-user/' + uid);	

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
						timestamp : timestamp,
						
						// Store input & output variables
						inputs : CnC.inputs,
						outputs : {
							size : CnC.size,
							color : CnC.color,
							quantity : CnC.quantity
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
						inputs : CnC.inputs,
						outputs : {
							size : CnC.size,
							color : CnC.color,
							quantity : CnC.quantity
						}
					});

					myChainRef.set({
						uid : uid,
						displayName : displayName,
						inputs : CnC.inputs,
						outputs : {
							size : CnC.size,
							color : CnC.color,
							quantity : CnC.quantity
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
