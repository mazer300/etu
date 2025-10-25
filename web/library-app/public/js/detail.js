// Обработчики для страницы деталей книги
document.addEventListener('DOMContentLoaded', function() {
    const bookViewMode = document.getElementById('bookViewMode');
    const bookEditMode = document.getElementById('bookEditMode');
    const viewModeActions = document.getElementById('viewModeActions');
    const editModeActions = document.getElementById('editModeActions');
    const editForm = document.getElementById('editBookForm');

    let originalData = { ...bookData };

    // Переключение между режимами просмотра и редактирования
    function switchToEditMode() {
        bookViewMode.style.display = 'none';
        bookEditMode.style.display = 'block';
        viewModeActions.style.display = 'none';
        editModeActions.style.display = 'flex';
    }

    function switchToViewMode() {
        bookViewMode.style.display = 'block';
        bookEditMode.style.display = 'none';
        viewModeActions.style.display = 'flex';
        editModeActions.style.display = 'none';
    }

    // Обновление данных в режиме просмотра
    function updateViewMode(data) {
        document.getElementById('bookTitleView').textContent = data.title;
        document.getElementById('bookAuthorView').textContent = data.author;
        document.getElementById('bookYearView').textContent = data.year;
        document.getElementById('bookDescriptionView').textContent = data.description || '';

        // Обновление статуса
        const statusElement = document.getElementById('bookStatusView');
        statusElement.className = `status ${data.status}`;
        statusElement.textContent = data.status === 'available' ? 'В наличии' :
            data.status === 'borrowed' ? 'Выдана' : 'Просрочена';

        // Обновление информации о выдаче
        const borrowedByElement = document.getElementById('bookBorrowedByView');
        const dueDateElement = document.getElementById('bookDueDateView');

        if (data.borrowedBy) {
            borrowedByElement.textContent = data.borrowedBy;
            borrowedByElement.parentElement.style.display = 'flex';
        } else {
            borrowedByElement.parentElement.style.display = 'none';
        }

        if (data.dueDate) {
            dueDateElement.textContent = new Date(data.dueDate).toLocaleDateString('ru-RU');
            dueDateElement.className = `info-value ${data.status === 'overdue' ? 'overdue' : ''}`;
            dueDateElement.parentElement.style.display = 'flex';
        } else {
            dueDateElement.parentElement.style.display = 'none';
        }

        // Обновление кнопок действий
        const borrowBtn = document.getElementById('borrowBtn');
        const returnBtn = document.getElementById('returnBtn');

        if (data.status === 'available') {
            borrowBtn.style.display = 'block';
            returnBtn.style.display = 'none';
        } else {
            borrowBtn.style.display = 'none';
            returnBtn.style.display = 'block';
        }
    }

    // Кнопка редактирования
    document.getElementById('editBtn').addEventListener('click', switchToEditMode);

    // Кнопка отмены редактирования
    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        // Восстановление исходных значений
        document.getElementById('editTitle').value = originalData.title;
        document.getElementById('editAuthor').value = originalData.author;
        document.getElementById('editYear').value = originalData.year;
        document.getElementById('editDescription').value = originalData.description || '';

        switchToViewMode();
    });

    // Сохранение изменений
    document.getElementById('saveBtn').addEventListener('click', async (e) => {
        e.preventDefault();

        const formData = {
            title: document.getElementById('editTitle').value.trim(),
            author: document.getElementById('editAuthor').value.trim(),
            year: parseInt(document.getElementById('editYear').value),
            description: document.getElementById('editDescription').value.trim()
        };

        // Валидация
        if (!formData.title || !formData.author || !formData.year) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        if (formData.year < 0 || formData.year > new Date().getFullYear()) {
            alert(`Год должен быть от 0 до ${new Date().getFullYear()}`);
            return;
        }

        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка обновления книги');
            }

            const updatedBook = await response.json();

            // Обновление данных
            originalData = { ...updatedBook };
            updateViewMode(updatedBook);
            switchToViewMode();

            alert('Книга успешно обновлена');
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    });

    // Кнопка выдачи книги
    const borrowBtn = document.getElementById('borrowBtn');
    if (borrowBtn) {
        borrowBtn.addEventListener('click', () => {
            document.getElementById('borrowDialog').showModal();
        });
    }

    // Кнопка возврата книги
    const returnBtn = document.getElementById('returnBtn');
    if (returnBtn) {
        returnBtn.addEventListener('click', async () => {
            if (confirm('Вы уверены, что хотите вернуть книгу в библиотеку?')) {
                try {
                    const response = await fetch(`/api/books/${bookId}/return`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Ошибка возврата книги');
                    }

                    const updatedBook = await response.json();
                    originalData = { ...updatedBook };
                    updateViewMode(updatedBook);

                    alert('Книга возвращена в библиотеку');
                } catch (error) {
                    alert('Ошибка: ' + error.message);
                }
            }
        });
    }

    // Кнопка удаления книги
    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const bookTitle = deleteBtn.dataset.title;
            document.getElementById('deleteBookTitle').textContent = bookTitle;
            document.getElementById('deleteDialog').showModal();
        });
    }

    // Модальное окно выдачи книги
    document.getElementById('closeBorrowDialog').addEventListener('click', () => {
        document.getElementById('borrowDialog').close();
    });

    document.getElementById('cancelBorrowBtn').addEventListener('click', () => {
        document.getElementById('borrowDialog').close();
    });

    document.getElementById('borrowForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const borrowerName = document.getElementById('borrowerName').value.trim();
        const dueDate = document.getElementById('dueDate').value;

        if (!borrowerName || !dueDate) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        try {
            const response = await fetch(`/api/books/${bookId}/borrow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ borrowerName, dueDate })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка выдачи книги');
            }

            const updatedBook = await response.json();
            originalData = { ...updatedBook };
            updateViewMode(updatedBook);

            document.getElementById('borrowDialog').close();
            document.getElementById('borrowForm').reset();

            alert('Книга выдана читателю');
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    });

    // Модальное окно удаления
    document.getElementById('closeDeleteDialog').addEventListener('click', () => {
        document.getElementById('deleteDialog').close();
    });

    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        document.getElementById('deleteDialog').close();
    });

    document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Ошибка удаления книги');
            }

            alert('Книга удалена');
            window.location.href = '/';
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    });

    // Закрытие модальных окон по клику вне области
    document.querySelectorAll('.dialog').forEach(dialog => {
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.close();
            }
        });
    });
});