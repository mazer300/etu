from modules.InsertionSort import InsertionSort


def SplitArray(array, minrun):
    arrays = []
    run = []
    number_of_arrays = 0
    fupp = 0
    fdown = 0
    size_of_array = 0
    added_elements = 0
    while added_elements < len(array):
        x = array[added_elements]
        if len(run) > 0:
            if (abs(x) > abs(run[-1]) and fupp == 0) or (abs(x) <= abs(run[-1]) and fdown == 0):
                if abs(x) > abs(run[-1]):
                    fdown = 1
                if abs(x) <= abs(run[-1]):
                    fupp = 1
                run.append(x)
                size_of_array += 1
            else:
                if size_of_array < minrun:
                    run.append(x)
                    size_of_array += 1
                    fupp = 1
                    fdown = 1
                else:
                    InsertionSort(run)
                    arrays.append(run)
                    run = []
                    run.append(x)
                    number_of_arrays += 1
                    size_of_array = 1
                    fdown = 0
                    fupp = 0
        else:
            run.append(x)
            size_of_array += 1
        added_elements += 1
    InsertionSort(run)
    arrays.append(run)
    return arrays
