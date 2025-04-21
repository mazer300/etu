import time
import matplotlib.pyplot as plt
from PIL import Image, ImageDraw


class Square:
    def __init__(self, N):
        """
        Инициализация класса
        :type N: int
        """
        self.N = N  # Размер квадрата
        self.result = []  # Массив для записи в него лучшего решения
        self.board = [[False] * N for i in range(N)]  # Двухмерный массив, который используется для нахождения места
        self.minCount = float("inf")  # Количество квадратов, лучшее решение
        self.squares = []  # Массив для размещения промежуточных результатов, потом копируются в result
        self.countOperations = 0  # Счётчик итераций для вывода номера в консоль

    def isPrime(self, num):
        """
        Проверка на простоту
        :type num: int
        :rtype: bool
        """
        for i in range(3, int(num ** 0.5) + 1, 2):
            if num % i == 0:
                return False
        return True

    def findFirstPrimeDivisor(self, num):
        """
        Поиск наименьшего простого делителя
        :type num: int
        :rtype int
        """
        # Проверка распространенных простых делителей для оптимизации
        for i in [3, 5, 7, 11, 13, 17, 19, 23]:
            if num % i == 0:
                return i
        return num

    def placeSquare(self, x, y, size):
        """
        Поставить квадрат по заданным координатам
        :type x: int
        :type y: int
        :type size: int
        """
        for i in range(x, x + size):
            for j in range(y, y + size):
                self.board[i][j] = True

    def removeSquare(self, x, y, size):
        """
        Удалить квадрат по заданным координатам
        :type x: int
        :type y: int
        :type size: int
        """
        for i in range(x, x + size):
            for j in range(y, y + size):
                self.board[i][j] = False

    def canPlace(self, x, y, size):
        """
        Проверка места для квадрата
        :type x: int
        :type y: int
        :type size: int
        :rtype: bool
        """
        if x + size > self.N or y + size > self.N:
            return False

        # Проверка левой и верхней границы
        for i in range(x, x + size):
            if self.board[i][y]:
                return False
        for j in range(y, y + size):
            if self.board[x][j]:
                return False

        return True

    def backtrack(self, count):
        """
        Алгоритм бэтрекинга (основной цикл обработки)
        :type count: int
        """
        self.countOperations += 1
        print(f"\nИтерация {self.countOperations}:")
        print(f"Текущее количество квадратов: {count}")
        print(f"Текущий минимум: {self.minCount}")

        # Отсечение ветвей, если текущее решение хуже найденного
        if count >= self.minCount:
            print("Результат хуже лучшего, отбрасываем ветку")
            return

        # Поиск места для нового квадрата
        x, y = -1, -1
        for i in range(self.N):
            for j in range(self.N):
                if not self.board[i][j]:
                    x, y = i, j
                    break
            if x != -1:
                break

        # Запись нового минимума
        if x == -1:
            if count < self.minCount:
                # Вывод промежуточных результатов
                print(f"Найдено новое минимальное количество {count} (предыдущий минимум {self.minCount})")
                print(f"Текущее заполнение")
                for i in self.squares:
                    print(i)

                # Копирование нового минимума
                self.minCount = count
                self.result = self.squares.copy()
            return

        # Подбор квадрата, подходящего на это место
        for size in range(min(self.N - x, self.N - y), 0, -1):
            if self.canPlace(x, y, size):
                print(f"Квадрат с размерами {size}", end=' ')
                print(f"установить на координаты (x,y): {x} {y}")
                self.placeSquare(x, y, size)
                self.squares.append(f'{x + 1} {y + 1} {size}')  # +1 для индексации с 1
                self.backtrack(count + 1)

                # Откат изменений
                self.squares.pop()
                self.removeSquare(x, y, size)

    def solve(self):
        """
        Расстановка базовых квадратов и запуск бэктрекинга для нечётных чисел
        :rtype: List[str]
        """
        print(">>> Начало алгоритма <<<")
        if self.N < 2:
            return ['0']

        # Алгоритм для чётных чисел
        if self.N % 2 == 0:
            print(f"Число {self.N} чётное, будет разбито на 4 квадрат.")
            half = self.N // 2
            self.minCount = 4
            self.result.append("1 1 " + str(half))
            self.result.append(f"{1 + half} 1 {half}")
            self.result.append(f"1 {1 + half} {half}")
            self.result.append(f"{1 + half} {1 + half} {half}")

        else:
            # Алгоритм для простых чисел
            if self.isPrime(self.N):
                print(f"Число {self.N} простое, будет поставлено 3 квадрата с параметрами (x, y, размер)")
                half = self.N // 2

                # Верхний левый квадрат
                self.placeSquare(0, 0, half + 1)
                self.squares.append(f"1 1 {half + 1}")

                # Левый нижний квадрат
                self.placeSquare(0, half + 1, half)
                self.squares.append(f"1 {half + 2} {half}")

                # Правый верхний квадрат
                self.placeSquare(half + 1, 0, half)
                self.squares.append(f"{half + 2} 1 {half}")

                for i in self.squares: print(i)

                self.backtrack(3)

            else:
                # Алгоритм для составных чисел
                print(f"Число {self.N} составное, будет поставлено 3 квадрата с параметрами (x, y, размер)")
                divisor = self.findFirstPrimeDivisor(self.N)
                newSize = self.N // divisor

                # Верхний левый квадрат
                self.placeSquare(0, 0, newSize * 2)
                self.squares.append(f"1 1 {newSize * 2}")

                # Левый нижний квадрат
                self.placeSquare(0, newSize * 2, newSize)
                self.squares.append(f"1 {newSize * 2 + 1} {newSize}")

                # Правый верхний квадрат
                self.placeSquare(newSize * 2, 0, newSize)
                self.squares.append(f"{newSize * 2 + 1} 1 {newSize}")

                for i in self.squares: print(i)

                self.backtrack(3)

        return [str(len(self.result))] + self.result

    def visualization(self, result):
        """
        Визуализация итогового квадрата, вывод количества квадратов и расположения
        :type result: List[str]
        """
        print("\n>>> Итоговый результат <<<")
        print(f'Минимальное количество квадратов: {result[0]}')
        print("Расположение квадратов (x, y, размер)")
        for i in result[1:]:
            print(i)
        print("\nИтоговое заполнение")
        arr = [[int(x) for x in i.split()] for i in self.result]
        field = [[0] * self.N for i in range(self.N)]

        for k in range(len(arr)):
            for i in range(arr[k][0] - 1, arr[k][0] - 1 + arr[k][2]):
                for j in range(arr[k][1] - 1, arr[k][1] - 1 + arr[k][2]):
                    field[i][j] = k + 1

        for i in field:
            print(*i, sep='  ')

        self.drawSquare(field)

    def drawSquare(self, field):
        '''
        Рисует квадраты в квадрате
        :type field: List[List[int]]
        '''
        colors = [
            "green", "gray", "red", "cyan", "navy", "black", "orange", "yellow", "lime", "blue", "purple", "magenta",
            "pink", "teal", "lavender", "brown", "beige", "maroon"
        ]

        pixel = 50
        size = self.N * pixel
        img = Image.new("RGB", (size, size), "white")
        draw = ImageDraw.Draw(img)

        for i in range(self.N):
            for j in range(self.N):
                x1 = j * pixel
                y1 = i * pixel
                x2 = x1 + pixel
                y2 = y1 + pixel

                # Закрашиваем квадрат
                color = colors[(field[i][j] - 1) % len(colors)]
                draw.rectangle((x1, y1, x2, y2), fill=color)

        img.show()  # Открываем изображение


if __name__ == "__main__":
    width = int(input("Введите размер квадрата: "))
    start = time.time()
    s = Square(width)
    result = s.solve()

    s.visualization(result)

    print(f"\nВремя выполнения {time.time() - start:.06f} секунд")

'''
if __name__ == "__main__":
    sizes = []
    times = []
    arrTimes = []
    for width in range(1, 30,2):
        start = time.time()
        s = Square(width)
        result = s.solve()
        elapsed_time = time.time() - start

        sizes.append(width)
        times.append(elapsed_time)

        arrTimes.append(f"{width}: {elapsed_time} секунд")

    print()
    for i in arrTimes:
        print(i)
    # Построение графика
    plt.plot(sizes, times, marker='o')
    plt.title('Время выполнения от размера квадрата')
    plt.xlabel('Размер квадрата')
    plt.ylabel('Время выполнения (секунды)')
    plt.grid(True)
    plt.show()
'''