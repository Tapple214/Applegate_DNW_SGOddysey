-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- Table for authors
CREATE TABLE IF NOT EXISTS author (
    author_id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_name TEXT NOT NULL UNIQUE,
    author_password TEXT NOT NULL
);

-- Table for author's blog 
CREATE TABLE IF NOT EXISTS blog (
    blog_id INTEGER PRIMARY KEY AUTOINCREMENT,
    blog_title TEXT NOT NULL,
    blog_subtitle TEXT NOT NULL,
    author_name TEXT NOT NULL,
    blog_views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    author_id INTEGER,
    FOREIGN KEY (author_id) REFERENCES author(author_id)
);

-- Table for articles 
CREATE TABLE IF NOT EXISTS article (
    article_id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_title TEXT NOT NULL,
    article_content TEXT NOT NULL,
    article_tag TEXT,
    article_image TEXT,
    article_type TEXT,
    author_name TEXT,
    article_views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    blog_id INTEGER, 
    author_id INTEGER,
    FOREIGN KEY (blog_id) REFERENCES blog(blog_id),
    FOREIGN KEY (author_id) REFERENCES author(author_id)
);

-- Table for blog comments 
CREATE TABLE IF NOT EXISTS blogComment (
    comment_id INTEGER PRIMARY KEY,
    comment_name TEXT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    blog_id INTEGER,
    FOREIGN KEY (blog_id) REFERENCES blog(blog_id)
);

-- Table for article comments 
CREATE TABLE IF NOT EXISTS articleComment (
    comment_id INTEGER PRIMARY KEY,
    comment_name TEXT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    article_id INTEGER,
    FOREIGN KEY (article_id) REFERENCES article(article_id)
);

-- Table for article's likes/dislikes 
CREATE TABLE IF NOT EXISTS blogFeedback (
    feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
    like_count INTEGER DEFAULT 0,
    dislike_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    blog_id INTEGER,
    FOREIGN KEY (blog_id) REFERENCES blog(blog_id)
);

CREATE TABLE IF NOT EXISTS articleFeedback (
    feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
    like_count INTEGER DEFAULT 0,
    dislike_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    article_id INTEGER,
    FOREIGN KEY (article_id) REFERENCES article(article_id)
);

COMMIT;
