// >>> START <<<

/**
 * action.js
 * General functions a user of any role can do
 */

const express = require("express");
const router = express.Router();

// --- BLOG/ARTICLE COMMENTING ---

router.post("/comment", async (req, res, next) => {
  const { content_id, content, comment_type, comment_name } = req.body;

  if (!content_id || !content || !comment_type || !comment_name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let query;
  let query_parameters = [content_id, content, comment_name];

  if (comment_type === "blog") {
    query = "INSERT INTO blogComment (blog_id, content, comment_name) VALUES (?, ?, ?);";
  } else if (comment_type === "article") {
    query = "INSERT INTO articleComment (article_id, content, comment_name) VALUES (?, ?, ?);";
  } else {
    return res.status(400).json({ error: "Invalid comment type" });
  }

  try {
    await db.run(query, query_parameters);
    res.redirect("back");
  } catch (error) {
    next(error);
  }
});

// --- BLOG/ARTICLE LIKING ---

router.post("/feedback/:action", (req, res) => {
  const { action } = req.params;
  const { content_id, content_type, likes, dislikes } = req.body;

  if (action !== "like" && action !== "dislike") {
    return res.status(400).send("Invalid action");
  }

  // Check if what is being liked/disliked is a blog or article
  if (content_type === "blog") {
    db.get(
      // Check if a feedback exists
      "SELECT * FROM blogFeedback WHERE blog_id = ?",
      [content_id],
      (err, row) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Internal server error");
        }

        // If a feedback exists
        if (row) {
          // Update the existing feedback entry
          const updateQuery = `
            UPDATE blogFeedback
            SET like_count = ?, dislike_count = ?
            WHERE blog_id = ? 
          `;
          db.run(updateQuery, [likes, dislikes, content_id], (updateErr) => {
            if (updateErr) {
              console.error(updateErr);
              return res.status(500).send("Internal server error");
            }
            res.status(200).send("Feedback updated");
          });
        } else {
          // Insert a new feedback entry if a feedback does not exists
          const insertQuery = `
            INSERT INTO blogFeedback (blog_id, like_count, dislike_count)
            VALUES (?, ?, ?)
          `;
          db.run(insertQuery, [content_id, likes, dislikes], (insertErr) => {
            if (insertErr) {
              console.error(insertErr);
              return res.status(500).send("Internal server error");
            }
            res.status(200).send("Feedback recorded");
          });
        }
      }
    );
  } else if (content_type === "article") {
    db.get(
      "SELECT * FROM articleFeedback WHERE article_id = ?",
      [content_id],
      (err, row) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Internal server error");
        }

        if (row) {
          // Update the existing feedback entry
          const updateQuery = `
            UPDATE articleFeedback
            SET like_count = ?, dislike_count = ?
            WHERE article_id = ? 
          `;
          db.run(updateQuery, [likes, dislikes, content_id], (updateErr) => {
            if (updateErr) {
              console.error(updateErr);
              return res.status(500).send("Internal server error");
            }
            res.status(200).send("Feedback updated");
          });
        } else {
          // Insert a new feedback entry
          const insertQuery = `
            INSERT INTO articleFeedback (article_id, like_count, dislike_count)
            VALUES (?, ?, ?)
          `;
          db.run(insertQuery, [content_id, likes, dislikes], (insertErr) => {
            if (insertErr) {
              console.error(insertErr);
              return res.status(500).send("Internal server error");
            }
            res.status(200).send("Feedback recorded");
          });
        }
      }
    );
  } else {
    res.status(400).send("Invalid content type");
  }
});

module.exports = router;

// >>> END <<<
