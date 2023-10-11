const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post('/register', (req, res) => {
  const { name, password } = req.body;

  const existingUser = books.public_users.find(user => user.name === name);

  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = { name, password };
  books.public_users.push(newUser);

  return res.status(201).json({ message: 'User registered successfully', user: public_users });
});


public_users.get('/', function (req, res) {
  const allBooks = Object.values(books.books);
  return res.status(200).json(allBooks);
});

public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books.books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const booksByAuthor = Object.values(books.books).filter(book => book.author === author);

  if (booksByAuthor.length > 0) {
    res.json(booksByAuthor);
  } else {
    res.status(404).json({ message: 'Books by author not found' });
  }

});


public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const booksWithTitle = Object.values(books.books).filter(book => book.title === title);

  if (booksWithTitle.length > 0) {
    res.json(booksWithTitle);
  } else {
    res.status(404).json({ message: 'Books with title not found' });
  }

});

public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books.books[isbn];

  if (book && book.reviews) {
    res.json(book.reviews);
  } else {
    res.status(404).json({ message: 'Reviews not found' });
  }
});


module.exports.general = public_users;
