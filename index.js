/**
 * index.js
 * Main entry point
 */

// Set up express, bodyparser and EJS
const express = require("express");
const app = express();
const port = 3000;
var bodyParser = require("body-parser");
const session = require("express-session"); // For sessions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // For images
app.set("view engine", "ejs"); // Set the app to use ejs for rendering
app.use(express.static(__dirname + "/public")); // Set location of static files

// Set up SQLite
// Items in the global namespace are accessible throught out the node application
const sqlite3 = require("sqlite3").verbose();
global.db = new sqlite3.Database("./database.db", function (err) {
  if (err) {
    console.error(err);
    process.exit(1);
  } else {
    console.log("Database connected");
    global.db.run("PRAGMA foreign_keys=ON"); // tell SQLite to pay attention to foreign key constraints
  }
});

// >>> START <<<

// --- SESSION ---
app.use(
  session({
    secret: "Session123!abcdEfGhIjKlmnOpQrSTUVwXYz",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// --- MAIN PAGE ---

/**
 * @desc Displays the main page with the link to reader and author view
 */
app.get("/", (req, res) => {
  if (req.session.author_id) {
    res.render("main-page", {
      session: req.session,
      author_id: req.session.author_id,
      author_name: req.session.author_name,
    });
  } else {
    res.render("main-page", { session: "" });
  }
});

// --- TO CHECK ---

/**
 * @desc Check to see users
 */
app.get("/list-authors", (req, res, next) => {
  // Define the query
  query = "SELECT * FROM author;";

  // Execute the query and render the page with the results
  global.db.all(query, function (err, rows) {
    if (err) {
      next(err); // Send the error on to the error handler
    } else {
      res.json(rows); // Render page as simple json
    }
  });
});

/**
 * @desc Check to see blog entries
 */
app.get("/list-blogs", (req, res, next) => {
  query = "SELECT * FROM blog;";

  global.db.all(query, function (err, rows) {
    if (err) {
      next(err);
    } else {
      res.json(rows);
    }
  });
});

/**
 * @desc Check to see article entries
 */
app.get("/list-articles", (req, res, next) => {
  query = "SELECT * FROM article;";

  global.db.all(query, function (err, rows) {
    if (err) {
      next(err);
    } else {
      res.json(rows);
    }
  });
});

/**
 * @desc Check to see comments
 */
app.get("/list-comments", (req, res, next) => {
  query = "SELECT * FROM comment;";

  global.db.all(query, function (err, rows) {
    if (err) {
      next(err);
    } else {
      res.json(rows);
    }
  });
});

/**
 * @desc Check to see likes/dislikes
 */
app.get("/list-feedback", (req, res, next) => {
  query = "SELECT * FROM feedback;";

  global.db.all(query, function (err, rows) {
    if (err) {
      next(err);
    } else {
      res.json(rows);
    }
  });
});

// --- ROUTE/PATH HANDLERS ---

const authorRoutes = require("./routes/author");
app.use("/author", authorRoutes);

const articleRoutes = require("./routes/article");
app.use("/article", articleRoutes);

const blogRoutes = require("./routes/blog");
app.use("/blog", blogRoutes);

const readerRoutes = require("./routes/reader");
app.use("/reader", readerRoutes);

const actionRoutes = require("./routes/action");
app.use("/action", actionRoutes);

// >>> END <<<

// Make the web application listen for HTTP requests
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
