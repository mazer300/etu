import random
import json
import time
from colorama import Style, Fore

class tspAMR:
    def __init__(self, weightMatrix):
        """
        Конструктор класса. Инициализирует решатель задачи коммивояжера.

        :param weightMatrix: Матрица весов (расстояний) между вершинами.
                            weightMatrix[i][j] — вес ребра из вершины i в вершину j.
        """
        self.weightMatrix = weightMatrix
        self.n = len(weightMatrix)  # Количество вершин
        self.bestSolution = None  # Лучший найденный маршрут
        self.bestWeight = float('inf')  # Вес лучшего маршрута (изначально бесконечность)

        # Вывод информации о матрице весов
        print(f"\nИнициализирован решатель TSP для {self.n} городов")
        print("Матрица весов:")
        for row in self.weightMatrix:
            print(" ".join(f"{w:3d}" for w in row))

    def calcSolutionWeight(self, sol):
        """
        Вычисляет суммарный вес маршрута.

        :param sol: Список вершин, представляющий маршрут (например, [0, 2, 1, 0])
        :return: Суммарный вес всех рёбер в маршруте.
        """
        total = sum(self.weightMatrix[sol[i]][sol[i + 1]] for i in range(len(sol) - 1))
        print(f"Расчёт веса для {sol}: {total}")
        return total

    def _calculateCityContribution(self, solution):
        """
        Рассчитывает вклад каждого города в общий вес маршрута.
        Вклад = сумма весов входящего и исходящего рёбер.

        :param solution: Текущий маршрут
        :return: Список кортежей (город, вклад), отсортированный по убыванию вклада.
        """
        print("\nАнализ вклада городов:")
        contributions = {}
        for i in range(1, len(solution) - 1):
            prev, curr, nextNode = solution[i - 1], solution[i], solution[i + 1]
            cost = self.weightMatrix[prev][curr] + self.weightMatrix[curr][nextNode]
            contributions[curr] = cost
            # Вывод деталей расчёта
            print(f"Город {curr}: {prev}-{curr} ({self.weightMatrix[prev][curr]}) + "
                  f"{curr}-{nextNode} ({self.weightMatrix[curr][nextNode]}) = {cost}")
        return sorted(contributions.items(), key=lambda x: -x[1])

    def amrModification(self, start=0, solution=None):
        """
        Алгоритм модификации решения (AMR) с эвристиками:
        1. Выбор городов с наибольшим вкладом в стоимость
        2. Локальный поиск улучшений в радиусе ±3 позиций
        3. Ограничение числа итераций

        :param start: Стартовая вершина (по умолчанию 0)
        :param solution: Начальное решение (если не указано, генерируется автоматически)
        :return: Кортеж (лучший маршрут, вес маршрута)
        """
        print("\n" + "=" * 50)
        print(f"ЗАПУСК АЛГОРИТМА AMR (стартовая вершина: {start})")
        print("=" * 50)

        maxModifications = self.n  # Максимальное число модификаций
        flag = None  # Флаг использования внешнего решения

        # Инициализация начального решения
        if solution is None:
            self.bestSolution = list(range(self.n)) + [0]  # Маршрут 0-1-2-...-n-0
            print("\nСгенерировано начальное решение:", self.bestSolution)
        else:
            self.bestSolution = solution  # Использование переданного решения
            print("\nПолучено внешнее решение:", self.bestSolution)
            flag = 1

        self.bestWeight = self.calcSolutionWeight(self.bestSolution)
        print(f"\nНачальный вес маршрута: {self.bestWeight}")

        modifications = 0  # Счётчик выполненных модификаций
        improved = True  # Флаг наличия улучшений

        # Основной цикл оптимизации
        while improved and modifications < maxModifications:
            print("\n" + "-" * 45)
            print(f"Итерация {modifications + 1}/{maxModifications}")
            print("-" * 45)

            improved = False
            currentRoute = self.bestSolution[:-1]  # Текущий маршрут без последней вершины
            print("Текущий маршрут:", " - ".join(map(str, currentRoute)))

            # Шаг 1: Расчёт вклада гордов и сортировка
            cityContributions = self._calculateCityContribution(self.bestSolution)
            print("\nПриоритет обработки городов:")
            for i, (city, contrib) in enumerate(cityContributions, 1):
                print(f"{i}. Город {city} (вклад: {contrib})")

            # Шаг 2: Перебор городов по убыванию вклада
            for city, contribution in cityContributions:
                print(f"\nОбработка города {city} (текущий вклад: {contribution})")
                originalPos = currentRoute.index(city)  # Текущая позиция города
                bestDelta = 0  # Лучшее изменение веса
                bestNewRoute = None  # Лучший новый маршрут
                checkedPositions = []  # Список проверенных позиций

                # Шаг 3: Поиск в радиусе ±3 позиций
                for delta in (-3, -2, -1, 1, 2, 3):
                    newPos = originalPos + delta
                    if 1 <= newPos < len(currentRoute):
                        # Создание нового маршрута
                        newRoute = currentRoute.copy()
                        del newRoute[originalPos]
                        newRoute.insert(newPos, city)
                        newRouteComplete = newRoute + [0]  # Замыкание маршрута

                        ind = self.bestSolution.index(start)
                        self.bestSolution = (self.bestSolution[ind:-1] + self.bestSolution[0:ind] + [start])

                        # Проверка новой позиции
                        print(f"\nПроверка позиции {newPos} (Δ={delta}):")
                        print("Предлагаемый маршрут:", " - ".join(map(str, newRouteComplete)))

                        newWeight = self.calcSolutionWeight(newRouteComplete)
                        deltaWeight = self.bestWeight - newWeight
                        checkedPositions.append((newPos, deltaWeight))

                        print(f"Δ веса: {deltaWeight} (Текущий: {self.bestWeight}, Новый: {newWeight})")

                        # Обновление лучшего решения
                        if deltaWeight > bestDelta:
                            bestDelta = deltaWeight
                            bestNewRoute = newRouteComplete

                # Вывод результатов проверки позиций
                print("\nРезультаты проверки позиций для города", city)
                for pos, delta in checkedPositions:
                    print(f"Позиция {pos}: Δ={delta}")

                # Применение улучшения
                if bestDelta > 0:
                    print(f"\nНайдено улучшение для города {city}! Δ={bestDelta}")
                    self.bestSolution = bestNewRoute
                    self.bestWeight -= bestDelta
                    improved = True
                    modifications += 1
                    print("Новый маршрут:", " - ".join(map(str, self.bestSolution)))
                    print("Новый вес:", self.bestWeight)
                    break  # Переход к следующей итерации
                else:
                    print("Улучшений не найдено")


        ind = self.bestSolution.index(start)
        self.bestSolution = (self.bestSolution[ind:-1] + self.bestSolution[0:ind] + [start])
        self.bestWeight = self.calcSolutionWeight(self.bestSolution)

        # Финальный вывод результатов
        print("\n" + "=" * 50)
        print("ФИНАЛЬНЫЕ РЕЗУЛЬТАТЫ")
        print("=" * 50)
        print("Лучший найденный маршрут:", " - ".join(map(str, self.bestSolution)))
        print("Общий вес маршрута:", self.bestWeight)
        print("Всего выполнено итераций:", modifications)
        print("=" * 50)

        return self.bestSolution, self.bestWeight

