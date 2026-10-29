def encode(message,alphabet,num_rows,shift):
    tablet=[[] for _ in range(num_rows)]
    i=shift
    flag = -1 if i == num_rows - 1 else 1

    for char in message:
        tablet[i].append(char)
        i+=flag
        if i==0:
            flag=1
        if i==num_rows-1:
            flag=-1

    return [x for row in tablet for x in row]


def example():
    P = [75, 73, 76, 73, 77, 81, 74, 78, 77, 75, 77]
    B = list(range(72, 82))
    K1 = 3
    K2 = 2
    C = [76, 74, 77, 73, 73, 81, 78, 75, 75, 77, 77]

    message=encode(P,B,K1,K2)
    if message==C:
        print("Yay! You are right!")
    else:
        print(message)

if __name__=="__main__":
    example()
    P=list('привет мир')
    B=sorted("йцукенгшщзхъфывапролджэячсмитьбю")
    K1 = 3
    K2 = 2

    message=encode(P,B,K1,K2)
    #print(message)