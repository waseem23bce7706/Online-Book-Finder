// public/app.js
const API_URL = 'http://localhost:3000/books';
let currentPage = 1;
let currentMode = 'pagination'; // Tracks if we are viewing all paginated books or a filtered list

document.addEventListener('DOMContentLoaded', () => {
    loadBooks(currentPage);
});

// Render books to the DOM
function displayBooks(books, append = false) {
    const container = document.getElementById('resultsContainer');
    if (!append) container.innerHTML = ''; 

    if (books.length === 0 && !append) {
        container.innerHTML = '<p>No books found matching your criteria.</p>';
        return;
    }

    books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <h3>${book.title}</h3>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>Category:</strong> ${book.category}</p>
            <p><strong>Year:</strong> ${book.year}</p>
            <hr>
            <div style="display: flex; justify-content: space-between;">
                <span class="price">$${book.price}</span>
                <span class="rating">⭐ ${book.rating}</span>
            </div>
        `;
        container.appendChild(card);
    });

    // Hide 'Load More' button if we aren't in standard pagination mode or returned fewer than 5 books
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (currentMode === 'pagination' && books.length === 5) {
        loadMoreBtn.style.display = 'inline-block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

// 5. PAGINATION (Default view)
async function loadBooks(page) {
    try {
        const response = await fetch(`${API_URL}?page=${page}`);
        const books = await response.json();
        // Append if page > 1, otherwise replace
        displayBooks(books, page > 1); 
    } catch (err) {
        console.error("Error loading books:", err);
    }
}

function loadMore() {
    currentPage++;
    loadBooks(currentPage);
}

// 1. SEARCH BY TITLE
async function searchBooks() {
    const query = document.getElementById('searchInput').value;
    if (!query) return resetView();

    currentMode = 'search';
    try {
        const response = await fetch(`${API_URL}/search?title=${query}`);
        const books = await response.json();
        displayBooks(books);
    } catch (err) {
        console.error("Error searching books:", err);
    }
}

// 2. FILTER BY CATEGORY
async function filterCategory(category) {
    currentMode = 'filter';
    try {
        const response = await fetch(`${API_URL}/category/${category}`);
        const books = await response.json();
        displayBooks(books);
    } catch (err) {
        console.error("Error filtering books:", err);
    }
}

// 3. SORT BOOKS
async function sortBooks(field) {
    currentMode = 'sort';
    try {
        const response = await fetch(`${API_URL}/sort/${field}`);
        const books = await response.json();
        displayBooks(books);
    } catch (err) {
        console.error("Error sorting books:", err);
    }
}

// 4. TOP RATED BOOKS
async function getTopRated() {
    currentMode = 'top';
    try {
        const response = await fetch(`${API_URL}/top`);
        const books = await response.json();
        displayBooks(books);
    } catch (err) {
        console.error("Error fetching top books:", err);
    }
}

// Helper to reset back to standard paginated view
function resetView() {
    document.getElementById('searchInput').value = '';
    currentMode = 'pagination';
    currentPage = 1;
    loadBooks(currentPage);
}
