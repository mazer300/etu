from modules.minRunLength import minRunLength
from modules.BinarySearch import BinarySearch
from modules.SplitArray import SplitArray
from modules.mergesort import mergesort
from modules.InsertionSort import InsertionSort
from modules.TimSort import TimSort

def test_minRunLength():
    assert minRunLength(64) == 8


def test_BinarySearch():
    assert BinarySearch(7, [2, 7, 4, -1, 46, 0, -8, 4, 8, 45, 324, 9], 0, 12) == 12


def test_SplitArray():
    assert SplitArray([-1, 2, 3, 4, 5, -6, 7, 8, -8, -8, 7, -7, 7, 6, -5, 4], 8) == [[8, 7, -6, 5, 4, 3, 2, -1], [-8, -8, 7, -7, 7, 6, -5, 4]]


def test_mergesort():
    assert mergesort([8, 7, -6, 5, 4, 3, 2, -1], [-8, -8, 7, -7, 7, 6, -5, 4]) == ([8, -8, -8, 7, 7, -7, 7, 6, -6, 5, -5, 4, 4, 3, 2, -1], 1)


def test_InsertionSort():
    arr = [-1, 2, 3, 4, 5, -6, 7, 8, -8, -8, 7, -7, 7, 6, -5, 4]
    InsertionSort(arr)
    assert arr == [8, -8, -8, 7, 7, -7, 7, -6, 6, 5, -5, 4, 4, 3, 2, -1]


def test_TimSort():
    assert TimSort(16, [-1, 2, 3, 4, 5, -6, 7, 8, -8, -8, 7, -7, 7, 6, -5, 4]) == [8, -8, -8, 7, 7, -7, 7, 6, -6, 5, -5, 4, 4, 3, 2, -1]


test_minRunLength()
test_BinarySearch()
test_SplitArray()
test_mergesort()
test_InsertionSort()
test_TimSort()