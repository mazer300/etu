def Graham(array):
    def rotate(A, B, C): return (B[0] - A[0]) * (C[1] - B[1]) - (B[1] - A[1]) * (C[0] - B[0])

    n = len(array)  # число точек
    P = list(range(n))
    for i in range(1, n):
        if array[P[i]][0] < array[P[0]][0]:  # если P[i]-ая точка лежит левее P[0]-ой точки
            P[i], P[0] = P[0], P[i]  # меняем местами номера этих точек
    for i in range(2, n):  # сортировка вставкой
        j = i
        while j > 1 and (rotate(array[P[0]], array[P[j - 1]], array[P[j]]) < 0):
            P[j], P[j - 1] = P[j - 1], P[j]
            j -= 1
    S = [P[0], P[1]]  # создаем стек
    for i in range(2, n):
        while rotate(array[S[-2]], array[S[-1]], array[P[i]]) < 0:
            del S[-1]  # pop(S)
        S.append(P[i])  # push(S,P[i])

    arr=[]
    for i in range(len(S)):
        arr.append(array[S[i]])
    return arr
