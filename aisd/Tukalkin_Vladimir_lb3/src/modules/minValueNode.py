def minValueNode(node):
    current = node
    while current.left is not None:
        current = current.left
    return current
