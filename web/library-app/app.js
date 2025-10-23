// Данные библиотеки
let books = JSON.parse(localStorage.getItem('libraryBooks')) || [
    {
        id: 1,
        title: "Война и мир",
        author: "Лев Толстой",
        year: 1869,
        description: "Роман-эпопея, описывающий русское общество в эпоху войн против Наполеона.",
        status: "available"
    },
    {
        id: 2,
        title: "Преступление и наказание",
        author: "Фёдор Достоевский",
        year: 1866,
        description: "Психологический роман о бывшем студенте Родионе Раскольникове.",
        status: "borrowed",
        borrowedBy: "Иван Петров",
        returnDate: "2024-02-15"
    },
    {
        id: 3,
        title: "Мастер и Маргарита",
        author: "Михаил Булгаков",
        year: 1967,
        description: "Роман, сочетающий в себе элементы сатиры, фантастики и философии.",
        status: "overdue",
        borrowedBy: "Мария Сидорова",
        returnDate: "2024-01-10"
    }
];

// Глобальные переменные
let currentFilter = 'all';
let editingBookId = null;
let borrowingBookId = null;

// Вспомогательные функции
function getStatusText(status) {
    const statusMap = {
        'available': 'В наличии',
        'borrowed': 'Выдана',
        'overdue': 'Просрочена'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ru-RU');
}

function saveBooks() {
    localStorage.setItem('libraryBooks', JSON.stringify(books));
}

function filterBooks(booksToFilter, filter) {
    switch (filter) {
        case 'available':
            return booksToFilter.filter(book => book.status === 'available');
        case 'borrowed':
            return booksToFilter.filter(book => book.status === 'borrowed');
        case 'overdue':
            return booksToFilter.filter(book => book.status === 'overdue');
        default:
            return booksToFilter;
    }
}

// Рендер книг
function renderBooks() {
    const booksGrid = document.getElementById('booksGrid');
    const emptyState = document.getElementById('emptyState');

    const filteredBooks = filterBooks(books, currentFilter);

    if (filteredBooks.length === 0) {
        booksGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    booksGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    booksGrid.innerHTML = filteredBooks.map(book => `
        <div class="book-card" data-book-id="${book.id}">
            <h3>${book.title}</h3>
            <div class="book-author">${book.author}</div>
            <div class="book-details">
                <div class="book-detail">
                    <span>Год издания:</span>
                    <span>${book.year}</span>
                </div>
                ${book.description ? `
                <div class="book-detail">
                    <span>Описание:</span>
                    <span>${book.description}</span>
                </div>
                ` : ''}
                ${book.borrowedBy ? `
                <div class="book-detail">
                    <span>Читатель:</span>
                    <span>${book.borrowedBy}</span>
                </div>
                ` : ''}
                ${book.returnDate ? `
                <div class="book-detail">
                    <span>Вернуть до:</span>
                    <span>${formatDate(book.returnDate)}</span>
                </div>
                ` : ''}
            </div>
            <div class="book-meta">
                <span class="status ${book.status}">
                    ${getStatusText(book.status)}
                </span>
                <span class="book-year">${book.year}</span>
            </div>
            <div class="book-actions">
                ${book.status === 'available' ? `
                    <button class="btn btn-primary" onclick="borrowBook(${book.id})">
                        <i class="fas fa-hand-holding"></i> Выдать
                    </button>
                ` : `
                    <button class="btn btn-warning" onclick="returnBook(${book.id})">
                        <i class="fas fa-undo"></i> Вернуть
                    </button>
                `}
                <button class="btn btn-primary" onclick="editBook(${book.id})">
                    <i class="fas fa-edit"></i> Редактировать
                </button>
                <button class="btn btn-danger" onclick="deleteBook(${book.id})">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </div>
        </div>
    `).join('');
}

// Функции для работы с книгами
function addBook(bookData) {
    const newBook = {
        id: Date.now(),
        ...bookData,
        status: 'available'
    };
    books.push(newBook);
    saveBooks();
    return newBook;
}

function updateBook(bookId, bookData) {
    const bookIndex = books.findIndex(book => book.id === bookId);
    if (bookIndex !== -1) {
        books[bookIndex] = { ...books[bookIndex], ...bookData };
        saveBooks();
        return books[bookIndex];
    }
    return null;
}

function deleteBook(bookId) {
    if (confirm('Вы уверены, что хотите удалить эту книгу?')) {
        books = books.filter(book => book.id !== bookId);
        saveBooks();
        renderBooks();
    }
}

function borrowBook(bookId) {
    borrowingBookId = bookId;
    document.getElementById('borrowDialog').showModal();
}

function handleBorrowSubmit(bookId, borrowerName, returnDate) {
    const bookIndex = books.findIndex(book => book.id === bookId);
    if (bookIndex !== -1) {
        let status = 'borrowed';
        if (new Date(returnDate) < new Date()) {
            status = 'overdue';
        }

        books[bookIndex].status = status;
        books[bookIndex].borrowedBy = borrowerName;
        books[bookIndex].returnDate = returnDate;
        saveBooks();
        return books[bookIndex];
    }
    return null;
}

function returnBook(bookId) {
    const bookIndex = books.findIndex(book => book.id === bookId);
    if (bookIndex !== -1) {
        books[bookIndex].status = 'available';
        delete books[bookIndex].borrowedBy;
        delete books[bookIndex].returnDate;
        saveBooks();
        renderBooks();
        return books[bookIndex];
    }
    return null;
}

function editBook(bookId) {
    const book = books.find(book => book.id === bookId);
    if (book) {
        openBookDialog(book);
    }
}

function findBookById(bookId) {
    return books.find(book => book.id === bookId);
}

// Диалоговые окна
function openBookDialog(book = null) {
    const dialogTitle = document.getElementById('dialogTitle');
    const form = document.getElementById('bookForm');

    if (book) {
        dialogTitle.textContent = 'Редактировать книгу';
        document.getElementById('bookTitle').value = book.title;
        document.getElementById('bookAuthor').value = book.author;
        document.getElementById('bookYear').value = book.year;
        document.getElementById('bookDescription').value = book.description || '';
        editingBookId = book.id;
    } else {
        dialogTitle.textContent = 'Добавить книгу';
        form.reset();
        editingBookId = null;
    }

    document.getElementById('bookDialog').showModal();
}

// Обработчики событий
function setupEventListeners() {
    // Фильтры
    document.querySelectorAll('.filter').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.filter').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderBooks();
        });
    });

    // Кнопка добавления книги
    document.getElementById('addBookBtn').addEventListener('click', () => {
        openBookDialog();
    });

    // Диалог книги
    document.getElementById('closeDialog').addEventListener('click', () => {
        document.getElementById('bookDialog').close();
    });

    document.getElementById('cancelBtn').addEventListener('click', () => {
        document.getElementById('bookDialog').close();
    });

    // Форма книги
    document.getElementById('bookForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
            title: document.getElementById('bookTitle').value,
            author: document.getElementById('bookAuthor').value,
            year: parseInt(document.getElementById('bookYear').value),
            description: document.getElementById('bookDescription').value
        };

        if (editingBookId) {
            updateBook(editingBookId, formData);
        } else {
            addBook(formData);
        }

        renderBooks();
        document.getElementById('bookDialog').close();
    });

    // Диалог выдачи
    document.getElementById('closeBorrowDialog').addEventListener('click', () => {
        document.getElementById('borrowDialog').close();
    });

    document.getElementById('cancelBorrowBtn').addEventListener('click', () => {
        document.getElementById('borrowDialog').close();
    });

    // Форма выдачи
    document.getElementById('borrowForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const borrowerName = document.getElementById('borrowerName').value;
        const returnDate = document.getElementById('returnDate').value;

        handleBorrowSubmit(borrowingBookId, borrowerName, returnDate);
        renderBooks();

        document.getElementById('borrowForm').reset();
        document.getElementById('borrowDialog').close();
        borrowingBookId = null;
    });
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    renderBooks();
    setupEventListeners();
});