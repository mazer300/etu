def BinarySearch(element, array, left, right):
    while left < right:
        mid = (left + right) // 2
        if abs(array[mid]) >= abs(element):
            left = mid + 1
        else:
            right = mid
    return left
