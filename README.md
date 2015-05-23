# js-on-hn-emailer

[![Dependency Status](https://david-dm.org/syymza/js-on-hn-emailer.svg)](https://david-dm.org/syymza/js-on-hn-emailer) [![devDependency Status](https://david-dm.org/syymza/js-on-hn-emailer/dev-status.svg)](https://david-dm.org/syymza/js-on-hn-emailer#info=devDependencies)

Send yourself an email every time a new post about Javascript is shared on Hacker News

##Description
If you are like me, you spend a lot of time on [Hacker News](http://news.ycombinator.com). Surely, a lot of the articles posted are interesting, but of particular attention for a Javascript developer are the ones about Javascript.
Never to miss a single one of these posts, I have decided to create a small tool that sends me and email for each new post containing the substrings *JS* or *Javascript* in the title.

________

##Tools

 - This project uses [io.js](https://iojs.org). The main reason for choosing it over [node.js](https://nodejs.org/) has been the fact that it supports some ES6 like [template strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/template_strings) that make the life of a Javascript developer more enjoyable. If you want to use node.js, you should be able to do so by using `var` every time I used `let` and by building your strings concatenating them with `+`.
 - [Firebase](https://www.firebase.com/). A reason to love the HN APIs is that [they are on Firebase](https://github.com/HackerNews/API). Since there is an *npm* module for firebase, it has never been so easy to use a web API.
 - [Email.js](http://emailjs.org/). I did not know this *npm* module before, but after playing a bit with it, I cannot think of a better way to send an email from your io.js/node.js application. You will only need an SMTP server available (I use *Gmail*'s one for this project).
 - [Git](http://git-scm.com/). Because it is 2015 and there is absolute no excuse for not to use a Version control systems (VCS).

________ 
 
##Project setup
These are the basic setup steps to create your **JS on HN Emailer** project:

```bash

#Clone this repository
git clone https://github.com/syymza/js-on-hn-emailer.git

#Enter the new folder
cd js-on-hn-emailer

#Install the submodules
npm install

#Create your config file
touch config.json

```

Now open the `config.json` file you have just created and put your SMTP credentials in it:

```json

{
    "username": "<your_username>",
    "password": "<your_password>",
    "email"   : "<your_email>"
}

```

That'a all. Run index.js with `node index.js` and you should start to receive an email for each new post about Javascript posted on Hacker News.

________ 

##Credits
This post has been inspired by a similar post on the Twilio blog: [Get Notified When Someone Posts An Article From Your Domain on Hacker News Using Node.js, Firebase and Twilio](https://www.twilio.com/blog/2015/04/get-notified-when-someone-posts-an-article-from-your-domain-on-hacker-news-using-node-js-firebase-and-twilio.html).


