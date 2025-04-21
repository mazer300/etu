def prefix(s):
    """
    Функция высчитываем префикс-функцию
    :type s: str
    :rtype: list[int]
    """
    print(">>> Построение префикс-функции <<<")
    print("Массив префикс-функции будет начинаться с 0")

    pi = [0] * len(s)
    for i in range(1, len(s)):
        print(f"\nИтерация {i}:")
        print(f"Текщий символ: s[{i}] = '{s[i]}'")
        k = pi[i - 1]  # Начинаем с предыдущего значения префикс-функции

        # Поиск наибольшего префикса, который также является суффиксом
        while k > 0 and s[k] != s[i]:
            k = pi[k - 1]

        # Если символы совпали, увеличиваем длину префикса
        if s[k] == s[i]:
            print(f'Символы совпали, увеличиваем k до {k + 1}')
            k += 1
        else:
            print("Символы не совпали, k остается 0")
        pi[i] = k

        print(f"Добавлено {k} на позицию {i - 1}\nПрефикс-функция: ", end='')
        print(*pi, sep=', ')
    return pi


def kmp(pattern, text):
    """
    Флгоритм Кнута-Морриса-Пратта, ищет подстроку text в строке pattern
    :type pattern: str
    :type text: str
    :rtype: list[int]
    """
    arr = []
    prefixTable = prefix(pattern)
    j = 0  # индекс для pattern
    print("\n\n>>> Алгоритм Кнута-Морриса-Пратта <<<")
    print(f"Поиск {text} в {pattern}")

    for i in range(len(text)):
        print(f"\nИтерация {i + 1}: ")

        # Корректировка j при несовпадении
        while j > 0 and text[i] != pattern[j]:
            print(f"Несовпадение: text[i={i}]='{text[i]}' vs pattern[j={j}]='{pattern[j]}'")
            print(f"Сдвигаем j={j} -> j=prefixTable[j-1]={prefixTable[j - 1]}")
            j = prefixTable[j - 1]

        # Совпадение символов
        if text[i] == pattern[j]:
            print(
                f"Совпадение: text[i={i}]='{text[i]}' совпадает с pattern[j={j}]='{pattern[j]}',  увеличиваем j до {j + 1}")
            j += 1
        else:
            print(f'Нет совпадений, j остаётся {j}')

        # Полное совпадение паттерна
        if j == len(pattern):
            print(f"Найдено полное совпадение на позиции {i - len(pattern) + 1}")
            arr.append(i - len(pattern) + 1)

            print(f'Сдвигаем j на prefixTable[j-1] = {prefixTable[j - 1]}')
            j = prefixTable[j - 1]

        print(f"Текущее состояние: j = {j}")
    return arr


def test():
    P = 'ababababa'
    T = 'ababababababababa'
    print("\n\n>>> Результат:", kmp(P, T))


#test()

if __name__ == "__main__":
    P = input("Введите строку P: ").strip()
    T = input("Введите строку T: ").strip()
    if len(P) > len(T) or not P:
        print(">>> Результат: ", -1)
    else:
        arr = kmp(P, T)
        print("\n\n>>> Результат:", ','.join([str(x) for x in arr]) if len(arr) != 0 else -1)
