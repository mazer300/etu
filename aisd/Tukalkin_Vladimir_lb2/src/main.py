from modules.TimSort import TimSort


'''from time import time
from random import randrange
l=100000
#arr=[int(x) for x in range(a,0,-1)]
#arr=[randrange(0, 1000, 1) for i in range(l)]
arr=[int(x) for x in range(l)]
start=time()
TimSort(l,arr)
print('{0:.6f}'.format(time()-start))'''

if __name__ == "__main__":
    length = int(input())
    inputArray = [int(x) for x in input().split()]
    TimSort(length, inputArray)