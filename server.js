const express = require("express");
const app = express();
const port = 4000;
const books = require("./books");
const { query } = require("./database.js");
require("dotenv").config();

app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.originalUrl}`);
  res.on("finish", () => {
    // the 'finish' event will be emitted when the response is handed over to the OS
    console.log(`Response status: ${res.statusCode}`);
  });
  next();
});
app.use(express.json());

function getNextIdFromCollection(collection) {
  if (collection.length === 0) return 1;
  const lastRecord = collection[collection.length - 1];
  return lastRecord.id + 1;
}

app.get("/", (req, res) => {
  res.send("Welcome to the Book Tracker API!");
});

// Get all the books
app.get("/books", async (req, res) => {
  try {
    const allBooks = await query("SELECT * FROM book_applications");
    res.json(allBooks.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get a specific book
app.get("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id, 10);

  try {
    const book = await query("SELECT * FROM book_applications WHERE id = $1", [
      bookId,
    ]);
    const foundBook = book.rows[0];
    if (foundBook) {
      res.json(foundBook);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Create a new book
app.post("/books", async (req, res) => {
  const {
    company,
    title,
    minSalary,
    maxSalary,
    location,
    postDate,
    bookPostUrl,
    applicationDate,
    lastContactDate,
    companyContact,
    status,
  } = req.body;

  try {
    const newBook = await query(
      `INSERT INTO book_applications 
      (company, title, minSalary, maxSalary, location, postDate, bookPostUrl, applicationDate, lastContactDate, companyContact, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        company,
        title,
        minSalary,
        maxSalary,
        location,
        postDate,
        bookPostUrl,
        applicationDate,
        lastContactDate,
        companyContact,
        status,
      ]
    );
    console.log(newBook);
    res.status(201).json(newBook.rows[0]);
  } catch (error) {
    console.error("Something went wrong", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Update a specific book
app.patch("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id, 10);
  const {
    company,
    title,
    minSalary,
    maxSalary,
    location,
    postDate,
    bookPostUrl,
    applicationDate,
    lastContactDate,
    companyContact,
    status,
  } = req.body;

  try {
    const updatedBook = await query(
      `UPDATE book_applications 
      SET company = $1, title = $2, minSalary = $3, maxSalary = $4, location = $5, postDate = $6, bookPostUrl = $7, applicationDate = $8, lastContactDate = $9, companyContact = $10, status = $11 
      WHERE id = $12
      RETURNING *`,
      [
        company,
        title,
        minSalary,
        maxSalary,
        location,
        postDate,
        bookPostUrl,
        applicationDate,
        lastContactDate,
        companyContact,
        status,
      ]
    );
    const foundBook = updatedBook.rows[0];
    if (foundBook) {
      res.json(foundBook);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete a specific book
app.delete("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id, 10);

  try {
    const deleteBook = await query(
      "DELETE FROM book_applications WHERE id = $1",
      [bookId]
    );
    if (deleteBook.rowCount > 0) {
      res.json({ message: "Book deleted successfully" });
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
