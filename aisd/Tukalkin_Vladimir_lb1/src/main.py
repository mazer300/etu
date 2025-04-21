from modules.ULL import UnrolledLinkedList


def check(arr_1, arr_2):
    unroll_list = UnrolledLinkedList(arr_1)
    print(unroll_list)
    print('-' * 20)
    for i in arr_2:
        unroll_list.remove(i)
        print(unroll_list)
        print('-' * 20)
    unroll_list.balanced()
    print(unroll_list)


check([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [1, 6, 4, 9])

print(UnrolledLinkedList(input('Enter your numbers separated by a space:').split()))