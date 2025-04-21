class Node:
    def __init__(self, data, next=None):
        self.data=data
        self.next=next

    def get_data(self):
        return self.data

    def __str__(self):
        return f"data: {self.data}, next: {None if self.next==None else self.next.get_data()}"


class LinkedList:
    def __init__(self, head=None):
        self.head=head
        self.length=0
        if head!=None:
            self.length=1

    def __len__(self):
        return self.length

    def append(self, element):
        tmp=Node(element)
        if self.length==0:
            self.head=tmp
            self.length=1
            return self.head
        NextEl=self.head
        while NextEl.next!=None: NextEl=NextEl.next
        NextEl.next=tmp
        self.length+=1

    def __str__(self):
        if self.length==0:
            return "LinkedList[]"
        arr=[]
        NextEl=self.head
        arr.append(f"data: {NextEl.data}, next: {None if NextEl.next==None else NextEl.next.get_data()}")
        while NextEl.next!=None:
            NextEl=NextEl.next
            arr.append(f"data: {NextEl.get_data()}, next: {None if NextEl.next==None else NextEl.next.get_data()}")
        return f"LinkedList[length = {self.length}, [{'; '.join(arr)}]]"

    def pop(self):
        if self.head==None: raise IndexError("LinkedList is empty!")
        else:
            NextEl = self.head
            prev = NextEl
            while NextEl.next!=None:
                prev=NextEl
                NextEl=NextEl.next
            prev.next=None
        self.length-=1

    def delete_on_start(self, n):
        if n>self.length or n<=0:
            raise KeyError("Element doesn't exist!")
        NextEl=self.head
        count=1
        prev=NextEl
        while count!=n:
            prev=NextEl
            NextEl=NextEl.next
            count+=1
        if n==1 and self.head.next!=None:
            self.head=self.head.next
        prev.next=NextEl.next
        self.length-=1

    def clear(self):
        self.head=None
        self.length=0