def prefix(s):
    pi = [0] * len(s)
    for i in range(1, len(s)):
        k = pi[i - 1]
        while k > 0 and s[k] != s[i]:
            k = pi[k - 1]
        if s[k] == s[i]:
            k += 1
        pi[i] = k
    return pi


def KMP(pattern, text):
    arr = []
    prefixTable = prefix(pattern)
    j = 0  # индекс для pattern
    for i in range(len(text)):
        while j > 0 and text[i] != pattern[j]:
            j = prefixTable[j - 1]
        if text[i] == pattern[j]:
            j += 1
        if j == len(pattern):
            arr.append(i - len(pattern) + 1)
            j = prefixTable[j - 1]

    return arr


if __name__ == "__main__":
    P = input().strip()
    T = input().strip()
    if len(P) > len(T) or not P:
        print(-1)
    else:
        arr = KMP(P, T)
        print(','.join([str(x) for x in arr]) if len(arr) != 0 else -1)
