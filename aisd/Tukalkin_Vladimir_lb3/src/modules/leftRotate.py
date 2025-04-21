from modules.height import height


def leftRotate(x):
    y = x.right
    tmp = y.left

    y.left = x
    x.right = tmp

    x.height = 1 + max(height(x.left), height(x.right))
    y.height = 1 + max(height(y.left), height(y.right))
    return y
