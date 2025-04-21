from modules.BinarySearch import BinarySearch


def mergesort(leftArray, rightArray):
    counterGallop = 0
    mergedArray = []
    leftArrayIndex = 0
    rightArrayIndex = 0
    leftArrayCount = 0
    rightArrayCount = 0
    while leftArrayIndex < len(leftArray) and rightArrayIndex < len(rightArray):
        if abs(leftArray[leftArrayIndex]) >= abs(rightArray[rightArrayIndex]):
            mergedArray.append(leftArray[leftArrayIndex])
            leftArrayIndex += 1
            leftArrayCount += 1
            rightArrayCount = 0
        else:
            mergedArray.append(rightArray[rightArrayIndex])
            rightArrayIndex += 1
            rightArrayCount += 1
            leftArrayCount = 0

        if leftArrayCount == 3:
            counterGallop += 1
            index = BinarySearch(rightArray[rightArrayIndex], leftArray, leftArrayIndex - 1, len(leftArray))
            for i in range(leftArrayIndex, index):
                mergedArray.append(leftArray[i])
                leftArrayIndex += 1
            leftArrayCount = 0
            rightArrayCount = 0
        elif rightArrayCount == 3:
            counterGallop += 1
            index = BinarySearch(leftArray[leftArrayIndex], rightArray, rightArrayIndex - 1, len(rightArray))
            for i in range(rightArrayIndex, index):
                mergedArray.append(rightArray[i])
                rightArrayIndex += 1
            rightArrayCount = 0
            leftArrayCount = 0

    mergedArray.extend(leftArray[leftArrayIndex:])
    mergedArray.extend(rightArray[rightArrayIndex:])

    return mergedArray, counterGallop
