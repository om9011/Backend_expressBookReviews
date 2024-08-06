const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
}

const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  const user = users.find(user => user.username === username);
  return user.password === password ? true : false;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (authenticatedUser(username, password)) {
    req.session.username = username
    return res.status(200).json({ message: "Login successful" });
  } else {
    return res.status(401).json({ message: "Invalid username or password." });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.username;

  if (!review) {
    return res.status(400).json({ message: "Review content is required." });
  }

  if (books[isbn]) {
    // Add or modify review
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/modified successfully." });
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.session.username;
  console.log(books);

  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found." });
  }

  delete books[isbn].reviews[username];
  res.status(200).json({ message: "Review deleted successfully" });
});

const getBooksAsync = (callback) => {
  setTimeout(() => {
    callback(null, books); // Simulate async operation with setTimeout
  }, 1000); // Simulate 1 second delay
};

// Route to get all books using async callback function
regd_users.get('/auth/books', (req, res) => {
  getBooksAsync((err, books) => {
    if (err) {
      return res.status(500).json({ message: 'Error retrieving books' });
    }
    res.status(200).json(books);
  });
});

const getBookByIsbnAsync = (isbn) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject(new Error('Book not found'));
      }
    }, 1000); // Simulate 1 second delay
  });
};

regd_users.get('/auth/book/:isbn', (req, res) => {
  const { isbn } = req.params;

  getBookByIsbnAsync(isbn)
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(404).json({ message: error.message });
    });
});

const getBooksByAuthorAsync = (author) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Filter books by author
      const filteredBooks = Object.values(books).filter(book => book.author === author);
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject(new Error('No books found for this author'));
      }
    }, 1000); // Simulate 1 second delay
  });
};

regd_users.get('/auth/books/author/:author', (req, res) => {
  const { author } = req.params;

  getBooksByAuthorAsync(author)
    .then((booksByAuthor) => {
      res.status(200).json(booksByAuthor);
    })
    .catch((error) => {
      res.status(404).json({ message: error.message });
    });
});

const getBooksByTitleAsync = (title) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Filter books by title
      const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject(new Error('No books found with this title'));
      }
    }, 1000); // Simulate 1 second delay
  });
};

// Route to search for books by title using Promises
regd_users.get('/auth/books/title/:title', (req, res) => {
  const { title } = req.params;

  getBooksByTitleAsync(title)
    .then((booksByTitle) => {
      res.status(200).json(booksByTitle);
    })
    .catch((error) => {
      res.status(404).json({ message: error.message });
    });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
