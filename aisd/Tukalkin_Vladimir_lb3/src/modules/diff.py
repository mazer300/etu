def diff(root):
    min_diff = float('inf')

    def dfs(node):
        if not node:
            return
        nonlocal min_diff

        if node.left:
            min_diff = min(min_diff, abs(node.val - node.left.val))
            dfs(node.left)

        if node.right:
            min_diff = min(min_diff, abs(node.val - node.right.val))
            dfs(node.right)

    dfs(root)
    return min_diff
