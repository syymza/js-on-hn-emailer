# js-on-hn-emailer
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

```bahs

#Create the new project folder
mkdir js-on-hn-emailer

#Enter the newly created folder
cd js-on-hn-emailer

#Initialize npm. Use the default options.
npm init

```

You should click *Enter* until it is done.

Now it is time to install the external module dependencies that we are going to use in our project:


    npm install firebase emailjs --save
    

Now we only need to init git in our folder, before beginning to actually write some code:

    git init
    

________ 

##Let's start coding: filtering the HN posts
We want to write our code in a new file called `index.js`:

    touch index.js
 
Open it with your favorite text editor.
Using Firebug with the Hacker News APIs allows us to get notified every time a new post is added to Hacker News:


```javascript

'use strict';
    
let Firebase = require("firebase");
let newPostsRef = new Firebase("https://hacker-news.firebaseio.com/v0/newstories/0");

newPostsRef.on("value", function(snapshot) {
    console.log(snapshot);
});

```

Run your index with `node index.js`. If you wait enough time, you should now see your terminal logging the ID of every new post published on Hacker News. 
We can now use this ID to retrieve the information about the specific post.
Let's create a function that does exactly that:

```javascript

'use strict';
    
let Firebase = require("firebase");
let newPostsRef = new Firebase("https://hacker-news.firebaseio.com/v0/newstories/0");

newPostsRef.on("value", dealWithSinglePost);

function dealWithSinglePost (snapshot) {
    let postRef = new Firebase("https://hacker-news.firebaseio.com/v0/item/"+snapshot.val());
    postRef.on('value', function (postSnapshot) {
    	console.log(postSnapshot.val());
    });
}
```

If we run again our application, we should see our terminal logging the details of each new post (and any update made to it).
We can now decide if the post is of our interest or not checking if the title contains the substrings *JS* or *Javascript*. We also want to exclude any post which does not contain valid data.
Let's create a `filterInterestingPosts` function, which we will use as a callback for `dealWithSinglePost`.

```javascript

function filterInterestingPosts(postSnapshot) {
    //Return if there is no actual valid data
    if(!postSnapshot.val()) {
        return;
    }

    //If we have received some valid data, we unsubcribe from the post updates
    postRef.off();
    
    let regEx = /(js|javascript)/i;
    let title = postSnapshot.val().title;
    let isAboutJs = regEx.test(title);
    console.log(title, isAboutJs);
}

```


If everything went fine, we should now start to see our application logging if each new post matches our Regular Expression.
Your code up to this point should look like like this:

```javascript

'use strict';
    
let Firebase = require("firebase");
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
	    let url = postSnapshot.val().url; //We will use the url to link to the post
	    let isAboutJs = regEx.test(title);
	    console.log(title, isAboutJs);
	}
}

```


________ 

##Adding Email.js to send your emails

I use Gmail to send my emails, but you can use your favorite SMTP server. In any case you will probably need to have some credentials to send your email.
Let's create a config file which won't be shared in your VCS (or add them manually to *.gitignore* if you don't have `printf` in your SO):

```bash

touch config.json
printf 'node_modules\nconfig.json' >> .gitignore
    
```

Open your `config.json` file and add a JSON object containing your SMTP credentials and your email:

```json

{
    "username": "<your_username>",
    "password": "<your_password>",
    "email"   : "<your_email>"
}
    
```

You can now import `Email.js` and `config.json` at the beginning of your `index.js` file and setup your SMTP server object:

```javascript

let email   = require("emailjs");
let config = require('./config');

let server = email.server.connect({
    user:     config.username,
    password: config.password,
    host:     "smtp.gmail.com", //Use your SMTP server if it is not Gmail
    ssl:      true //This option also depends on your SMTP server
});

```

Now we can create our `sendEmail` function according to the [Email.js documentation](https://github.com/eleith/emailjs) (sorry for the missing syntax highlighting but it looks like [Pygments](http://pygments.org/) does not yet support ES6 template strings yet):

```javascript

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

    server.send(email, function(err, message) { console.log(err || message); });
}
    
```

Now, the we only need to invoke our `sendEmail` when the `isAboutJs` variable is true, inside `filterInterestingPosts`

```javascript

if (isAboutJs) {
    sendEmail(title, url);
}

```


________

##Summary

That's all. Your application is ready to be deployed on your favorite host and you should start to receive emails for each post about JS posted on Hacker News.

This is the entire code for the index.js file:

```javascript

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
    
```
    
You can also find the code [on Github](https://github.com/syymza/js-on-hn-emailer), where you can fork it and improve it if you wish.

________ 

##Credits
This post has been inspired by a similar post on the Twilio blog: [Get Notified When Someone Posts An Article From Your Domain on Hacker News Using Node.js, Firebase and Twilio](https://www.twilio.com/blog/2015/04/get-notified-when-someone-posts-an-article-from-your-domain-on-hacker-news-using-node-js-firebase-and-twilio.html).

