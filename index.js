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



        //An array of terms I want to subscribe to.
        //We want to match the 'js' string in any part of the word (e.g. Node.js, jsTree).
        //We want to add word boundaries to the other terms to limit false positives like 'Reactive' or 'Remember'
        let terms = [
            {term: 'js', fullWord: false},
            {term: 'javascript', fullWord: true},
            {term: 'react', fullWord: true},
            {term: 'angular', fullWord: true},
            {term: 'ember', fullWord: true},
            {term: 'backbone', fullWord: true},
            {term: 'jquery', fullWord: true}
        ].map(function (t) {
            const WORD_BOUNDARY = '\\b'; //Escape the \b special character for word boundary
            return t.fullWord ? WORD_BOUNDARY + t.term + WORD_BOUNDARY : t.term;
        });

        //Build a RegEx using the terms defined
        let regEx = new RegExp(terms.join('|'), 'i');

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