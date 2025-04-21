def levenshteinDistance(s, t):
    lenS = len(s)
    lenT = len(t)

    # Создаем матрицу dp размером (lenS + 1) x (lenT + 1)
    dp = [[0] * (lenT + 1) for _ in range(lenS + 1)]

    # Инициализация первой строки и первого столбца
    for i in range(lenS + 1):
        dp[i][0] = i
    for j in range(lenT + 1):
        dp[0][j] = j

    # Заполнение матрицы dp
    for i in range(1, lenS + 1):
        for j in range(1, lenT + 1):
            if s[i - 1] == t[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = min(dp[i - 1][j] + 1,  # Удаление
                               dp[i][j - 1] + 1,  # Вставка
                               dp[i - 1][j - 1] + 1)  # Замена

    return dp[lenS][lenT]


# Пример использования
s = input("Введите строку: ").strip()
t = input("Введите строку: ").strip()
print(f"Итоговое редакционное расстояние {levenshteinDistance(s, t)}")
