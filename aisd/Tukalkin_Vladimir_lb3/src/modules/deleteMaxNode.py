from modules.maxValueNode import maxValueNode
from modules.deleteNode import deleteNode


def deleteMaxNode(node):
    if not node:
        return node

    max_node = maxValueNode(node)
    return deleteNode(max_node.val, node)
