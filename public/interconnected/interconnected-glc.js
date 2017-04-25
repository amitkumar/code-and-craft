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
	var amOnline = database.ref('.info/connected');
	
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			// User is signed in.
			var displayName = user.displayName;
			var email = user.email;
			var emailVerified = user.emailVerified;
			var photoURL = user.photoURL;
			var isAnonymous = user.isAnonymous;
			var uid = user.uid;
			var providerData = user.providerData;
			
			var presenseRef = firebase.ref('/interconnected/presence/' + uid);
			
			amOnline.on('value', function(snapshot) {
				if (snapshot.val()) {
					presenseRef.onDisconnect().remove();
					presenseRef.set(true);
				}
			});
		} else {
			window.location('/interconnected');
		}
	});

});