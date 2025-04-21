from collections import deque

class TrieNode:
    """Класс узла бора"""
    def __init__(self):
        self.isTerminal = False     # флаг, является ли вершина терминалом
        self.patternIndices = []    # номера шаблонов, заканчивающихся в этом узле
        self.patternLength = 0      # длина шаблона (для определения позиции)

        self.childrens = {}         # указатели на дочернии узлы
        self.suffixLink = None      # суффиксная ссылка
        self.finalLink = None       # конечная ссылка


class AhoCorasicAlgorithm:
    """Класс, реализующий алгоритм Ахо-Корасика"""
    def __init__(self, patterns: list):
        """Инициализирует алгоритм, создает автомат"""
        
        self.root = TrieNode()          
        self.root.suffixLink = self.root
        self.nodeCount = 1

        # строим бор
        for index in range(len(patterns)):
            self.__add(patterns[index], index)

        # создаем ссылки, строим автомат
        self.__makeLinks()


    def __add(self, pattern: str, index: int):
        """Добавляет новый шаблон в бор"""
        currentNode = self.root
        for char in pattern:
            if char not in currentNode.childrens:
                newNode = TrieNode()
                currentNode.childrens[char] = newNode
                self.nodeCount += 1
            currentNode = currentNode.childrens[char]
        
        currentNode.isTerminal = True
        currentNode.patternIndices.append(index)
        currentNode.patternLength = len(pattern)

    def __makeLinks(self):
        """Создает суффиксные и конечные ссылки"""
        queue = deque()
        queue.append(self.root)    

        while queue:
            currentNode = queue.popleft()
            
            for char, childNode in currentNode.childrens.items():
                queue.append(childNode)
                
                if currentNode == self.root:
                    childNode.suffixLink = self.root
                else:
                    temp = currentNode.suffixLink
                    while (temp != self.root) and (char not in temp.childrens):
                        temp = temp.suffixLink
                    
                    childNode.suffixLink = temp.childrens.get(char, self.root)
                
                # построение конечной ссылки
                if childNode.suffixLink.isTerminal:
                    childNode.finalLink = childNode.suffixLink
                else:
                    childNode.finalLink = childNode.suffixLink.finalLink

    def search(self, text):
        """Ищет все вхождения шаблонов в тексте"""
        results = []
        currentNode = self.root
        
        for position in range(len(text)):
            char = text[position]
            
            while (currentNode != self.root) and (char not in currentNode.childrens):
                currentNode = currentNode.suffixLink
            
            if char in currentNode.childrens:
                currentNode = currentNode.childrens[char]
            
            if currentNode.isTerminal:
                for patternIndex in currentNode.patternIndices:
                    startPosition = position - currentNode.patternLength + 2
                    results.append((startPosition, patternIndex + 1))
            
            temp = currentNode.finalLink
            
            while temp:
                for patternIndex in temp.patternIndices:
                    startPosition = position - temp.patternLength + 2
                    results.append((startPosition, patternIndex + 1))
                temp = temp.finalLink
        
        results.sort()
        return results
    
    def getNodeCount(self):
        """Позволяет получить число узлов в автомате"""
        return self.nodeCount


def main():
    text = input()
    num = int(input())
    patterns = [input() for _ in range(num)]
    
    ahoCorasicAlgorithm = AhoCorasicAlgorithm(patterns)     # инициализация алгоритма (создание автомата)
    results = ahoCorasicAlgorithm.search(text)              # поиск вхождений
    
    # вывод результатов
    for startPosition, patternIndex in results:
        print(startPosition, patternIndex)


if __name__ == "__main__":
    main()