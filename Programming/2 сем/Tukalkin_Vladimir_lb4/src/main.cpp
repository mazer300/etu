class CustomStack {
public:
    //конструкторы
    CustomStack() {
        mHead = new ListNode;
        mHead->mNext = nullptr;
    }
    //деструктор
    ~CustomStack() {
        delete mHead;
    }

    // методы push, pop, size, empty, top
    void push(int val){
        ListNode* mNext = new ListNode;
        mNext->mData = val;
        mNext->mNext = mHead;
        mHead = mNext;
        size_stack++;
    }
        
    void pop(){
        ListNode* newHead = mHead->mNext;
        delete mHead;
        mHead = newHead;
        --size_stack;
    }

    int top(){
        return mHead->mData;
    }

    size_t size(){
        return size_stack;
    }

    bool empty(){
        return size_stack==0;
    }

private:
    int size_stack=0;

protected:  // в этом блоке должен быть указатель на голову
    ListNode* mHead;
};

int main() {
    CustomStack stack = CustomStack();
    string command;
    while (cin >> command) {
        if (command == "cmd_push") {
            int val;
            cin >> val;
            stack.push(val);
            cout << "ok" << endl;

        } else if (command == "cmd_pop") {
            if (stack.empty()) {
                cout << "error";
                break;
            } else {
                cout << stack.top() << endl;
                stack.pop();
            }
        } else if (command == "cmd_top") {
            if (stack.empty()) {
                cout << "error";
                break;
            } else {
                cout << stack.top() << endl;
            }
        } else if (command == "cmd_size") {
            cout << stack.size() << endl;
        } else if (command == "cmd_exit") {
            cout << "bye";
            break;
        }
    }
    
    return 0;
}