class tspSolver:
    def __init__(self, weightMatrix):
        """
        Конструктор класса.
        weightMatrix - матрица смежности, где weightMatrix[i][j] — вес дуги из вершины i в вершину j.
        """
        n = len(weightMatrix)
        self.weightMatrix = weightMatrix  # Матрица весов
        self.n = n  # Число вершин
        self.bestSolution = None  # Лучшая найденная цепочка (решение)
        self.bestWeight = float('inf')  # Вес лучшего решения (изначально бесконечность)

        # Предварительный этап: для каждой вершины вычисляем два наименьших исходящих ребра.
        # Это будет использоваться при расчёте нижней оценки.
        self.minTwo = []
        for i in range(self.n):
            # Создаем список весов дуг из вершины i во все остальные (исключая петли i->i)
            outs = [self.weightMatrix[i][j] for j in range(self.n) if i != j]
            outs.sort()  # Сортируем веса для нахождения двух минимальных
            if len(outs) >= 2:
                self.minTwo.append((outs[0], outs[1]))  # Сохраняем два минимальных веса
            elif outs:
                self.minTwo.append((outs[0], outs[0]))  # Если есть только одна дуга, используем её дважды
            else:
                self.minTwo.append((0, 0))  # На случай, если вершина не имеет исходящих дуг
        print(f"Инициализация завершена. Минимальные ребра для каждой вершины (0 ... {self.n - 1}):", self.minTwo)

    def solve(self, start=0):
        """
        Основной метод решения задачи.
        start - индекс стартовой вершины (по умолчанию 0).
        """
        print("\nЗапуск алгоритма из стартовой вершины:", start)
        # Создаем список для отслеживания посещённых вершин
        visited = [False] * self.n
        visited[start] = True  # Стартовая вершина считается посещённой

        # Запускаем рекурсивное расширение цепочки, начиная со стартовой вершины
        self.extendChain([start], 0, visited)
        return self.bestSolution, self.bestWeight

    def extendChain(self, chain, currentWeight, visited):
        """
        Рекурсивная функция, которая расширяет цепочку, добавляя по одной вершине.
        chain - текущая цепочка (список индексов вершин)
        currentWeight - суммарный вес текущей цепочки
        visited - список, где True означает, что вершина уже добавлена в цепочку
        """
        if len(chain) > 1: print(f"\nРассматриваем цепочку {chain} с весом {currentWeight}")

        # Если цепочка содержит все вершины, необходимо добавить дугу возврата в стартовую вершину
        if len(chain) == self.n:
            totalWeight = currentWeight + self.weightMatrix[chain[-1]][chain[0]]
            print(f"Получена полная цепочка {chain + [chain[0]]} с общим весом {totalWeight}")
            if totalWeight < self.bestWeight:
                self.bestWeight = totalWeight
                self.bestSolution = chain + [chain[0]]
                print(f"\n\n{Fore.RED}>>>Новое лучшее решение: {self.bestSolution} с весом {self.bestWeight}{Style.RESET_ALL}")
            return

        # Вычисляем нижнюю оценку для завершения цепочки (осталось добавить)

        lowerBound = self.lowerBound(chain, visited,0)
        if currentWeight + lowerBound >= self.bestWeight:
            print("Отсечение ветви, так как сумма текущего веса и нижней оценки не лучше лучшего решения.")
            return

        # Из последней вершины текущей цепочки пробуем добавить каждую непосещённую вершину
        last = chain[-1]
        candidates = []
        for v in range(self.n):
            if not visited[v]:
                print(f"\nКандидат {v}")
                s = self.weightMatrix[last][v]  # Вес дуги от последней вершины к кандидату v
                newChain = chain + [v]  # Создаем новую цепочку с добавлением v
                newWeight = currentWeight + s  # Обновляем суммарный вес цепочки
                lbNew = self.lowerBound(newChain, self.markVisited(visited, v),1)
                candidates.append((s + lbNew, v, s))
                print(f"Вес дуги = {s}, нижняя оценка после добавления = {lbNew}, сумма = {s + lbNew}")

        # Сортируем кандидатов по сумме (s + lbNew), чтобы сначала рассмотреть более перспективные ветви
        candidates.sort(key=lambda x: x[0])
        for total, v, s in candidates:
            print(f"Переход от {last} к {v} (вес дуги {s}, суммарная оценка {total})")
            visited[v] = True  # Отмечаем вершину v как посещённую
            self.extendChain(chain + [v], currentWeight + s, visited)  # Рекурсивно расширяем цепочку
            visited[v] = False  # После возврата отменяем посещение для других вариантов

    def markVisited(self, visited, v):
        """
        Возвращает копию списка visited, где вершина v отмечена как посещённая.
        Используется для вычисления нижней оценки без изменения текущего состояния visited.
        """
        newVisited = visited.copy()
        newVisited[v] = True
        return newVisited

    def calcSolutionWeight(self, sol):
        """
        Вычисляет суммарный вес заданной цепочки sol.
        sol - список вершин, представляющий полный маршрут (с возвратом в начальную вершину).
        """
        total = 0
        for i in range(len(sol) - 1):
            total += self.weightMatrix[sol[i]][sol[i + 1]]
        return total

    def lowerBound(self, chain, visited,flag):
        """
        Вычисляет нижнюю оценку остатка пути (L) как максимум из двух оценок:
         1. Оценка на основе полусуммы минимальных дуг
         2. Оценка на основе веса минимального остовного дерева (MST)
        """
        if flag:
            print("\n=== Начало вычисления нижней оценки ===")
            print(f"Текущая цепочка: {chain}")

            print(f"")
        visitedList = [i for i, v in enumerate(visited) if v]
        if flag:print(f"Посещённые вершины: {visitedList}")

        # 1. Оценка на основе полусуммы минимальных дуг
        lb1 = 0
        minArcsDetails = []

        unvisited = [v for v in range(self.n) if not visited[v]]
        if flag:print(f"\n1. Оценка на основе полусуммы минимальных дуг для непосещённых вершин: {unvisited}")

        if chain:
            start = chain[0]
            end = chain[-1]
            fromEnd = []
            toStart = []
            for v in unvisited:
                if v != end:
                    fromEnd.append(self.weightMatrix[end][v])
                if v != start:
                    toStart.append(self.weightMatrix[v][start])
            minFromEnd = min(fromEnd) if fromEnd else 0
            minToStart = min(toStart) if toStart else 0
            lb1 += (minFromEnd + minToStart)
            minArcsDetails.append(f"Кусок {chain}: min исходящая={minFromEnd}, min входящая={minToStart}")

        for v in unvisited:
            outArcs = []
            inArcs = []
            for u in unvisited:
                if u != v:
                    outArcs.append(self.weightMatrix[v][u])
                    inArcs.append(self.weightMatrix[u][v])
            if chain:
                outArcs.append(self.weightMatrix[v][chain[0]])
                inArcs.append(self.weightMatrix[chain[-1]][v])
            minOut = min(outArcs) if outArcs else 0
            minIn = min(inArcs) if inArcs else 0
            lb1 += (minOut + minIn)
            minArcsDetails.append(f"Вершина {v}: min исходящая={minOut}, min входящая={minIn}")

        if flag:print("\nДетали минимальных дуг:")
        for detail in minArcsDetails:
            if flag:print(detail)

        lb1 = lb1 / 2
        if flag:print(f"\nИтоговая оценка на основе полусуммы минимальных дуг: {lb1}")

        # 2. Оценка на основе MST
        lb2 = 0
        if unvisited:
            if flag:print(f"\n2. Оценка на основе MST для непосещённых вершин: {unvisited}")
            lb2 = self.mstWeight(chain, unvisited,flag)
            if flag:print(f"Вес MST: {lb2}")

        lb = max(lb1, lb2)
        if flag:print(f"\n=== Итоговая нижняя оценка: {lb} (максимум из {lb1} и {lb2}) ===")
        return lb

    def mstWeight(self, chain, unvisited,flag):
        """Вычисляет вес минимального остовного дерева (MST) с детализацией рёбер"""
        if len(unvisited) <= 1:
            if flag:print("MST не требуется: недостаточно вершин")
            return 0

        weightMatrix = [[0] * self.n for i in range(self.n)]
        for i in range(self.n):
            for j in range(self.n):
                weightMatrix[i][j] = min(self.weightMatrix[i][j], self.weightMatrix[j][i])
                weightMatrix[j][i] = min(self.weightMatrix[i][j], self.weightMatrix[j][i])

        # Собираем все куски графа
        nodes = []
        if chain:
            nodes.append({"type": "chain", "vertices": chain})  # Основная цепочка
        nodes.extend([{"type": "node", "vertices": [v]} for v in unvisited])  # Отдельные вершины

        if flag:print("\nСтроим MST для кусков:")
        for idx, node in enumerate(nodes):
            label = "Цепочка" if node["type"] == "chain" else "Вершина"
            if flag:print(f"Узел {idx}: {label} {node['vertices']}")

        # Генерируем допустимые рёбра между кусками
        edges = []
        for i in range(len(nodes)):
            for j in range(i + 1, len(nodes)):
                # Берём последнюю вершину первого куска
                from_vertex = nodes[i]["vertices"][-1]
                # Берём первую вершину второго куска
                to_vertex = nodes[j]["vertices"][0]
                weight = min(
                    weightMatrix[from_vertex][to_vertex],
                    weightMatrix[to_vertex][from_vertex]
                )
                edges.append((weight, i, j, from_vertex, to_vertex))

        # Сортируем рёбра по весу
        edges.sort()
        if flag:print("\nВсе допустимые рёбра между кусками:")
        for w, i, j, fv, tv in edges:
            node_i = f"Куск {i}" if nodes[i]["type"] == "chain" else f"Верш {i}"
            node_j = f"Куск {j}" if nodes[j]["type"] == "chain" else f"Верш {j}"
            if flag:print(f"{node_i} - {node_j} ({fv}-{tv}), Вес: {w}")

        # Алгоритм Краскала
        parent = list(range(len(nodes)))
        edges_added = []
        total_weight = 0

        def find(u):
            while parent[u] != u:
                parent[u] = parent[parent[u]]
                u = parent[u]
            return u

        for edge in edges:
            weight, u, v, from_vert, to_vert = edge
            root_u = find(u)
            root_v = find(v)

            if root_u != root_v:
                parent[root_v] = root_u
                total_weight += weight
                edges_added.append((
                    f"{nodes[u]['vertices']} - {nodes[v]['vertices']}",
                    f"({from_vert}-{to_vert})",
                    f"Вес: {weight}"
                ))

        if flag:
            # Детализированный вывод
            print("\nРезультат MST:")
            print(f"Общий вес: {total_weight}")
            print("Включённые рёбра:")
            for i, (connection, vertices, weight) in enumerate(edges_added, 1):
                print(f"{i}. {connection.ljust(20)} {vertices.ljust(10)} {weight}")

        return total_weight


