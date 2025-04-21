from collections import deque


class TrieNode:
    """Класс узла бора"""

    def __init__(self, nodeId: int):
        self.id = nodeId  # уникальный идентификатор узла (для вывода)

        self.isTerminal = False  # флаг, является ли вершина терминальной
        self.patternIndices = []  # номера шаблонов, заканчивающихся в этом узле
        self.patternLength = 0  # длина шаблона (для определения позиции)

        self.childrens = {}  # указатели на дочерние узлы
        self.suffixLink = None  # суффиксная ссылка
        self.finalLink = None  # конечная ссылка


class AhoCorasicAlgorithm:
    """Класс, реализующий алгоритм Ахо-Корасика"""

    def __init__(self, patterns: list):
        """Инициализирует алгоритм, создает автомат"""

        self.root = TrieNode(0)  # корневой узел
        self.root.suffixLink = self.root  # суффиксная ссылка корня (ведет на себя)
        self.nodeCount = 1  # счетчик узлов

        print("\nНачинаем построение бора:")
        # строим бор
        for index in range(len(patterns)):
            print(f"\nДобавляем шаблон '{patterns[index]}' (индекс {index}) в бор:")
            self.__add(patterns[index], index)  # добавляем шаблон

        print("Бор построен\n")

        # создаем ссылки, строим автомат (добавление суффиксных и конечных ссылок)
        print("Начинаем построение автомата (добавление суффиксных и конечных ссылок):")
        self.__makeLinks()
        # выводим автомат
        print("\nВывод информации об автомате:")
        self.__printAutomat()

    def __add(self, pattern: str, index: int):
        """Добавляет новый шаблон в бор"""
        currentNode = self.root  # начинаем с корня
        print(f"    Начинаем с корня")
        # перебераем символы шаблона 
        for char in pattern:
            if char not in currentNode.childrens:  # создаем новый узел при необходимости
                newNode = TrieNode(self.nodeCount)  # создаем новый узел
                currentNode.childrens[char] = newNode
                self.nodeCount += 1  # увеличиваем счетчик узлов в автомате
                print(f"    Создаем новый узел {newNode.id} для символа '{char}'")
            else:
                print(f"    Переходим в существующий узел {currentNode.childrens[char].id} для символа '{char}'")
            currentNode = currentNode.childrens[char]  # переходим к дочернему узлу с определенным символом

        currentNode.isTerminal = True  # помечаем терминальную вершину
        currentNode.patternIndices.append(index)  # сохраняем индекс шаблона
        currentNode.patternLength = len(pattern)  # сохраняем длину шаблона
        print(f"    Помечаем узел {currentNode.id} как терминальный для шаблона '{pattern}' (индекс {index})")

    def __makeLinks(self):
        """Создает суффиксные и конечные ссылки"""
        queue = deque()  # инициализируем очередь для поиска в ширину
        queue.append(self.root)  # добавляем корень в очередь
        print("    Добавляем корень в очередь для обработки")

        while queue:
            currentNode = queue.popleft()  # берем следующий узел
            print(f"\n    Обрабатываем узел {currentNode.id}")

            for char, childNode in currentNode.childrens.items():  # перебираем всех детей текущего узла
                print(f"    Обрабатываем ребенка с символом '{char}' (узел {childNode.id})")
                queue.append(childNode)  # добавляем ущел-ребенка в очередь
                print(f"    Добавляем узел {childNode.id} в очередь")

                # для детей корня суффиксная ссылка ведет в корень
                if currentNode == self.root:
                    childNode.suffixLink = self.root  # устанавливаем суффиксную-ссылку на корень
                    print(f"    Это ребенок корня - устанавливаем суффиксную ссылку на корень (0)")
                else:
                    # ищем первую возможную суффиксную ссылку
                    temp = currentNode.suffixLink
                    print(f"    Ищем суффиксную ссылку. Начинаем с узла {temp.id}")
                    while (temp != self.root) and (char not in temp.childrens):
                        temp = temp.suffixLink
                        print(f"    Переходим по суффиксной ссылке к узлу {temp.id}")

                    # устанавливаем найденную ссылку или ссылку на корень
                    if char in temp.childrens:
                        childNode.suffixLink = temp.childrens[char]
                        print(f"    Устанавливаем суффиксную ссылку на узел {temp.childrens[char].id}")
                    else:
                        childNode.suffixLink = self.root
                        print(f"    Устанавливаем суффиксную ссылку на корень (0)")

                # построение конечной ссылки
                if childNode.suffixLink.isTerminal:
                    # если суффиксная ссылка ведет прямо в терминальный узел,
                    childNode.finalLink = childNode.suffixLink  # его конечная ссылка это его суффиксная ссылка
                    print(f"    Устанавливаем конечную ссылку на узел {childNode.suffixLink.id} (терминальный)")
                else:
                    # если суффиксная ссылка ведет в нетерминальный узел,
                    childNode.finalLink = childNode.suffixLink.finalLink  # берем его конечную ссылку
                    if childNode.finalLink:
                        print(f"    Устанавливаем конечную ссылку на узел {childNode.finalLink.id}")
                    else:
                        print(f"    Конечная ссылка не установлена (нет терминальных узлов в цепочке)")

    def search(self, text):
        """Ищет все вхождения шаблонов в тексте"""
        print("\nНачинаем поиск")
        results = []  # массив с результом поиска
        currentNode = self.root  # начинаем с корня

        for position in range(len(text)):
            char = text[position]  # текущий символ
            print(f"\nПозиция {position + 1}, символ '{char}':")

            # используем суффиксные ссылки при отсутствии перехода
            while (currentNode != self.root) and (char not in currentNode.childrens):
                print(
                    f"    Нет перехода по '{char}' из узла {currentNode.id}, переходим по суффиксной ссылке к узлу {currentNode.suffixLink.id}")
                currentNode = currentNode.suffixLink

            # переходим по символу, если переход существует
            if char in currentNode.childrens:
                print(f"    Переход по '{char}' найден, переходим в узел {currentNode.childrens[char].id}")
                currentNode = currentNode.childrens[char]
            else:
                print(f"    Переход по '{char}' не найден, остаемся в корне")

            # проверяем терминальные узлы
            if currentNode.isTerminal:
                print(f"    Узел {currentNode.id} терминальный, шаблоны: {currentNode.patternIndices}")
                for patternIndex in currentNode.patternIndices:
                    startPosition = position - currentNode.patternLength + 2  # вычисляем позицию начала вхождения
                    results.append((startPosition, patternIndex + 1))  # добавляем найденное вхождение к результату
                    print(f"    Найдено вхождение шаблона {patternIndex + 1} на позиции {startPosition}")

            # проверяем конечные ссылки для нахождения всех вложенных шаблонов
            temp = currentNode.finalLink

            while temp:
                print(f"    Переход по конечной ссылке в узел {temp.id}, шаблоны: {temp.patternIndices}")
                for patternIndex in temp.patternIndices:  # перебираем индексы шалонов в узле
                    startPosition = position - temp.patternLength + 2  # вычисляем позицию начала вхождения
                    results.append((startPosition, patternIndex + 1))  # добавляем найденное вхождение к результату
                    print(
                        f"    Найдено вхождение шаблона {patternIndex + 1} на позиции {startPosition} (по конечной ссылке)")
                temp = temp.finalLink  # переходим по конечной ссылке

        print("\nПоиск завершен")
        return sorted(results)  # сортируем результаты по позиции в тексте

    def getNodeCount(self):
        """Позволяет получить число узлов в автомате"""
        return self.nodeCount

    def __printAutomat(self):
        """Выводит информацию о построенном автомате"""
        queue = deque([self.root])  # инициализируем очередь для поиска в ширину
        visited = set()  # формируем сэт посещенных узлов
        visited.add(self.root)  # начинаем с корня

        print(f"Структура автомата (число узлов {self.getNodeCount()}):")
        print("Узел  N [узлы-дети] -> [суф.ссылка, конеч.ссылка] [терминальный?] [шаблоны]")

        while queue:
            node = queue.popleft()

            # Формируем информацию об узле
            childrens = ", ".join(
                [f"'{char}':{node.id}" for char, node in node.childrens.items()])  # информация об узлах-детях
            suffixLinkId = node.suffixLink.id if node.suffixLink else -1  # информация о суффиксной ссылке
            finalLinkId = node.finalLink.id if node.finalLink else -1  # информация о конечной ссылке
            isTerminal = "T" if node.isTerminal else " "  # информация о терминальности узла
            patterns = node.patternIndices if node.isTerminal else []  # информация о шаблонах

            # печатаем информацию об узле автомата
            print(f"Узел {node.id:2} [{childrens:15}] -> [{suffixLinkId:2}, {finalLinkId:2}] [{isTerminal}] {patterns}")

            # добавляем детей текущего узла в очередь
            for _, child in node.childrens.items():
                if child not in visited:
                    visited.add(child)  # добавляем узел-ребенка в сэт посещенных
                    queue.append(child)  # добавляем в очередь


