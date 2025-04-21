from modules.Node import Node
from modules.calculating import calculate_optimal_node_size


class UnrolledLinkedList:
    def __init__(self, values=[]):
        self.head = None
        if values:
            length = calculate_optimal_node_size(len(values))
            self.head = Node(values[:length])
            current = self.head
            for i in range(1, (len(values) + length - 1) // length):
                current.next = Node(values[i * length:(i + 1) * length])
                current = current.next

    def __str__(self):
        if not self.head:
            return 'empty list'
        output = ''
        for num, item in enumerate(self):
            nodes = ' '.join(str(x) for x in item)
            output += f'Node {num}: {nodes}\n'
        return output

    def __iter__(self):
        current = self.head
        while current:
            yield current.val
            current = current.next

    def find(self, val):
        if isinstance(val, list):
            message = ''
            for i in val:
                flag = 0
                for j in self:
                    if i in j:
                        flag = 1
                if flag == 1:
                    message += f'{i} in list\n'
                else:
                    message += f'{i} not in list\n'
            return message
        if isinstance(val, int):
            for i in self:
                if val in i:
                    return True
        return False

    def balanced(self):
        newList = []
        while self.head:
            newList.extend(self.head.val)
            self.head = self.head.next
        new = UnrolledLinkedList(newList)
        self.head = new.head

    def pushback(self, val):
        if isinstance(val, int):
            val = [val]
        newNode = Node([int(x) for x in val])
        current = self.head
        while current.next:
            current = current.next
        newNode.next = current.next
        current.next = newNode

    def insert(self, val, index):
        counter = 0
        current = self.head
        while current:
            counter += len(current.val)
            if counter >= index:
                current.val.insert(index, val)
                return
            current = current.next

    def pushstart(self, val):
        if isinstance(val, int):
            val = [val]
        newNode = Node(val)
        newNode.next = self.head
        self.head = newNode

    def remove(self, val):
        if isinstance(val, int):
            for i in self:
                if val in i:
                    i.pop(i.index(val))
                    return self
            return f'{val} not in list'
        if isinstance(val, list):
            for i in val:
                for j in self:
                    if i in j:
                        j.pop(j.index(i))
                        if len(j) == 0:
                            self.head = self.head.next
            return self