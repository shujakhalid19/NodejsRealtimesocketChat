var express=require('express');
const auth_tools=require('./authentication');
const profile_tools=require('./user/profile');
const action_tools=require('./user/actions');
const tokenverification= require('./authenticatetoken');
const upload_tools=require('./user/uploadtools');
var r=express.Router();

r.route('/registration').post(auth_tools.storeUser);
r.route('/registration/userdetails').post(tokenverification.verifyToken,auth_tools.storeUserDetailsTwo);

r.route('/actions/report').post(tokenverification.verifyToken,action_tools.reportUser);

r.route('/profile/userdetails').post(tokenverification.verifyToken,profile_tools.getProfileDetails);
r.route('/profile/addtogallery').post(tokenverification.verifyToken,profile_tools.addProfileImage);
r.route('/profile/removefromgallery').post(tokenverification.verifyToken,profile_tools.removeProfileImage);
r.route('/profile/gallery').post(tokenverification.verifyToken,profile_tools.getProfileImage)
r.route('/profile/update_details').post(tokenverification.verifyToken,profile_tools.updateProfileDetails);
r.route('/profile/updatedefaultimage').post(tokenverification.verifyToken,profile_tools.updateDefaultImage);


r.route('/profile/recommend').post(tokenverification.verifyToken,profile_tools.getRecommendation);
r.route('/profile/inbox').post(tokenverification.verifyToken,profile_tools.checkInbox);
r.route('/profile/inbox/chats').post(tokenverification.verifyToken,profile_tools.getInbox);
r.route('/profile/inbox/chats/prevmessages').post(tokenverification.verifyToken,profile_tools.getPreviousMessages);

r.route('/fake/registration').post(auth_tools.storeFakeUser);

r.route('/upload').post(tokenverification.verifyToken,upload_tools.getSecureURL);

module.exports=r;

