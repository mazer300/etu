// Обработчики для страницы деталей книги
document.addEventListener('DOMContentLoaded', function() {
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

                alert('Книга возвращена в библиотеку');
                location.reload();
            } catch (error) {
                alert('Ошибка: ' + error.message);
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

        const borrowerName = document.getElementById('borrowerName').value;
        const dueDate = document.getElementById('dueDate').value;

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

            alert('Книга выдана читателю');
            document.getElementById('borrowDialog').close();
            location.reload();
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