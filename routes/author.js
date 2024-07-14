// >>> START <<<

/**
 * author.js
 * Author related functions
 */

const express = require("express");
const router = express.Router();

// Middleware function
function requireLogin(req, res, next) {
  if (req.session.author_id) {
    next();
  } else {
    // Redirect to login if not logged in
    res.redirect("/author/login");
  }
}

//  --- LOGIN ---

/**
 * @desc Displays the sign up/in + blog set up page for author
 */
router.get("/login", (req, res) => {
  res.render("author-login.ejs", { errorMessage: null });
});

/**
 * @desc Add a new author to the database based on data from the submitted form
 */
router.post("/login", (req, res, next) => {
  const { author_name, author_password, action } = req.body;

  if (action === "login") {
    const query =
      "SELECT * FROM author WHERE author_name = ? AND author_password = ?;";

    db.get(query, [author_name, author_password], (err, row) => {
      if (err) {
        next(err);
      } else if (row) {
        // Store user data in session upon successful login
        req.session.author_id = row.author_id;
        req.session.author_name = row.author_name;

        // Check if the author has any blog entries
        const blogQuery =
          "SELECT COUNT(*) AS count FROM blog WHERE author_id = ?;";

        db.get(blogQuery, [row.author_id], (err, result) => {
          if (err) {
            next(err);
          } else if (result.count === 0) {
            // If no blog entries, redirect to /author/setup
            res.redirect("/author/setup");
          } else {
            // If there are blog entries, redirect to /author/main
            res.redirect("/author/main");
          }
        });
      } else {
        // If the author_name or author_password don't match, send an error message
        res.render("author-login.ejs", {
          errorMessage: "Oops! Invalid username or password. Please try again!",
        });
      }
    });
  } else if (action === "signup") {
    // Check if the author_name already exists; prevents duplication
    const checkQuery = "SELECT * FROM author WHERE author_name = ?;";

    db.get(checkQuery, [author_name], (err, row) => {
      if (err) {
        next(err);
      } else if (row) {
        // If the author_name exists, send an error message
        res.render("author-login.ejs", {
          errorMessage:
            "Uh oh! Username already exists. Please choose another to sign up or use it to login.",
        });
      } else {
        // Perform signup
        const query =
          "INSERT INTO author (author_name, author_password) VALUES(?, ?);";

        db.run(query, [author_name, author_password], function (err) {
          if (err) {
            next(err);
          } else {
            // Store user data in session upon successful signup
            // This session will be used throughout the application for privileges
            req.session.author_id = this.lastID;
            req.session.author_name = author_name;

            res.redirect("/author/setup");
          }
        });
      }
    });
  } else {
    // If neither login nor sign in, send an error message
    res
      .status(400)
      .render("author-login.ejs", { errorMessage: "Invalid action." });
  }
});

//  --- BLOG SET UP ---

router.get("/setup", requireLogin, (req, res) => {
  res.render("blog-setup.ejs", { errorMessage: null });
});

router.post("/setup", requireLogin, (req, res, next) => {
  const { blog_title, blog_subtitle } = req.body;

  const author_id = req.session.author_id;
  const author_name = req.session.author_name;

  const query =
    "INSERT INTO blog (blog_title, blog_subtitle, author_name, author_id) VALUES (?, ?, ?, ?);";

  const query_parameters = [blog_title, blog_subtitle, author_name, author_id];

  db.run(query, query_parameters, function (err) {
    if (err) {
      next(err);
    } else {
      res.redirect("/author/main");
    }
  });
});

// --- LOGOUT ---

router.get("/logout", requireLogin, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Error logging out");
    }
    res.redirect("/");
  });
});

// --- MAIN PAGE ---

/**
 * @desc Displays the main page of author view
 */
router.get("/main", requireLogin, (req, res, next) => {
  const author_id = req.session.author_id;
  const author_name_query = `SELECT author_name FROM author WHERE author_id = ?;`;

  // First, fetch the author's name using the author_id
  db.get(author_name_query, [author_id], (err, authorRow) => {
    if (err) {
      return next(err);
    }

    if (!authorRow) {
      return res.status(404).send("Author not found");
    }

    const author_name = authorRow.author_name;

    // Query to fetch blog data for the current author
    const blogQuery = "SELECT * FROM blog WHERE author_id = ? AND author_name = ?;";

    db.all(blogQuery, [author_id, author_name], (err, blogRow) => {
      if (err) {
        return next(err);
      }

      // Check if author has any blog entries
      const blog = blogRow.length > 0 ? blogRow[0] : null;

      // Fetch articles data for the current author
      const articleQuery =
        "SELECT * FROM article WHERE author_id = ? AND (article_type = 'publish' OR article_type = 'draft') ORDER BY updated_at DESC";

      db.all(articleQuery, [author_id], (err, articleRows) => {
        if (err) {
          return next(err);
        }

        // Convert article images to base64 if they are stored as binary
        const articles = articleRows.map((article) => {
          if (
            article.article_image &&
            typeof article.article_image === "object"
          ) {
            article.article_image = Buffer.from(article.article_image).toString(
              "base64"
            );
          }
          return article;
        });

        // Query to fetch author data for the current author
        const authorQuery = "SELECT * FROM author WHERE author_id = ? AND author_name = ?;";

        db.all(authorQuery, [author_id, author_name], (err, authorRow) => {
          if (err) {
            return next(err);
          }

          // Take index[0] since db.all returns an array
          const author = authorRow.length > 0 ? authorRow[0] : null;

          // Count how many articles are published or drafted; used for display purposes
          const publishCount = articles.filter(
            (article) => article.article_type === "publish"
          ).length;
          const draftCount = articles.filter(
            (article) => article.article_type === "draft"
          ).length;

          res.render("author-main.ejs", {
            session: req.session,
            author_id: req.session.author_id,
            author_name: author_name,
            blog: blog,
            author: author,
            articles: articles,
            publishCount: publishCount,
            draftCount: draftCount,
          });
        });
      });
    });
  });
});


module.exports = router;

// >>> END <<<
