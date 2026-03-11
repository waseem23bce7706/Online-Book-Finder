// seed.js
const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

const sampleBooks = [
    { title: "JavaScript Essentials", author: "John Smith", category: "Programming", price: 450, rating: 4.5, year: 2023 },
    { title: "Python for Data Science", author: "Alice Brown", category: "Data Science", price: 600, rating: 4.8, year: 2022 },
    { title: "Mastering React", author: "Dave Jones", category: "Programming", price: 500, rating: 4.2, year: 2021 },
    { title: "MongoDB in Action", author: "Jane Doe", category: "Database", price: 400, rating: 4.6, year: 2023 },
    { title: "The Art of SQL", author: "Sam Green", category: "Database", price: 350, rating: 3.9, year: 2019 },
    { title: "Advanced Node.js", author: "Chris White", category: "Programming", price: 550, rating: 4.7, year: 2024 },
    { title: "Machine Learning Basics", author: "Alice Brown", category: "Data Science", price: 700, rating: 4.9, year: 2023 },
    { title: "HTML & CSS Crash Course", author: "Bob Black", category: "Web Design", price: 250, rating: 4.0, year: 2020 }
];

async function seedDB() {
    try {
        await client.connect();
        const db = client.db('book_finder_db');
        const collection = db.collection('books');
        
        // Clear existing data to avoid duplicates
        await collection.deleteMany({});
        console.log("Cleared existing books.");

        // Insert new dummy data
        await collection.insertMany(sampleBooks);
        console.log(`Successfully inserted ${sampleBooks.length} books!`);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

seedDB();
