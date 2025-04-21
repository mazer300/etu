from modules.minValueNode import minValueNode
from modules.deleteNode import deleteNode


def deleteMinNode(node):
    if node is None:
        return node

    min_node = minValueNode(node)
    return deleteNode(min_node.val, node)