# Функции для генерации, сохранения и загрузки матрицы весов
def generateWeightMatrix(n, symmetric):
    """
    Генерирует матрицу весов для графа с n вершинами.
    symmetric - если True, генерируется симметричная матрица (для неориентированного графа).
    Возвращает матрицу в виде списка списков.
    """
    minWeight = 1
    maxWeight = 20
    matrix = [[0] * n for i in range(n)]
    for i in range(n):
        for j in range(n):
            if i == j:
                matrix[i][j] = 0
            else:
                weight = random.randint(minWeight, maxWeight)
                matrix[i][j] = weight
                if symmetric:
                    matrix[j][i] = weight
    return matrix


def saveMatrixToFile(matrix, filename):
    """
    Сохраняет матрицу весов в файл в формате JSON.
    """
    with open(filename, "w") as f:
        json.dump(matrix, f)
    print(f"Матрица весов сохранена в файл {filename}")


def loadMatrixFromFile(filename):
    """
    Загружает матрицу весов из файла в формате JSON.
    Возвращает матрицу в виде списка списков.
    """
    with open(filename, "r") as f:
        matrix = json.load(f)
    return matrix


# Функции визуализации
def printMatrix(matrix):
    """
    Выводит матрицу весов в удобном для чтения формате.
    """
    for row in matrix:
        print(" ".join(str(x) for x in row))


