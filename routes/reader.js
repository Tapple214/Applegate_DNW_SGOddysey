// >>> START <<<

/**
 * reader.js
 * Reader related functions
 */

const express = require("express");
const router = express.Router();

// --- MAIN PAGE ---

/**
 * @desc Displays the main page of reader view
 */
router.get("/main", (req, res, next) => {
  // Query
  const blogQuery = "SELECT * FROM blog;";
  const articleQuery = "SELECT * FROM article ORDER BY updated_at DESC;";

  // Execute the blog query first
  db.all(blogQuery, (err, blogs) => {
    if (err) {
      next(err);
    } else {
      // Execute the article query inside the callback of the blog query
      db.all(articleQuery, (err, articles) => {
        if (err) {
          next(err);
        } else {
          if (req.session.author_id) {
            res.render("reader-main.ejs", {
              session: req.session,
              author_id: req.session.author_id,
              author_name: req.session.author_name,
              blogs: blogs,
              articles: articles,
            });
          } else {
            res.render("reader-main.ejs", {
              session: "",
              blogs: blogs,
              articles: articles,
            });
          }
        }
      });
    }
  });
});

module.exports = router;

// >>> END <<<
