// Глобальные переменные
let currentFilter = 'all';
let currentSearch = '';
let borrowingBookId = null;

// Вспомогательные функции
function showMessage(text, type = 'success', duration = 5000) {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.innerHTML = `
        <span>${text}</span>
        <button class="message-close">&times;</button>
    `;

    const container = document.querySelector('.container');
    container.insertBefore(message, container.firstChild);

    message.querySelector('.message-close').addEventListener('click', () => {
        message.remove();
    });

    if (duration > 0) {
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, duration);
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// API функции
async function fetchBooks(filter = 'all', search = '') {
    try {
        const params = new URLSearchParams();
        if (filter !== 'all') params.append('status', filter);
        if (search) params.append('search', search);

        const response = await fetch(`/api/books?${params.toString()}`);
        if (!response.ok) throw new Error('Ошибка загрузки книг');
        return await response.json();
    } catch (error) {
        throw new Error('Не удалось загрузить книги: ' + error.message);
    }
}

async function createBook(bookData) {
    try {
        const response = await fetch('/api/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Ошибка создания книги');
        }
        return await response.json();
    } catch (error) {
        throw new Error('Не удалось создать книгу: ' + error.message);
    }
}

async function deleteBook(id) {
    try {
        const response = await fetch(`/api/books/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Ошибка удаления книги');
        return await response.json();
    } catch (error) {
        throw new Error('Не удалось удалить книгу: ' + error.message);
    }
}

async function borrowBook(id, borrowerData) {
    try {
        const response = await fetch(`/api/books/${id}/borrow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(borrowerData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Ошибка выдачи книги');
        }
        return await response.json();
    } catch (error) {
        throw new Error('Не удалось выдать книгу: ' + error.message);
    }
}

async function returnBook(id) {
    try {
        const response = await fetch(`/api/books/${id}/return`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) throw new Error('Ошибка возврата книги');
        return await response.json();
    } catch (error) {
        throw new Error('Не удалось вернуть книгу: ' + error.message);
    }
}

// Рендер книг
function renderBooks(books) {
    const booksGrid = document.getElementById('booksGrid');
    const emptyState = document.getElementById('emptyState');

    if (books.length === 0) {
        booksGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    booksGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    booksGrid.innerHTML = books.map(book => `
        <div class="book-card" data-book-id="${book.id}">
            <div class="book-header">
                <h3>${book.title}</h3>
                <span class="book-year">${book.year}</span>
            </div>
            <div class="book-author">${book.author}</div>
            
            ${book.description ? `
            <div class="book-details">
                <div class="book-detail">
                    <span>Описание:</span>
                    <span>${book.description}</span>
                </div>
            </div>
            ` : ''}
            
            <div class="book-meta">
                <span class="status ${book.status}">
                    ${book.status === 'available' ? 'В наличии' :
        book.status === 'borrowed' ? 'Выдана' : 'Просрочена'}
                </span>
                ${book.borrowedBy && book.dueDate ? `
                    <div class="borrow-info">
                        <div class="borrower">Читатель: ${book.borrowedBy}</div>
                        <div class="due-date ${book.status === 'overdue' ? 'overdue' : ''}">
                            Вернуть до: ${new Date(book.dueDate).toLocaleDateString('ru-RU')}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="book-actions">
                ${book.status === 'available' ? `
                    <button class="btn btn-success borrow-btn" data-id="${book.id}">
                        <i class="fas fa-hand-holding"></i> Выдать
                    </button>
                ` : `
                    <button class="btn btn-warning return-btn" data-id="${book.id}">
                        <i class="fas fa-undo"></i> Вернуть
                    </button>
                `}
                
                <a href="/book/${book.id}" class="btn btn-primary">
                    <i class="fas fa-edit"></i> Редактировать
                </a>
                
                <button class="btn btn-danger delete-btn" data-id="${book.id}" data-title="${book.title}">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </div>
        </div>
    `).join('');

    // Добавляем обработчики событий для новых кнопок
    addEventListenersToBooks();
}

// Обновление списка книг
async function updateBooks() {
    try {
        const books = await fetchBooks(currentFilter, currentSearch);
        renderBooks(books);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Обработчики событий
function addEventListenersToBooks() {
    // Кнопки выдачи
    document.querySelectorAll('.borrow-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            borrowingBookId = e.target.dataset.id;
            document.getElementById('borrowDialog').showModal();
        });
    });

    // Кнопки возврата
    document.querySelectorAll('.return-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const bookId = e.target.dataset.id;
            try {
                await returnBook(bookId);
                showMessage('Книга возвращена в библиотеку');
                await updateBooks();
            } catch (error) {
                showMessage(error.message, 'error');
            }
        });
    });

    // Кнопки удаления
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookId = e.target.dataset.id;
            const bookTitle = e.target.dataset.title;

            document.getElementById('deleteBookTitle').textContent = bookTitle;
            document.getElementById('deleteDialog').showModal();

            document.getElementById('confirmDeleteBtn').onclick = async () => {
                try {
                    await deleteBook(bookId);
                    showMessage('Книга удалена');
                    document.getElementById('deleteDialog').close();
                    await updateBooks();
                } catch (error) {
                    showMessage(error.message, 'error');
                }
            };
        });
    });
}

function setupEventListeners() {
    // Фильтры
    document.querySelectorAll('.filter').forEach(button => {
        button.addEventListener('click', async (e) => {
            document.querySelectorAll('.filter').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            await updateBooks();
        });
    });

    // Поиск
    const searchInput = document.getElementById('searchInput');
    const debouncedSearch = debounce(async (value) => {
        currentSearch = value;
        await updateBooks();
    }, 300);

    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });

    // Добавление книги
    document.getElementById('addBookBtn').addEventListener('click', () => {
        document.getElementById('addBookDialog').showModal();
    });

    // Модальное окно добавления книги
    document.getElementById('closeAddDialog').addEventListener('click', () => {
        document.getElementById('addBookDialog').close();
    });

    document.getElementById('cancelAddBtn').addEventListener('click', () => {
        document.getElementById('addBookDialog').close();
    });

    document.getElementById('addBookForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const bookData = {
            title: document.getElementById('bookTitle').value,
            author: document.getElementById('bookAuthor').value,
            year: parseInt(document.getElementById('bookYear').value),
            description: document.getElementById('bookDescription').value
        };

        if (bookData.year < 0 || bookData.year > new Date().getFullYear()) {
            showMessage(`Год должен быть от 0 до ${new Date().getFullYear()}`, 'error');
            return;
        }

        try {
            await createBook(bookData);
            showMessage('Книга успешно добавлена');
            document.getElementById('addBookDialog').close();
            e.target.reset();
            await updateBooks();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    // Модальное окно выдачи книги
    document.getElementById('closeBorrowDialog').addEventListener('click', () => {
        document.getElementById('borrowDialog').close();
    });

    document.getElementById('cancelBorrowBtn').addEventListener('click', () => {
        document.getElementById('borrowDialog').close();
    });

    document.getElementById('borrowForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const borrowerName = document.getElementById('borrowerName').value;
        const dueDate = document.getElementById('dueDate').value;

        try {
            await borrowBook(borrowingBookId, { borrowerName, dueDate });
            showMessage('Книга выдана читателю');
            document.getElementById('borrowDialog').close();
            e.target.reset();
            await updateBooks();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    // Модальное окно удаления
    document.getElementById('closeDeleteDialog').addEventListener('click', () => {
        document.getElementById('deleteDialog').close();
    });

    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        document.getElementById('deleteDialog').close();
    });

    // Закрытие модальных окон по клику вне области
    document.querySelectorAll('.dialog').forEach(dialog => {
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.close();
            }
        });
    });
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    addEventListenersToBooks();
});