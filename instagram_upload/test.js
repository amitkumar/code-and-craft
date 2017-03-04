var Client = require('instagram-private-api').V1;
var device = new Client.Device('rcmpelephant');
var storage = new Client.CookieFileStorage(__dirname + '\cookies\someuser.json');
 
// And go for login 
session = Client.Session.create(device, storage, 'rcmpelephant', 'NJ512jn1234')
    .then(function(session) {
   		// Now you have a session, we can follow / unfollow, anything... 
        // And we want to follow Instagram official profile 
        return [session, Client.Account.searchForUser(session, 'instagram')]   
    })
    .spread(function(session, account) {
        return Client.Relationship.create(session, account.id);
    })
    .then(function(relationship) {
        console.log(relationship.params)
        console.log("DONE")
        // {followedBy: ... , following: ... } 
        // Yey, you just followed @instagram 
    })

// JPEG is the only supported format now, pull request for any other format welcomed! 
upload = Upload.photo(session, __dirname + '\test_image\20141225_153029.jpg')
    .then(function(upload) {
        // upload instanceof Client.Upload 
        // nothing more than just keeping upload id 
        console.log(upload.params.uploadId);
        return Media.configurePhoto(session, upload.params.uploadId, 'akward caption');
    })
    .then(function(medium) {
        // we configure medium, it is now visible with caption 
        console.log(medium.params)
    })


upload