var express = require("express");
var router = express.Router();

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("../models");

// NPR scrape route
router.get("/scrape", function(req, res) {
    axios.get("https://www.npr.org/sections/news/")
    .then(function(response) {
        const $ = cheerio.load(response.data);
            $("article h2").each(function(i, element) {
                const result = {};
                result.title = $(this)
                    .children('a')
                    .text();
                result.link = $(this)
                    .children('a')
                    .attr('href')
                result.summary = $(this)
                    .children('a')
                    .text();
                db.Article.create(result)
                .then(function(dbArticle) {
                    console.log(dbArticle);
            })
            .catch(function(err) {
                console.log(err)
                // return res.json(err);
            });
        });
        res.send('scrape complete. redirecting.')
    });
});

// Articles from the db to handlebars.
router.get("/", function(req, res) {
    db.Article.find({}).limit(20)
    .then(function(articles) {
    res.render('index', {articles})
    })
    .catch(function(err) {
        res.json(err);
    });
});


router.get("/articles", function(req, res) {
    db.Article.find({})
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

// find article by id, populate it with it's note
router.get("/articles/:id", function(req, res) {
    db.Article.findById({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
        res.json(dbArticle);
            //console.log('this note is attached ' + dbArticle)
    })
    .catch(function(err) {
        res.json(err);
    });
});

// set article to saved
router.put("/saved/:id", function(req, res) {
    db.Article.update(
        {_id: req.params.id},
        {saved: true}
    )
    .then(function(result) {
        res.json(result);
    })
    .catch(function(error) {
        res.json(error);
    });
});

// view saved articles
router.get('/saved', function(req, res) {
    db.Article.find({ "saved" : true})
    .then((articles => res.render('saved', {articles})))
})

// drop the Articles collection.
router.get("/delete-articles", function(req, res, next) {
    db.Article.deleteMany({}, (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log("articles dropped!");
        }
    })
    .then(function(dropnotes) {
        db.Note.deleteMany({}, (err) => {
            if (err) {
                console.log(err)
            } else {
                console.log("notes dropped!");
            }
        })
    })
    res.render('index');
});

// post notes
router.post("/articles/:id", function(req, res) {
    const noteBody = req.body;
    const article = req.params.id;  
    db.Note.create(noteBody).then(function(response) {
      db.Article.findByIdAndUpdate(article, { $set: { note: response } }, function (err, done) {
      });
    }).then(noteArticle => res.json(noteArticle)).catch(err => console.log(err))
  });

// delete single note
router.delete("/deletenote/:id", function (req, res) {
    console.log('note id ' + req.params.id);
    db.Note.deleteOne({ _id: req.params.id })
      .then(function (dbNote) {
        db.Article.update(
          { note: { $in: [req.params.id] } },
          { $pull: { note: [req.params.id] } }
        )
      });
  });

module.exports = router;