from modules.Node import Node
from modules.calculating import calculate_optimal_node_size
from modules.ULL import UnrolledLinkedList


def create_list():
    return UnrolledLinkedList([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])


def test_calculate_optimal_node_size():
    # Проверка расчёта длины узла
    assert calculate_optimal_node_size(10) == 2


def test_Node():
    # Проверка создания узла
    a = Node(1)
    a.next = Node(2)
    assert a.next.val == 2


def test_initialization_1():
    # Проверка пустого списка
    empty_list = UnrolledLinkedList()
    assert str(empty_list) == "empty list"


def test_initialization_2():
    # Проверка создания списка с значениями
    unrolled_list = create_list()
    expected_output = 'Node 0: 1 2\nNode 1: 3 4\nNode 2: 5 6\nNode 3: 7 8\nNode 4: 9 10\n'
    assert str(unrolled_list) == expected_output


def test_iteration():
    unrolled_list = create_list()
    actual_result = [item for item in unrolled_list]
    expected_result = [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10]]
    assert actual_result == expected_result


def test_find_1():
    unrolled_list = create_list()

    # Поиск одного числа
    result = unrolled_list.find(5)
    assert result == True


def test_find_2():
    unrolled_list = create_list()

    # Поиск списка чисел
    result = unrolled_list.find([5, 7])
    assert result == '5 in list\n7 in list\n'


def test_find_3():
    unrolled_list = create_list()

    # Поиск отсутствующего числа
    result = unrolled_list.find(11)
    assert result == False


def test_balanced():
    unrolled_list = create_list()
    unrolled_list.pushback([11, 12, 13])
    unrolled_list.balanced()
    expected_output = "Node 0: 1 2\nNode 1: 3 4\nNode 2: 5 6\nNode 3: 7 8\nNode 4: 9 10\nNode 5: 11 12\nNode 6: 13\n"
    assert str(unrolled_list) == expected_output


def test_pushback_1():
    unrolled_list = create_list()

    # Добавление списка чисел
    unrolled_list.pushback([11, 12])
    expected_output = "Node 0: 1 2\nNode 1: 3 4\nNode 2: 5 6\nNode 3: 7 8\nNode 4: 9 10\nNode 5: 11 12\n"
    assert unrolled_list.__str__() == expected_output


def test_pushback_2():
    unrolled_list = create_list()

    # Добавление числа
    unrolled_list.pushback(11)
    expected_output = "Node 0: 1 2\nNode 1: 3 4\nNode 2: 5 6\nNode 3: 7 8\nNode 4: 9 10\nNode 5: 11\n"
    assert str(unrolled_list) == expected_output


def test_insert():
    unrolled_list = create_list()
    unrolled_list.insert(100, 5)
    unrolled_list.balanced()
    expected_output = "Node 0: 1 2\nNode 1: 3 4\nNode 2: 5 6\nNode 3: 100 7\nNode 4: 8 9\nNode 5: 10\n"
    assert str(unrolled_list) == expected_output


def test_pushstart_1():
    # Проверка вставки числа
    unrolled_list = create_list()
    unrolled_list.pushstart(10)
    expected_output = "Node 0: 10\nNode 1: 1 2\nNode 2: 3 4\nNode 3: 5 6\nNode 4: 7 8\nNode 5: 9 10\n"
    assert str(unrolled_list) == expected_output


def test_pushstart_2():
    # Проверка вставки списка чисел
    unrolled_list = create_list()
    unrolled_list.pushstart([10, 11])
    expected_output = "Node 0: 10 11\nNode 1: 1 2\nNode 2: 3 4\nNode 3: 5 6\nNode 4: 7 8\nNode 5: 9 10\n"
    assert str(unrolled_list) == expected_output


def test_remove_1():
    # Проверка удаления числа, не входящего в список
    unrolled_list = create_list()
    assert unrolled_list.remove(-1) == "-1 not in list"


def test_remove_2():
    # Проверка удаления числа
    unrolled_list = create_list()
    unrolled_list.remove(2)
    expected_output = "Node 0: 1\nNode 1: 3 4\nNode 2: 5 6\nNode 3: 7 8\nNode 4: 9 10\n"
    assert str(unrolled_list) == expected_output


def test_remove_3():
    # Проверка удаления списка чисел
    unrolled_list = create_list()
    unrolled_list.remove([1, 2])
    expected_output = "Node 0: 3 4\nNode 1: 5 6\nNode 2: 7 8\nNode 3: 9 10\n"
    assert str(unrolled_list) == expected_output


test_initialization_1()
test_initialization_2()
test_iteration()
test_find_1()
test_find_2()
test_find_3()
test_balanced()
test_pushback_1()
test_pushback_2()
test_insert()
test_pushstart_1()
test_pushstart_2()
test_remove_1()
test_remove_2()
test_remove_3()
