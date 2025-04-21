def minRunLength(n):
    flag = 0
    while n >= 16:
        flag |= n & 1
        n >>= 1
    return n + flag
