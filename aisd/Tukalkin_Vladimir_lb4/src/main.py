from modules.Rabin_Karp import Rabin_Karp
from modules.calculatingArea import calculatingArea
from modules.Graham import Graham
from modules.visualization import visualization


if __name__ == "__main__":
    option = int(input())
    if option:
        pattern, text = input(), input()
        print(*Rabin_Karp(pattern, text))
    else:
        arr = [[int(x) for x in input().split(', ')] for i in range(int(input()))]
        answerArray = Graham(arr)
        area = calculatingArea(answerArray)
        print(answerArray, area)
        visualization(arr, answerArray)

'''
0
6
3, 1
6, 8
1, 7
9, 3
9, 6
9, 0
'''
