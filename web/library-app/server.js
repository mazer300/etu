import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Настройка EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Путь к данным
const booksPath = path.join(__dirname, 'data', 'books.json');

// Вспомогательные функции
const readBooks = () => {
    try {
        const data = fs.readFileSync(booksPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Если файла нет, создаем начальные данные
        const initialBooks = [
            {
                id: 1,
                title: "Война и мир",
                author: "Лев Толстой",
                year: 1869,
                description: "Роман-эпопея, описывающий русское общество в эпоху войн против Наполеона.",
                status: "available",
                borrowedBy: null,
                dueDate: null,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: "Преступление и наказание",
                author: "Фёдор Достоевский",
                year: 1866,
                description: "Психологический роман о бывшем студенте Родионе Раскольникове.",
                status: "borrowed",
                borrowedBy: "Иван Петров",
                dueDate: "2024-02-15",
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                title: "Мастер и Маргарита",
                author: "Михаил Булгаков",
                year: 1967,
                description: "Роман, сочетающий в себе элементы сатиры, фантастики и философии.",
                status: "overdue",
                borrowedBy: "Мария Сидорова",
                dueDate: "2024-01-10",
                createdAt: new Date().toISOString()
            }
        ];
        writeBooks(initialBooks);
        return initialBooks;
    }
};

const writeBooks = (books) => {
    const dataDir = path.dirname(booksPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(booksPath, JSON.stringify(books, null, 2));
};

const generateId = () => Date.now();

// Маршруты

// Главная страница - список книг
app.get('/', (req, res) => {
    const books = readBooks();
    res.render('index', {
        books,
        currentFilter: 'all',
        title: 'Старинная Библиотека'
    });
});

// Страница деталей книги
app.get('/book/:id', (req, res) => {
    const books = readBooks();
    const book = books.find(b => b.id == req.params.id);
    if (!book) {
        return res.status(404).render('error', {
            message: 'Книга не найдена',
            title: 'Ошибка 404'
        });
    }
    res.render('detail', {
        book,
        title: book.title
    });
});

// API: Получить книги с фильтрацией
app.get('/api/books', (req, res) => {
    const { status, search } = req.query;
    let books = readBooks();

    if (status && status !== 'all') {
        books = books.filter(book => book.status === status);
    }

    if (search) {
        const query = search.toLowerCase();
        books = books.filter(book =>
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query)
        );
    }

    res.json(books);
});

// API: Добавить книгу
app.post('/api/books', (req, res) => {
    const { title, author, year, description } = req.body;

    if (!title || !author || !year) {
        return res.status(400).json({ error: 'Название, автор и год обязательны' });
    }

    const yearNum = parseInt(year);
    if (yearNum < 0 || yearNum > new Date().getFullYear()) {
        return res.status(400).json({ error: 'Год должен быть от 0 до текущего года' });
    }

    const books = readBooks();
    const newBook = {
        id: generateId(),
        title,
        author,
        year: yearNum,
        description: description || '',
        status: 'available',
        borrowedBy: null,
        dueDate: null,
        createdAt: new Date().toISOString()
    };

    books.push(newBook);
    writeBooks(books);
    res.json(newBook);
});

// API: Обновить книгу
app.put('/api/books/:id', (req, res) => {
    const books = readBooks();
    const bookIndex = books.findIndex(b => b.id == req.params.id);

    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Книга не найдена' });
    }

    const { title, author, year, description } = req.body;

    if (!title || !author || !year) {
        return res.status(400).json({ error: 'Название, автор и год обязательны' });
    }

    const yearNum = parseInt(year);
    if (yearNum < 0 || yearNum > new Date().getFullYear()) {
        return res.status(400).json({ error: 'Год должен быть от 0 до текущего года' });
    }

    books[bookIndex] = {
        ...books[bookIndex],
        title,
        author,
        year: yearNum,
        description: description || ''
    };

    writeBooks(books);
    res.json(books[bookIndex]);
});

// API: Удалить книгу
app.delete('/api/books/:id', (req, res) => {
    const books = readBooks();
    const bookIndex = books.findIndex(b => b.id == req.params.id);

    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Книга не найдена' });
    }

    books.splice(bookIndex, 1);
    writeBooks(books);
    res.json({ message: 'Книга удалена' });
});

// API: Выдать книгу
app.post('/api/books/:id/borrow', (req, res) => {
    const books = readBooks();
    const book = books.find(b => b.id == req.params.id);

    if (!book) {
        return res.status(404).json({ error: 'Книга не найдена' });
    }

    const { borrowerName, dueDate } = req.body;

    if (!borrowerName || !dueDate) {
        return res.status(400).json({ error: 'Имя читателя и дата возврата обязательны' });
    }

    book.status = 'borrowed';
    book.borrowedBy = borrowerName;
    book.dueDate = dueDate;

    writeBooks(books);
    res.json(book);
});

// API: Вернуть книгу
app.post('/api/books/:id/return', (req, res) => {
    const books = readBooks();
    const book = books.find(b => b.id == req.params.id);

    if (!book) {
        return res.status(404).json({ error: 'Книга не найдена' });
    }

    book.status = 'available';
    book.borrowedBy = null;
    book.dueDate = null;

    writeBooks(books);
    res.json(book);
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});