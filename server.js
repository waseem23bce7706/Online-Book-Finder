// server.js
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend UI

const uri = "mongodb://localhost:27017";
let db;

MongoClient.connect(uri)
    .then(client => {
        db = client.db('book_finder_db');
        console.log("Connected to MongoDB");
    })
    .catch(err => console.error("MongoDB error:", err));

// 1. SEARCH BOOKS BY TITLE
app.get('/books/search', async (req, res) => {
    try {
        const title = req.query.title || "";
        const books = await db.collection('books').find({
            title: { $regex: title, $options: "i" }
        }).toArray();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: "Search failed" });
    }
});

// 4. TOP RATED BOOKS
app.get('/books/top', async (req, res) => {
    try {
        const topBooks = await db.collection('books')
            .find({ rating: { $gte: 4 } })
            .limit(5)
            .toArray();
        res.json(topBooks);
    } catch (error) {
        res.status(500).json({ error: "Failed fetching top books" });
    }
});

// 2. FILTER BOOKS BY CATEGORY
app.get('/books/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const books = await db.collection('books')
            .find({ category: { $regex: `^${category}$`, $options: "i" } })
            .toArray();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: "Filter failed" });
    }
});

// 3. SORT BOOKS
app.get('/books/sort/:field', async (req, res) => {
    try {
        const field = req.params.field;
        let sortQuery = field === "price" ? { price: 1 } : { rating: -1 };
        
        const books = await db.collection('books').find().sort(sortQuery).toArray();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: "Sort failed" });
    }
});

// 5. PAGINATION
app.get('/books', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5; 
        const skip = (page - 1) * limit;

        const books = await db.collection('books')
            .find()
            .skip(skip)
            .limit(limit)
            .toArray();

        res.json(books);
    } catch (error) {
        res.status(500).json({ error: "Pagination failed" });
    }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
