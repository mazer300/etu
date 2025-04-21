def prefix(s):
    length=len(s)
    pi = [0] * length
    for i in range(1, length):
        k = pi[i - 1]
        while k > 0 and s[k] != s[i]:
            k = pi[k - 1]
        if s[k] == s[i]:
            k += 1
        pi[i] = k
    return pi


def KMP(pattern, text):
    lengthPattern = len(pattern)
    prefixTable = prefix(pattern)
    j = 0  # индекс для pattern

    for i in range(len(text)):
        while j > 0 and text[i] != pattern[j]:
            j = prefixTable[j - 1]
        if text[i] == pattern[j]:
            j += 1
        if j == lengthPattern:
            return i - lengthPattern + 1
    return -1


def cyclicShift(A, B):
    if len(A) != len(B):
        return -1

    index = KMP(B, A+A)
    return index


if __name__ == "__main__":
    A = input().strip()
    B = input().strip()
    print(cyclicShift(A, B))