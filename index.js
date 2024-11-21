/** @format */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import db from "./db/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// GET all books
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books ORDER BY rating DESC");
    const books = result.rows.map((book) => {
      book.cover_url = `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`;
      return book;
    });

    res.render("index.ejs", { books });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// GET form to add a book
app.get("/books/add", (req, res) => {
  res.render("add-book.ejs");
});

// POST new book
app.post("/books/add", async (req, res) => {
  const { title, author, cover_id, review, rating, read_date } = req.body;

  try {
    await db.query(
      "INSERT INTO books (title, author, cover_id, review, rating, read_date) VALUES ($1, $2, $3, $4, $5, $6)",
      [title, author, cover_id, review, rating, read_date]
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add book" });
  }
});

// GET form to edit a book
app.get("/books/edit/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("SELECT * FROM books WHERE id = $1", [id]);
    const book = result.rows[0];

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.render("edit-book.ejs", { book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch book details" });
  }
});

// POST updated book
app.post("/books/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { title, author, cover_id, review, rating, read_date } = req.body;

  try {
    const result = await db.query(
      "UPDATE books SET title = $1, author = $2, cover_id = $3, review = $4, rating = $5, read_date = $6 WHERE id = $7",
      [title, author, cover_id, review, rating, read_date, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update book" });
  }
});

// DELETE book by ID
app.get("/books/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("DELETE FROM books WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

// GET notes by book ID
app.get("/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const bookResult = await db.query("SELECT title FROM books WHERE id = $1", [
      id,
    ]);
    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    const bookTitle = bookResult.rows[0].title;
    const notesResult = await db.query(
      "SELECT * FROM notes WHERE book_id = $1",
      [id]
    );
    const notes = notesResult.rows;
    notes.forEach((note) => {
      note.content = note.content
        .replace(/\n/g, "</p><p>")
        .replace(/^/, "<p>")
        .replace(/$/, "</p>");
    });

    res.render("notes.ejs", { bookId: id, bookTitle, notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// POST new note for a specific book
app.post("/notes/add/:id", async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    await db.query("INSERT INTO notes (content, book_id) VALUES ($1, $2)", [
      content,
      id,
    ]);
    res.redirect(`/notes/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add note" });
  }
});

// POST update note for a specific book
app.post("/notes/update/:noteId", async (req, res) => {
  const { noteId } = req.params;
  const { additional_content } = req.body;

  try {
    const result = await db.query(
      "UPDATE notes SET content = content || '\n' || $1 WHERE id = $2",
      [additional_content, noteId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    const note = await db.query("SELECT book_id FROM notes WHERE id = $1", [
      noteId,
    ]);
    res.redirect(`/notes/${note.rows[0].book_id}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update note" });
  }
});
// DELETE note by ID
app.get("/notes/delete/:bookId/:noteId", async (req, res) => {
  const { bookId, noteId } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM notes WHERE id = $1 AND book_id = $2",
      [noteId, bookId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.redirect(`/notes/${bookId}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
