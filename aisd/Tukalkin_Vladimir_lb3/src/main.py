from modules.insert import insert
from modules.visualizeTree import visualizeTree
from modules.deleteNode import deleteNode

from time import time
from random import randrange
l=8000
root=None
for val in range(l):
    root = insert(val, root)
start=time()
deleteNode(1023,root)
visualizeTree(root)
print('{0:.24f}'.format(time()-start))

'''if __name__ == '__main__':
    root = None
    # values=[10, 20, 30, 40, 50,25]
    # values = [10, 20, 30]
    values = [10, 20, 30, 25, 40, 50, 100, 60]
    for val in values:
        root = insert(val, root)
    # root = insert(40, root)
    #visualizeTree(root)

    #deleteNode(30, root)
    # deleteMaxNode(root)

    visualizeTree(root)'''