from modules.mergesort import mergesort
from modules.minRunLength import minRunLength
from modules.SplitArray import SplitArray
from modules.PrintSudarrays import PrintSubarrays


def TimSort(lengthArray, array):
    splitArrays = SplitArray(array, minRunLength(lengthArray))
    PrintSubarrays(splitArrays)

    stack = []
    gallopsI = []
    mergeI = []

    for element in splitArrays:
        stack.append(element)

        while len(stack) >= 3:
            x = len(stack[-1])
            y = len(stack[-2])
            z = len(stack[-3])
            if z <= x + y and y <= x:
                if x >= z:
                    stack[-2], m = mergesort(stack[-2], stack[-3])
                    mergeI.append(stack[-2])
                    stack.pop(-3)
                    gallopsI.append(m)
                else:
                    stack[-2], m = mergesort(stack[-2], stack[-1])
                    mergeI.append(stack[-2])
                    stack.pop()
                    gallopsI.append(m)
            else:
                break

        while len(stack) == 2:
            x = len(stack[-1])
            y = len(stack[-2])
            if y <= x:
                stack[-2], m = mergesort(stack[-2], stack[-1])
                gallopsI.append(m)
                mergeI.append(stack[-2])
                stack.pop()
            else:
                break

    while len(stack) > 1:
        if len(stack) == 2:
            stack[-2], m = mergesort(stack[-2], stack[-1])
            gallopsI.append(m)
            mergeI.append(stack[-2])
            stack.pop()
        elif len(stack) >= 3:
            x = len(stack[-1])
            z = len(stack[-3])
            if x >= z:
                stack[-2], m = mergesort(stack[-2], stack[-3])
                mergeI.append(stack[-2])
                stack.pop(-3)
                gallopsI.append(m)
            else:
                stack[-2], m = mergesort(stack[-2], stack[-1])
                mergeI.append(stack[-2])
                stack.pop()
                gallopsI.append(m)

    if len(gallopsI) == 0:
        print()
    for i in range(len(gallopsI)):
        print(f"Gallops {i}: {gallopsI[i]}")
        print(f"Merge {i}: {' '.join([str(x) for x in mergeI[i]])}")
    print(f"Answer: {' '.join([str(x) for x in stack[0]])}")
    return stack[0]
