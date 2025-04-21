class Square:
    def __init__(self,N):
        self.N=N
        self.result=[]
        self.board = [[False] * N for i in range(N)]
        self.minCount = float("inf")
        self.squares = []

    def isPrime(self, num):
        for i in range(3, int(num ** 0.5) + 1, 2):
            if num % i == 0:
                return False
        return True

    def findFirstPrimeDivisor(self,num):
        for i in [3, 5, 7, 11, 13, 17, 19, 23]:
            if num%i==0:
                return i
        return num

    def placeSquare(self,x,y,size):
        for i in range(x, x + size):
            for j in range(y, y + size):
                self.board[i][j]=True

    def removeSquare(self, x, y, size):
        for i in range(x, x + size):
            for j in range(y, y + size):
                self.board[i][j] = False

    def canPlace(self,x,y,size):
        if x+size>self.N or y+size>self.N:
            return False
        for i in range(x,x+size):
            if self.board[i][y]!=False:
                return False
        for j in range(y,y+size):
            if self.board[x][j]!=False:
                return False

        return True

    def backtrack(self,count):
        if count>=self.minCount: return

        x,y=-1,-1
        for i in range(self.N):
            for j in range(self.N):
                if not self.board[i][j]:
                    x,y=i,j
                    break
            if x!=-1:
                break

        if x==-1:
            if count < self.minCount:
                self.minCount=count
                self.result=self.squares.copy()
            return

        for size in range(min(self.N-x,self.N-y),0,-1):
            if self.canPlace(x,y,size):
                self.placeSquare(x,y,size)
                self.squares.append(f'{x+1} {y+1} {size}')   #+1 для индексации с 1
                self.backtrack(count+1)
                self.squares.pop()
                self.removeSquare(x,y,size)

    def solve(self):
        if self.N<2:
            return ['0']

        if self.N%2==0:
            half = self.N // 2
            self.minCount=4
            self.result.append("1 1 "+str(half))
            self.result.append(f"{1+half} 1 {half}")
            self.result.append(f"1 {1+half} {half}")
            self.result.append(f"{1+half} {1+half} {half}")

        else:
            if self.isPrime(self.N):
                half=self.N//2

                self.placeSquare(0,0,half+1)
                self.squares.append(f"1 1 {half + 1}")

                self.placeSquare(0,half+1,half)
                self.squares.append(f"1 {half+2} {half}")

                self.placeSquare(half + 1,0, half)
                self.squares.append(f"{half + 2} 1 {half}")

                self.backtrack(3)

            else:
                divisor=self.findFirstPrimeDivisor(self.N)
                newSize=self.N//divisor

                self.placeSquare(0, 0, newSize*2)
                self.squares.append(f"1 1 {newSize*2}")

                self.placeSquare(0, newSize*2, newSize)
                self.squares.append(f"1 {newSize*2+1} {newSize}")

                self.placeSquare(newSize*2, 0, newSize)
                self.squares.append(f"{newSize*2+1} 1 {newSize}")


                self.backtrack(3)


        return [str(len(self.result))]+self.result


'''
if __name__=="__main__":
    width=int(input())
    s=Square(width)
    result=s.solve()
    for i in result:
        print(i)
'''



import time
import matplotlib.pyplot as plt
if __name__ == "__main__":
    sizes = []
    times = []
    arrTimes = []
    #for width in range(1, 40):
    for width in [3,5,7,11,13,17,19,23,29,31,37]:
        start = time.time()
        s = Square(width)
        result = s.solve()
        elapsed_time = time.time() - start

        sizes.append(width)
        times.append(elapsed_time)

        print(f"{width}: {elapsed_time:.6f} секунд")

    print()
    for i in arrTimes:
        print(i)
    # Построение графика
    plt.plot(sizes, times, marker='o')
    plt.title('Время выполнения от размера квадрата')
    plt.xlabel('Размер квадрата')
    plt.ylabel('Время выполнения (секунды)')
    plt.grid(True)
    plt.show()