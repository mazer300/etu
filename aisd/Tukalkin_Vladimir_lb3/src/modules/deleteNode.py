from modules.rightRotate import rightRotate
from modules.leftRotate import leftRotate
from modules.getBalance import getBalance
from modules.height import height
from modules.minValueNode import minValueNode


def deleteNode(val, node):
    if not node:
        return node

    if val < node.val:
        node.left = deleteNode(val, node.left)
    elif val > node.val:
        node.right = deleteNode(val, node.right)
    else:
        if node.left is None:
            tmp = node.right
            node = None
            return tmp
        elif node.right is None:
            tmp = node.left
            node = None
            return tmp

        tmp = minValueNode(node.right)
        node.val = tmp.val
        node.right = deleteNode(tmp.val, node.right)

    # балансировка
    if node is None:
        return node

    node.height = 1 + max(height(node.left), height(node.right))

    balance = getBalance(node)

    # малый правый поворот
    if balance > 1 and getBalance(node.left) >= 0:
        return rightRotate(node)

    # малый левый поворот
    if balance < -1 and getBalance(node.right) <= 0:
        return leftRotate(node)

    # левый большой поворот
    if balance > 1 and getBalance(node.left) < 0:
        node.left = leftRotate(node.left)
        return rightRotate(node)

    # правый большой поворот
    if balance < -1 and getBalance(node.right) > 0:
        node.right = rightRotate(node.right)
        return leftRotate(node)

    return node
