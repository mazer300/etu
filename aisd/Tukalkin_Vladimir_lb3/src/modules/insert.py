from modules.Node import Node
from modules.getBalance import getBalance
from modules.height import height
from modules.rightRotate import rightRotate
from modules.leftRotate import leftRotate


def insert(val, node):
    if node is None:
        return Node(val)

    if val < node.val:
        node.left = insert(val, node.left)
    else:
        node.right = insert(val, node.right)

    node.height = 1 + max(height(node.left), height(node.right))

    balance = getBalance(node)

    # малый правый поворот
    if balance > 1 and val < node.left.val:
        return rightRotate(node)

    # малый левый поворот
    if balance < -1 and val > node.right.val:
        return leftRotate(node)

    # левый большой поворот
    if balance > 1 and val > node.left.val:
        node.left = leftRotate(node.left)
        return rightRotate(node)

    # правый большой поворот
    if balance < -1 and val < node.right.val:
        node.right = rightRotate(node.right)
        return leftRotate(node)

    return node
