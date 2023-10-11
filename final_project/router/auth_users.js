const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Check if the username is not empty
  if (!username) {
    return false
  }
  return true;
};

const authenticatedUser = (username, password) => {
  console.log(username, password)
  const user = books.public_users.find(u => u.name === username && u.password === password);
  return !!user;
};
//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (isValid(username)) {
    return res.status(400).json({ message: "Invalid username" });
  }

  if (authenticatedUser(username, password)) {
    const token = jwt.sign({ username }, 'your-secret-key');
    req.session.token = token;

    return res.status(200).json({ message: "Login successful", token });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;
  const username = req.session.token ? jwt.verify(req.session.token, 'your-secret-key').username : null;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // Update or add the review
  if (books.books[isbn] && books.books[isbn].reviews) {
    books.books[isbn].reviews[username] = review;
  } else {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json({ message: "Review added/modified successfully" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.session.token ? jwt.verify(req.session.token, 'your-secret-key').username : null;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  if (books.books[isbn] && books.books[isbn].reviews && books.books[isbn].reviews[username]) {
    // Delete the user's review for the given ISBN
    delete books.books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  } else {
    return res.status(404).json({ message: "Review not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
