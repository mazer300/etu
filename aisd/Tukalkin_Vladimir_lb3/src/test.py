from modules.getBalance import getBalance
from modules.height import height
from modules.insert import insert
from modules.diff import diff
from modules.deleteNode import deleteNode
from modules.maxValueNode import maxValueNode
from modules.minValueNode import minValueNode


def generate(values):
    root = None
    for val in values:
        root = insert(val, root)
    return root


def test_diff():
    root = generate([10, 21, 30])
    assert diff(root) == 9


def test_insert():
    root = generate([10, 20, 30])
    assert insert(40, root).right.right.val == 40


def test_getBalance():
    root = generate([10, 20, 30, 40])
    assert getBalance(root) == -1


def test_height():
    root = generate([10, 20, 30, 40])
    assert height(root) == 3


def test_deleteNode():
    root = generate([10, 20, 30])
    assert deleteNode(20, root).val == 30


def test_minValueNode():
    root = generate([10, 20, 30])
    assert minValueNode(root).val == 10


def test_maxValueNode():
    root = generate([10, 20, 30])
    assert maxValueNode(root).val == 30


test_diff()
test_insert()
test_getBalance()
test_height()
test_deleteNode()
test_minValueNode()
test_maxValueNode()
