// >>> START <<<

/**
 * blog.js
 * Blog related functions
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

// --- BLOG VIEW ---

router.get("/view/:blog_id", (req, res, next) => {
  const blog_id = req.params.blog_id;

  const incrementViewQuery = "UPDATE blog SET blog_views = blog_views + 1 WHERE blog_id = ?;";
  const blogQuery = "SELECT * FROM blog WHERE blog_id = ?;";
  const articleQuery = "SELECT * FROM article WHERE blog_id = ?;";
  const blogCommentQuery = "SELECT * FROM blogComment WHERE blog_id = ?;";
  const blogFeedbackQuery = "SELECT * FROM blogFeedback WHERE blog_id = ?;";

  // Increment the blog views count
  db.run(incrementViewQuery, [blog_id], (err) => {
    if (err) {
      return next(err);
    }

    // Execute the blog query next
    db.all(blogQuery, [blog_id], (err, blogs) => {
      if (err) {
        return next(err);
      }
      // Execute the article query next
      db.all(articleQuery, [blog_id], (err, articles) => {
        if (err) {
          return next(err);
        }
        // Execute the comment query next
        db.all(blogCommentQuery, [blog_id], (err, comments) => {
          if (err) {
            return next(err);
          }
          // Execute the feedback query next
          db.all(blogFeedbackQuery, [blog_id], (err, feedback) => {
            if (err) {
              return next(err);
            }

            // Structure the feedback data
            const feedbackData =
              feedback.length > 0
                ? feedback[0]
                : { like_count: 0, dislike_count: 0 };

            res.render("blog-view.ejs", {
              session: req.session.author_id ? req.session : "",
              author_id: req.session.author_id || null,
              author_name: req.session.author_name || null,
              blogs: blogs,
              articles: articles,
              blog_id: blog_id,
              comments: comments,
              feedback: feedbackData,
            });
          });
        });
      });
    });
  });
});


// --- BLOG EDIT ---

/**
 * @desc Display the form for editing a blog post
 */
router.get("/edit", requireLogin, (req, res, next) => {
  const { author_id, author_name } = req.session;

  const blogQuery = "SELECT * FROM blog WHERE author_id = ? AND author_name = ?;";
  const authorQuery = "SELECT * FROM author WHERE author_id = ? AND author_name = ?;";

  db.get(blogQuery, [author_id, author_name], (err, blogRow) => {
    if (err) {
      return next(err);
    }
    if (!blogRow) {
      return res.status(404).send("Blog post not found or you do not have permission to edit it.");
    }

    db.get(authorQuery, [author_id, author_name], (err, authorRow) => {
      if (err) {
        return next(err);
      }
      if (!authorRow) {
        return res.status(404).send("Author not found.");
      }

      res.render("blog-edit.ejs", {
        session: req.session,
        blog: blogRow,
        author: authorRow
      });
    });
  });
});

/**
 * @desc Endpoint for editing blog
 */
router.put("/edit", requireLogin, (req, res, next) => {
  const { blog_id, blog_title, blog_subtitle } = req.body;
  const author_id = req.session.author_id;
  const author_name = req.session.author_name;

  const query = `UPDATE blog 
                  SET blog_title = ?, blog_subtitle = ?
                  WHERE blog_id = ? AND author_id = ? AND author_name = ?`;

  const query_parameters = [
    blog_title,
    blog_subtitle,
    blog_id,
    author_id,
    author_name,
  ];

  db.run(query, query_parameters, (err, row) => {
    if (err) {
      console.error("Database error:", err);
      next(err);
    } else {
      
      res.redirect("/author/main");
    }
  });
});

module.exports = router;

// >>> END <<<