def test(matrix):
    arr = []
    arrAMR = []
    for start in range(len(matrix)):
        solver = tspSolver(matrix)
        arr.append(solver.solve(start))

        solver2 = tspAMR(graph)
        arrAMR.append(solver2.amrModification(start))

    for i in range(len(arr)): print(f"{i}: {arr[i]}")
    print("AMR")
    for i in range(len(arrAMR)): print(f"{i}: {arrAMR[i]}")


# Основной блок программы
if __name__ == "__main__":
    print("Выберите режим работы:")
    print("1 - Ввести матрицу весов вручную")
    print("2 - Сгенерировать матрицу весов автоматически")
    print("3 - Использовать матрицу из файла weightMatrix.json")
    mode = input("Ваш выбор (1-3): ")

    if mode.strip() == "1":
        n = int(input("Введите число вершин: "))
        print("Введите матрицу весов (по одной строке, элементы через пробел):")
        graph = []
        for i in range(n):
            row = [int(x) for x in input().split()]
            graph.append(row)

    elif mode.strip() == "2":
        n = int(input("Введите число вершин: "))
        symmetricInput = input("Генерировать симметричную матрицу? (y/n): ").strip().lower()
        symmetric = symmetricInput == "y"
        graph = generateWeightMatrix(n, symmetric)
        print("\nСгенерированная матрица весов:")
        printMatrix(graph)
        saveChoice = input("Сохранить матрицу в файл? (y/n): ").strip().lower()
        if saveChoice == "y":
            saveMatrixToFile(graph, "weightMatrix.json")

    elif mode.strip() == "3":
        graph = loadMatrixFromFile("weightMatrix.json")
        print("\nЗагруженная матрица весов:")
        printMatrix(graph)

    else:
        print("Неверный выбор. Завершение программы.")
        exit(1)

    # test(graph)

    start = int(input("Введите стартовую вершину: "))
    # Решение задачи TSP
    print("\n\n>>>Начало решения задачи коммивояжера<<<")
    t = time.time()
    solver = tspSolver(graph)
    bestPath, bestCost = solver.solve(start)

    # После нахождения первого решения переходим к фазе модификации (АМР)
    print("\n\n>>>Начало фазы модификации (АМР)<<<")
    t1 = time.time()
    solver2 = tspAMR(graph)
    bestPathAmr, bestCostAmr = solver2.amrModification(start)

    print("\nЛучшее найденное решение:", *bestPath)
    print("Вес решения:", bestCost)
    print("\nЛучшее найденное решение для АМР:", *bestPathAmr)
    print("Вес решения для АМР:", bestCostAmr)

    print(f"Время работы МВиГ, АМР: {time.time() - t}, {time.time() - t1}")
