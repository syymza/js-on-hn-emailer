'use strict';

let Firebase = require("firebase");
let email   = require("emailjs");
let config = require('./config');

let server = email.server.connect({
    user:     config.username,
    password: config.password,
    host:     "smtp.gmail.com", //Use your SMTP server if it is not Gmail
    ssl:      true //This option also depends on your SMTP server
});


let newPostsRef = new Firebase("https://hacker-news.firebaseio.com/v0/newstories/0");

newPostsRef.on("value", dealWithSinglePost);

function dealWithSinglePost (snapshot) {
    let postRef = new Firebase("https://hacker-news.firebaseio.com/v0/item/"+snapshot.val());
    postRef.on('value', filterInterestingPosts);

    function filterInterestingPosts(postSnapshot) {
        //Return if there is no actual valid data
        if(!postSnapshot.val()) {
            return;
        }

        //If we have received some valid data, we unsubcribe from the post updates
        postRef.off();

        let regEx = /(js|javascript)/i;
        let title = postSnapshot.val().title;
        let url = postSnapshot.val().url;
        let isAboutJs = regEx.test(title);

        if (isAboutJs) {
            sendEmail(title, url);
        }
    }
}

function sendEmail(title, url) {

    let email = {
        from: config.email,
        to: config.email,
        subject: `[JS on HN] ${title}`,
        text: `A New Post About Javascript has been posted to Hacker News: ${title}\nRead it here: ${url}`,
        attachment: [{
            data: `<html>
                        <div>
                            <span>A New Post About Javascript has been posted to Hacker News:<span>
                            <strong>${title}</strong>
                        </div>
                        <div>Read it here: ${url}</div>
                    </html>`,
            alternative:true
        }]
    };

    server.send(email);
}