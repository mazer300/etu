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

def vagnerFisherRecovery(a, b, replaceCost, insertCost, deleteCost):
    lenA = len(a)
    lenB = len(b)
    print("\n\n>>> Начало алгоритма Вагнера-Фишера с восстановлением операций <<<")

    # Создаем таблицу DP (динамического программирования)
    matrix = [[0] * (lenB + 1) for _ in range(lenA + 1)]

    # Инициализация первой строки (удаление символов из A для получения пустой строки)
    print("\nИнициализация первой строки:")
    for i in range(1, lenA + 1):
        matrix[i][0] = matrix[i - 1][0] + deleteCost
        print(f"Удаление символа {a[i - 1]}: matrix[{i}][0] = {matrix[i][0]}")
    print()

    # Инициализация первого столбца (вставка символов в пустую строку для получения B)
    print("Инициализация первого столбца:")
    for j in range(1, lenB + 1):
        matrix[0][j] = matrix[0][j - 1] + insertCost
        print(f"Вставка символа {b[j - 1]}: matrix[0][{j}] = {matrix[0][j]}")
    print()

    # Заполнение остальных ячеек таблицы
    print("Заполнение таблицы:")
    for i in range(1, lenA + 1):
        for j in range(1, lenB + 1):
            # Если символы совпадают, замена не требуется (стоимость 0)
            if a[i - 1] == b[j - 1]:
                replaceCostCurrent = 0
            else:
                replaceCostCurrent = replaceCost

            # Вычисляем минимальную стоимость для текущей ячейки
            matrix[i][j] = min(
                matrix[i - 1][j] + deleteCost,  # Удаление символа из A
                matrix[i][j - 1] + insertCost,  # Вставка символа в A
                matrix[i - 1][j - 1] + replaceCostCurrent  # Замена символа
            )
            print(f"\nОбработка символов A[{i - 1}] = {a[i - 1]} и B[{j - 1}] = {b[j - 1]}: "
                  f"matrix[{i}][{j}] = {matrix[i][j]} (Удаление: {matrix[i - 1][j] + deleteCost}, "
                  f"Вставка: {matrix[i][j - 1] + insertCost}, Замена: {matrix[i - 1][j - 1] + replaceCostCurrent})")
            prinfMartix(matrix, a, b)

    # Вывод итоговой матрицы
    print("\n\nИтоговая матрица:")
    prinfMartix(matrix, a, b)

    # Восстановление последовательности операций
    print("\nВосстановление последовательности операций:")
    i, j = lenA, lenB
    operations = []
    while i > 0 or j > 0:
        # Проверка на совпадение (M)
        if i > 0 and j > 0 and a[i - 1] == b[j - 1] and matrix[i][j] == matrix[i - 1][j - 1]:
            operations.append('M')
            print(f"Символы A[{i - 1}] = {a[i - 1]} и B[{j - 1}] = {b[j - 1]} совпадают. Операция: M")
            i -= 1
            j -= 1
            continue
        possible = []
        # Проверяем вставку (I)
        if j > 0 and matrix[i][j] == matrix[i][j - 1] + insertCost:
            possible.append(('I', i, j - 1))
        # Проверяем удаление (D)
        if i > 0 and matrix[i][j] == matrix[i - 1][j] + deleteCost:
            possible.append(('D', i - 1, j))
        # Проверяем замену (R)
        if i > 0 and j > 0 and matrix[i][j] == matrix[i - 1][j - 1] + (0 if a[i - 1] == b[j - 1] else replaceCost):
            possible.append(('R', i - 1, j - 1))
        # Выбираем первый возможный вариант (приоритет вставке, затем удалению, затем замене)
        if possible:
            op, newI, newJ = possible[0]
            operations.append(op)
            print(f"Операция: {op}, Позиция: A[{i - 1}], B[{j - 1}]")
            i, j = newI, newJ
        else:
            # Обработка случаев, когда одна из строк закончилась
            if j > 0:
                operations.append('I')
                print(f"Операция: I, Позиция: B[{j - 1}]")
                j -= 1
            elif i > 0:
                operations.append('D')
                print(f"Операция: D, Позиция: A[{i - 1}]")
                i -= 1

    # Разворачиваем операции
    operations.reverse()
    return ''.join(operations)


if __name__ == "__main__":
    # Ввод данных
    replaceCost, insertCost, deleteCost = map(int, input(
        "Введите 3 числа со стоимостями операций (перестановка вставка удаление): ").split())
    a = input("Введите строку A: ").strip()
    b = input("Введите строку B: ").strip()

    # Вычисление последовательности операций
    s1 = vagnerFisherRecovery(a, b, replaceCost, insertCost, deleteCost)

    # Вывод результатов
    print(f"\nРедакционное предписание: {s1}")
    print(
        "M – совпадение; R – заменить символ на другой; I – вставить символ на текущую позицию; D – удалить символ из строки")
    print(f"Исходная строка A: {a}")
    print(f"Исходная строка B: {b}")