def prinfMartix(matrix, A, B):
    a = [str(x) for x in A]
    b = [str(x) for x in B]
    print('   ', *b)
    n = len(matrix)
    for i in range(n):
        if i > 0:
            print(a[i - 1], *matrix[i])
        else:
            print(' ', *matrix[i])


def vagnerFisher(A, B, replaceCost, insertCost, deleteCost):
    lenA = len(A)
    lenB = len(B)
    print("\n\n>>> Начало алгоритма Вагнера-Фишера <<<")
    # Создаем таблицу DP (динамического программирования)
    matrix = [[0] * (lenB + 1) for _ in range(lenA + 1)]

    # Инициализация первой строки (удаление символов из A для получения пустой строки)
    print("Инициализация первой строки")
    for i in range(1, lenA + 1):
        matrix[i][0] = matrix[i - 1][0] + deleteCost
        print(f"Удаление символа {A[i - 1]}: matrix[{i}][0] = {matrix[i][0]}")
    print()

    # Инициализация первого столбца (вставка символов в пустую строку для получения B)
    print("Инициализация первого столбца")
    for j in range(1, lenB + 1):
        matrix[0][j] = matrix[0][j - 1] + insertCost
        print(f"Вставка символа {B[j - 1]}: matrix[0][{j}] = {matrix[0][j]}")
    print()

    # Заполнение остальных ячеек таблицы
    for i in range(1, lenA + 1):
        for j in range(1, lenB + 1):
            # Если символы совпадают, замена не требуется (стоимость 0)
            if A[i - 1] == B[j - 1]:
                replaceCostCurrent = 0
            else:
                replaceCostCurrent = replaceCost

            # Вычисляем минимальную стоимость для текущей ячейки
            matrix[i][j] = min(
                matrix[i - 1][j] + deleteCost,  # Удаление символа из A
                matrix[i][j - 1] + insertCost,  # Вставка символа в A
                matrix[i - 1][j - 1] + replaceCostCurrent  # Замена символа
            )
            print(f"\nОбработка символов A[{i - 1}] = {A[i - 1]} и B[{j - 1}] = {B[j - 1]}: "
                  f"matrix[{i}][{j}] = {matrix[i][j]} (Удаление: {matrix[i - 1][j] + deleteCost}, "
                  f"Вставка: {matrix[i][j - 1] + insertCost}, Замена: {matrix[i - 1][j - 1] + replaceCostCurrent})")
            prinfMartix(matrix, A, B)

    print("\n\nИтоговая матрица:")
    prinfMartix(matrix, A, B)

    # Возвращаем минимальную стоимость преобразования A в B
    return matrix[lenA][lenB]


# Ввод данных
replaceCost, insertCost, deleteCost = map(int, input(
    "Введите 3 числа со стоимостями операций (перестановка вставка удаление): ").split())
A = input("Введите строку A: ").strip()
B = input("Введите строку B: ").strip()

# Вычисление минимальной стоимости
minCost = vagnerFisher(A, B, replaceCost, insertCost, deleteCost)
print(f"Минимальная стоимость операций: {minCost}")
