const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const uri = "mongodb://localhost:27017";
let db;

// Connect to MongoDB
MongoClient.connect(uri)
    .then(client => {
        db = client.db('book_finder_db');
        console.log("Connected to MongoDB - Book Finder");
    })
    .catch(err => console.error("MongoDB connection error:", err));

// ---------------------------------------------------------
// NOTE ON ROUTE ORDER: 
// Specific routes (like /books/search and /books/top) 
// must be defined BEFORE parameterized routes 
// (like /books/category/:category) so Express routes correctly.
// ---------------------------------------------------------

// 1. SEARCH BOOKS BY TITLE (Using Query Strings)
// AJAX: GET /books/search?title=javascript
app.get('/books/search', async (req, res) => {
    try {
        const searchQuery = req.query.title;
        if (!searchQuery) {
            return res.status(400).json({ error: "Title query parameter is required" });
        }

        const books = await db.collection('books').find({
            title: { $regex: searchQuery, $options: "i" } // "i" makes it case-insensitive
        }).toArray();

        res.json(books);
    } catch (error) {
        res.status(500).json({ error: "Error searching books" });
    }
});

// 4. TOP RATED BOOKS
// AJAX: GET /books/top
app.get('/books/top', async (req, res) => {
    try {
        const topBooks = await db.collection('books')
            .find({ rating: { $gte: 4 } })
            .limit(5)
            .toArray();

        res.json(topBooks);
    } catch (error) {
        res.status(500).json({ error: "Error fetching top books" });
    }
});

// 2. FILTER BOOKS BY CATEGORY (Using Route Parameters)
// AJAX: GET /books/category/programming
app.get('/books/category/:category', async (req, res) => {
    try {
        // We use a regex here too, just in case the user searches "programming" instead of "Programming"
        const category = req.params.category;
        const books = await db.collection('books')
            .find({ category: { $regex: `^${category}$`, $options: "i" } }) 
            .toArray();

        res.json(books);
    } catch (error) {
        res.status(500).json({ error: "Error filtering by category" });
    }
});

// 3. SORT BOOKS
// AJAX: GET /books/sort/price OR /books/sort/rating
app.get('/books/sort/:field', async (req, res) => {
    try {
        const field = req.params.field;
        let sortQuery = {};

        if (field === "price") {
            sortQuery = { price: 1 }; // 1 for ascending (lowest to highest)
        } else if (field === "rating") {
            sortQuery = { rating: -1 }; // -1 for descending (highest to lowest)
        } else {
            return res.status(400).json({ error: "Invalid sort field. Use 'price' or 'rating'." });
        }

        const books = await db.collection('books').find().sort(sortQuery).toArray();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: "Error sorting books" });
    }
});

// 5. PAGINATION (Load More)
// AJAX: GET /books?page=2
app.get('/books', async (req, res) => {
    try {
        // Default to page 1 if no query parameter is provided
        const page = parseInt(req.query.page) || 1;
        const limit = 5; 
        const skip = (page - 1) * limit; // Calculates how many documents to bypass

        const books = await db.collection('books')
            .find()
            .skip(skip)
            .limit(limit)
            .toArray();

        res.json({
            currentPage: page,
            booksRetrieved: books.length,
            books: books
        });
    } catch (error) {
        res.status(500).json({ error: "Error fetching paginated books" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
