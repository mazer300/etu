from modules.height import height


def rightRotate(y):
    x = y.left
    tmp = x.right

    x.right = y
    y.left = tmp

    y.height = 1 + max(height(y.left), height(y.right))
    x.height = 1 + max(height(x.left), height(x.right))
    return x
