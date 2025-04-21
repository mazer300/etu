def InsertionSort(array):
    for i in range(1, len(array)):
        tmp = array[i]
        j = i - 1
        while j >= 0 and abs(array[j]) < abs(tmp):
            array[j + 1] = array[j]
            j -= 1
        array[j + 1] = tmp
