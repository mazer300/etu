from modules.height import height


def getBalance(node):
    if node is None:
        return 0
    return height(node.left) - height(node.right)
