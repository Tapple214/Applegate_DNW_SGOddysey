// >>> START <<<

/**
 * artilce.js
 * Article related functions
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

// --- FORM FOR ADDING ARTICLES ---

/**
 * @desc Displays the form for creating a new article post
 */
router.get("/form", requireLogin, (req, res) => {
  res.render("article-form.ejs", {
    session: req.session,
    article_id: "",
    formAction: "add", // add action
  });
});

// --- ARTICLES VIEW ---

router.get("/view/:article_id", (req, res, next) => {
  const article_id = req.params.article_id;

  const incrementViewQuery = "UPDATE article SET article_views = article_views + 1 WHERE article_id = ?;";
  const query = "SELECT * FROM article WHERE article_id = ?";
  const articleFeedbackQuery = "SELECT * FROM articleFeedback WHERE article_id = ?;";
  const articleCommentQuery = "SELECT * FROM articleComment WHERE article_id = ?;";

  // Increment the blog views count
  db.run(incrementViewQuery, [article_id], (err) => {  // Fixed variable name
    if (err) {
      return next(err);
    }

    db.get(query, [article_id], (err, row) => {
      if (err) {
        return next(err);
      }

      if (!row) {
        res.status(404).send("Article post not found");
        return;
      }

      db.all(articleCommentQuery, [article_id], (err, comments) => {
        if (err) {
          return next(err);
        }

        db.all(articleFeedbackQuery, [article_id], (err, feedback) => {
          if (err) {
            return next(err);
          }

          // Structure the feedback data
          const feedbackData = feedback.length > 0 ? feedback[0] : { like_count: 0, dislike_count: 0 };

          res.render("article-view.ejs", {
            session: req.session.author_id ? req.session : "",
            author_name: req.session.author_name || null,
            article_views: row.article_views,
            article_id: row.article_id,
            article_title: row.article_title,
            article_content: row.article_content,
            article_tag: row.article_tag,
            article_image: row.article_image,
            created_at: row.created_at,
            blog_id: row.blog_id,
            feedback: feedbackData,
            comments: comments,
          });
        });
      });
    });
  });
});


// --- DRAFT ARTICLES VIEW ---

router.get("/view/draft/:article_id", requireLogin, (req, res, next) => {
  const article_id = req.params.article_id;

  const query = "SELECT * FROM article WHERE article_id = ?";

  db.get(query, [article_id], (err, row) => {
    if (err) {
      return next(err);
    }

    if (!row) {
      res.status(404).send("Article post not found");
      return;
    }

    res.render("draft-view.ejs", {
      session: req.session.author_id,
      article_id: row.article_id,
      article_title: row.article_title,
      article_content: row.article_content,
      article_tag: row.article_tag,
      article_image: row.article_image,
      created_at: row.created_at,
    });
  });
});

// --- CREATING ARTICLES ---

/**
 * @desc Add a new article post to the database based on data from the submitted form
 */

