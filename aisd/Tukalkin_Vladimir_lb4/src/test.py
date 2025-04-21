from modules.Rabin_Karp import Rabin_Karp
from modules.calculatingArea import calculatingArea
from modules.Graham import Graham


def test_Rabin_Karp():
    assert Rabin_Karp('ada', 'adacdada') == ['0', '5']


def test_calculatingArea():
    assert calculatingArea([[3, 1], [6, 8], [1, 7], [9, 3], [9, 6], [9, 0]]) == 13.0


def test_Graham():
    assert Graham([[3, 1], [6, 8], [1, 7], [9, 3], [9, 6], [9, 0]]) == [[1, 7], [3, 1], [9, 0], [9, 3], [9, 6], [6, 8]]


test_Rabin_Karp()
test_calculatingArea()
test_Graham()
