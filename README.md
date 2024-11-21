<!-- @format -->

# Book Tracker Project

A web-based application to track books you've read, including features to add reviews, ratings, and personal notes for each book. The application utilizes **Express.js**, **EJS**, and a **PostgreSQL** database. It also integrates with the **Open Library Covers API** for fetching book cover images.

---

## Features

1. **View All Books**

   - Displays a list of books sorted by their rating (highest first).
   - Each book shows its title, author, review, rating, and read date.
   - Book covers are dynamically loaded from the Open Library Covers API.

2. **Add New Books**

   - Users can add books with the following details:
     - Title
     - Author
     - OpenLibrary Cover ID
     - Review
     - Rating (1–5)
     - Read date

3. **Edit Existing Books**

   - Users can update book details, including the review and rating.

4. **Delete Books**

   - Users can remove books from the tracker.

5. **Read and Manage Notes**
   - Users can add personal notes for each book.
   - Notes are displayed in a formatted view.
   - Users can update notes by appending additional content.
   - Individual notes can be deleted.

---
