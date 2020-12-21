//jshint esversion:6

//below are all the modules needed to run the application
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

//this expression defines the variable app as an instance of express
const app = express();

//this expression allows to run ejs files in the views folder
app.set('view engine', 'ejs');

//this expression is needed to be able to read the input text
app.use(bodyParser.urlencoded({
  extended: true
}));

//this expression is needed to make available the Public files to
// the application from anywhere
app.use(express.static("public"));

// this is to avoid the errors that Mongoose throws
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

//this is a local connection- a web connection would need a url from
// the Mongo Atlas server
mongoose.connect("mongodb://localhost:27017/wikiDB");

//The schema that needs to be created for Mongoose
const articleSchema = {
  title: String,
  content: String
}

//The model that needs to be created by Mongoose
const Article = mongoose.model("Article", articleSchema);


//this is the HTTP GET request from the client
app.get("/articles", function(req, res) {
  Article.find({}, function(err, foundArticles) {
    if (err) {
      res.send(err);
    } else {
      res.send(foundArticles);
    }
  });
});

//this is the HTTP POST request from the client
app.post("/articles", function(req, res) {

  //This is the method to add a new article to Mongodb using Mongoose
  //remember that the title and content are inputs in an html with
  // name="title" and name="content" respectively
  const newArticle = new Article({
    title: req.body.title,
    content: req.body.content
  });

  newArticle.save(function(err) {
    if (!err) {
      res.send("Successfully added a new article");
    } else {
      res.send(err);
    }
  });

});

//this is the HTTP DELETE request from the client to delete all the articles
// in the /articles route
app.delete("/articles", function(req, res) {
  //next follows a Mongoose method to delete all the articles in the collection,
  //check the models documentation model.deleteMany
  Article.deleteMany(function(err) {
    if (!err) {
      res.send("Successfully deleted all articles");
    } else {
      res.send(err);
    }
  });
});


////////////////////Requests targetting individual articles//////////////

// this is the HTTP request to fetch an individual article
app.route('/articles/:articleTitle')
  .get(function (req, res) {
    Article.findOne( //this is the mongoose instruction to find an article in the Article model in Mongodb
      {title: req.params.articleTitle}, function(err, foundArticle) {
      if (!err) {
        res.send(foundArticle);
      } else {
        res.send(err);
      }
    });
  })


//this is the HTTP request to update an individual article in Mongodb
  .put(function(req, res) {
    Article.updateOne( //this is the mongoose instruction to update an article in the Article model in Mongodb
      {title: req.params.articleTitle}, //this is the condition which article to fetch
      {title: req.body.title, content: req.body.content}, // this is what is updated
      {overwrite: true}, // this declares the condition to overwrite previous info
      function(err) { //this is the standard callback function
        if (!err) {
          res.send("Successfully updated article.");
        }
      }
    );
  })

//this is the HTTP request to update an individual field
//(title or content for instance) in an article in Mongodb
  .patch(function(req, res) {
    Article.updateOne( //this is the mongoose instruction to update a particular field in an article in the Article model in Mongodb
      {title: req.params.articleTitle}, //this is the condition which article to fetch
      {$set: req.body}, //this is the condition to update ONLY the field requested in the body
      function(err) { //this is an standard callback function
        if (!err) {
          res.send("Successfully updated article.");
        } else {
          res.send(err);
        }
      }
    );
  })

  .delete(function(req, res) {
    Article.deleteOne(
      {title: req.params.articleTitle},
      function(err) { //this is an standard callback function
        if (!err) {
          res.send("Successfully deleted article.");
        } else {
          res.send(err);
        }
      }
    );
  });






app.listen(3000, function() {
  console.log("Server started on port 3000");
});
