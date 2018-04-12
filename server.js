
const express = require('express');
const mongoose = require('mongoose');
const shortURL = require('./shortUrl');
const app = express();

//serve home page
app.use(express.static('public'))

//connect to database at mlab.com
mongoose.connect(process.env.MONGO_URI, err => err ? console.log(err) : console.log('connected to database'))

//root route
app.get("/", (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//generate short URL route
app.get("/api/:url(*)", (req, res) => {
   let url = req.params.url;
   if (validateURL(url)) {
     let shorterUrl = process.env.GLITCH_URI + Math.floor(Math.random()*200);
     
     // search for existing entry for user provided URL, if entry exists return it, otherwise, create a new entry and save it to the database
      shortURL.findOne({originalUrl: url}, function(err, foundRec){
          if (foundRec) {
          res.json(foundRec);
        } else {
          let newUrlObj = new shortURL({originalUrl: url, shortUrl: shorterUrl});
          newUrlObj.save((err, savedDoc) => err ? res.json('err, unable to write to databse') : res.json(savedDoc))
      } 
     });      
  }  else {
    let errMessage = {
        "error": "Not a valid URL, please enter a corretly formatted website address."
      };
    res.send(errMessage);
  }
});

//lookup short URL and reroute to appropriate website
app.get('/:urlToForward', (req, res) => {
  let shorterUrl = req.params.urlToForward;
  shortURL.findOne({shortUrl: process.env.GLITCH_URI + shorterUrl}, (err, result) => {
  if (err) {
    res.send('unable to find value in database')
  } else {
    console.log('routing to ' + result.originalUrl);
    res.redirect(result.originalUrl);
  }
  });
});

//validate URL function
function validateURL(url) {
  var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i; 
  return regex.test(url);
}

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