def findIntersectingPatterns(results: list, patterns: list):
    """Ищет пересечения вхождений"""
    intersectionPairs = []  # массив с найденными пересечениями
    print("\nПоиск пересекающихся вхождений:")

    # перебираем вхождения
    for i in range(len(results)):
        startPosition1, patternIndex1 = results[
            i]  # начальная позиция и индекс шаблона первого вхождения, с которым будем сравнивать остальные
        endPosition1 = startPosition1 + len(patterns[patternIndex1 - 1])  # конечная позиция данного вхождения
        print(
            f"\nСравниваем вхождение шаблона {patternIndex1} ('{patterns[patternIndex1 - 1]}') на позициях {startPosition1}-{endPosition1}")

        for j in range(i + 1, len(results)):
            startPosition2, patternIndex2 = results[
                j]  # начальная позиция и индекс шаблона второго вхождения, который сравнивают
            endPosition2 = startPosition2 + len(patterns[patternIndex2 - 1])  # конечная позиция такого вхождения
            print(
                f"    С вхождением шаблона {patternIndex2} ('{patterns[patternIndex2 - 1]}') на позициях {startPosition2}-{endPosition2}")

            if startPosition1 <= endPosition2 and startPosition2 <= endPosition1:  # концы должны быть не раньше начал сравниваемых вхождений
                intersectionPoint = max(startPosition1, startPosition2)  # вычисляем точку начала пересечения
                intersectionPairs.append((patterns[patternIndex1 - 1], patterns[patternIndex2 - 1],
                                          intersectionPoint))  # добавляем в массив перечений
                print(f"    Найдено пересечение в точке {intersectionPoint}")

    return intersectionPairs


def main():
    # ввод данных
    text = input("Введите текст: ")
    num = int(input("Введите количество шаблонов: "))
    patterns = [input(f"Введите шаблон {i + 1}: ") for i in range(num)]

    ahoCorasicAlgorithm = AhoCorasicAlgorithm(patterns)  # инициализация алгоритма (создание автомата)
    results = ahoCorasicAlgorithm.search(text)  # поиск вхождений

    # вывод результатов
    print("\nНайденные вхождения:")
    for startPosition, patternIndex in results:
        print(f"Позиция {startPosition}: шаблон {patternIndex} ('{patterns[patternIndex - 1]}')")

    # вывод пересекающихся частей
    intersectionPairs = findIntersectingPatterns(results, patterns)
    print(f"\nЧисло вершин: {ahoCorasicAlgorithm.getNodeCount()}")
    if len(intersectionPairs) == 0:
        print("\nПересечений нет")
    else:
        print("\nПересечения:")
        for firstPattern, secondPattern, intersectionPoint in intersectionPairs:
            print(f"{firstPattern} и {secondPattern} пересекаются в точке {intersectionPoint}")


if __name__ == "__main__":
    main()
