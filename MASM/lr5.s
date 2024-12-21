.data
    newline:    .asciz "\n"
    output:     .asciz "res = "
    formula:    .asciz "((z & 8) + (x | (-18))) | (y - 8)\n"
    val1:     .asciz "x1 y1 z1: "
    val2:     .asciz "x2 y2 z2: "
    space:     .asciz " "

    .equ x1, 152
    .equ y1, 5413
    .equ z1, 61
    .equ x2, 152
    .equ y2, 5413
    .equ z2, 61

    .text
    .globl main

main:
    # Загрузка констант
    li s0, 18       # s0 = a (18)
    li s1, 8        # s1 = b (8)
    li s2, 8        # s2 = c (8)

    # Загрузка первого набора данных
    li a2, x1       # a2 = x1
    li a3, y1       # a3 = y1
    li a4, z1       # a4 = z1

    # Загрузка второго набора данных
    li a5, x2       # a5 = x2
    li a6, y2       # a6 = y2
    li a7, z2       # a7 = z2

    li t5, 0           # Установка флага для первого вызова
    # Вывод формулы
    li a7, 4           # Установка системного вызова для вывода строки
    la a0, formula     # Загрузка адреса строки в a0
    ecall              # Вывод строки

    # Вывод первого набора
    la a0, val1     # Загрузка адреса строки в a0
    ecall               # Вывод строки

    # Вывод x1
    li a7, 1           # Установка системного вызова для вывода числа
    mv a0, a2          # Передача x1 в a0
    ecall              # Вывод x1
    
    # Вывод пробела
    li a7, 4
    la a0, space       # Загрузка адреса пробела в a0
    ecall              # Вывод пробела
    
     # Вывод y1
    li a7, 1           
    mv a0, a3          # Передача y1 в a0
    ecall              # Вывод y1

    # Вывод пробела
    li a7, 4           
    la a0, space       # Загрузка адреса пробела в a0
    ecall              # Вывод пробела

     # Вывод z1
    li a7, 1           
    mv a0, a4          # Передача z1 в a0
    ecall              # Вывод z1

    # Вывод enter
    li a7, 4           
    la a0, newline     # Загрузка адреса новой строки в a0
    ecall              # Вывод новой строки
      
    # Вывод второго набора
    la a0, val2    # Загрузка адреса строки в a0
    ecall              # Вывод строки

    # Вывод x2
    li a7, 1           
    mv a0, a5          # Передача x2 в a0
    ecall              # Вывод x2

    # Вывод пробела
    li a7, 4           
    la a0, space       # Загрузка адреса пробела в a0
    ecall              # Вывод пробела

    # Вывод y2
    li a7, 1           
    mv a0, a6          # Передача y2 в a0
    ecall              # Вывод y2

    # Вывод пробела
    li a7, 4           
    la a0, space       # Загрузка адреса пробела в a0
    ecall              # Вывод пробела

    # Вывод z2
    li a7, 1           
    li a0, z2          # Передача z2 в a0
    ecall              # Вывод z2

    # Вывод новой строки
    li a7, 4           
    la a0, newline     # Загрузка адреса новой строки в a0
    ecall  

    li a7, z2          # Загрузка z2 в a7

    call calculate       # Вызов процедуры compute
    mv a1, a0          # Сохранение результата первого вызова в a1
    li t5, 1

    jal calculate        # Вызов процедуры compute через jal
    mv a2, a0          # Сохранение результата второго вызова в a2

    # Вывод результатов
    li a7, 4           
    la a0, output      
    ecall  

    li a7, 1
    mv a0, a1         
    ecall

    li a7, 4
    la a0, newline 
    ecall

    la a0, output      
    ecall  

    li a7, 1
    mv a0, a2          
    ecall

    li a7, 10          # Установка системного вызова для завершения программы
    ecall              # Завершение работы программы

calculate:
    mv t0, a2          # Копирование x1 в t0 (t0 = x1)
    mv t1, a3          # Копирование y1 в t1 (t1 = y1)
    mv t2, a4          # Копирование z1 в t2 (t2 = z1)
    beq t5, x0, continue  # Переход, если флаг равен 0

    mv t0, a5          # Копирование x2 в t0 для второго вызова (t0 = x2)
    mv t1, a6          # Копирование y2 в t1 для второго вызова (t1 = y2)
    mv t2, a7          # Копирование z2 в t2 для второго вызова (t2 = z2)

continue:
    # Вычисление выражения
    and t3, t2, s1  # t3 = z1 & b
    mv t4, s0       # t4 = -a
    or t5, a2, t4   # t5 = x1 | (-a)
    add t6, t3, t5  # t6 = (z1 & b) + (x1 | (-a))
    sub s7, t1, s2  # s7 = y1 - c
    or a0, t6, s7   # a0 = ((z1 & b) + (x1 | (-a))) | (y1 - c)
    ret             # Возврат из процедуры