// Async for images
router.post("/create", requireLogin, async (req, res, next) => {
  const { article_title, article_content, article_tag, base64_image, type } =
    req.body;
  const author_id = req.session.author_id;
  const author_name = req.session.author_name;

  try {
    // Use a Promise wrapper for db.get to make it compatible with async/await
    const getBlogId = (author_id) => {
      return new Promise((resolve, reject) => {
        db.get(
          "SELECT blog_id FROM blog WHERE author_id = ?",
          [author_id],
          (err, row) => {
            if (err) {
              reject(err);
            } else {
              resolve(row);
            }
          }
        );
      });
    };

    const blogRow = await getBlogId(author_id);

    if (!blogRow) {
      console.error("No blog found for the author.");
      throw new Error("Blog not found for the author.");
    }

    const blog_id = blogRow.blog_id;

    let query;
    let query_parameters;

    if (type === "publish") {
      query =
        "INSERT INTO article (article_title, article_content, article_tag, article_image, article_type, author_id, author_name, blog_id) VALUES (?, ?, ?, ?, 'publish', ?, ?, ?);";
    } else if (type === "draft") {
      query =
        "INSERT INTO article (article_title, article_content, article_tag, article_image, article_type, author_id, author_name, blog_id) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?);";
    } else {
      throw new Error("Invalid article type specified.");
    }

    query_parameters = [
      article_title,
      article_content,
      article_tag,
      base64_image,
      author_id,
      author_name,
      blog_id,
    ];

    await db.run(query, query_parameters);

    res.redirect("/author/main");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// --- EDITING ARTICLES ---

router.get("/edit/:article_id", requireLogin, (req, res, next) => {
  const article_id = req.params.article_id;
  const author_id = req.session.author_id;

  const query =
    "SELECT * FROM article WHERE article_id = ? AND author_id = ? AND (article_type = 'publish' OR article_type = 'draft')";

  db.get(query, [article_id, author_id], (err, row) => {
    if (err) {
      next(err);
    } else {
      if (!row) {
        res
          .status(404)
          .send(
            "article post not found or you do not have permission to edit it"
          );
        return;
      }

      res.render("article-form.ejs", {
        session: req.session,
        article_id: row.article_id,
        article_title: row.article_title,
        article_content: row.article_content,
        article_tag: row.article_tag,
        article_image: row.article_image,
        article_type: row.article_type,
        formAction: "edit", // edit action
      });
    }
  });
});

/**
 * @desc Add edited article post to the database based on data from the submitted form
 */
router.put("/edit/:article_id", requireLogin, async (req, res, next) => {
  const { article_title, article_content, article_tag, type } = req.body;

  const author_id = req.session.author_id;
  const author_name = req.session.author_name;
  const article_id = req.params.article_id;

  const imageQuery =
    "SELECT article_image FROM article WHERE article_id = ? AND author_name = ?";

  try {
    db.get(imageQuery, [article_id, author_name], async (err, row) => {
      if (err) {
        next(err);
      } else {
        if (!row) {
          console.error("No article found for the author.");
          throw new Error("Article not found for the author.");
        }

        let query;
        let query_parameters;

        if (type === "publish") {
          query = `UPDATE article 
                   SET article_title = ?, article_content = ?, article_image = ?, article_tag = ?, article_type = "publish", updated_at = DATETIME('now') 
                   WHERE article_id = ? AND author_id = ? AND author_name = ?`;
        } else if (type === "draft") {
          query = `UPDATE article 
                   SET article_title = ?, article_content = ?, article_image = ?, article_tag = ?, article_type = "draft", updated_at = DATETIME('now') 
                   WHERE article_id = ? AND author_id = ? AND author_name = ?`;
        } else {
          throw new Error("Invalid article type specified.");
        }

        query_parameters = [
          article_title,
          article_content,
          row.article_image,
          article_tag,
          article_id,
          author_id,
          author_name,
        ];

        await global.db.run(query, query_parameters);

        res.redirect("/author/main");
      }
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// --- DELETING ARTICLES ---

router.delete("/delete/:article_id", requireLogin, (req, res, next) => {
  const article_id = req.params.article_id;
  const author_id = req.session.author_id;

  // Prepare SQL statement for deleting a blog post
  const query = `
      DELETE FROM article
      WHERE article_id = ? AND author_id = ?
    `;

  // Execute the SQL statement
  db.run(query, [article_id, author_id], function (err) {
    if (err) {
      console.error("Error deleting article post:", err);
      res.status(500).json({ message: "Internal server error" });
    } else if (this.changes > 0) {
      // If one or more rows were deleted (this.changes reflects the number of affected rows)
      res.status(200).json({ message: "article post deleted successfully" });
    } else {
      // If no rows were deleted (likely due to permission or not found)
      res.status(404).json({
        message:
          "article post not found or you do not have permission to delete it",
      });
    }
  });
});

module.exports = router;

// >>> END <<<
