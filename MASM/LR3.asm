ASSUME CS:CODE, SS: AStack, DS: DATA

AStack  SEGMENT STACK
        DW 32 DUP(0)
AStack  ENDS


DATA    SEGMENT

a   DW  0
b   DW  0
i   DW  0
k   DW  -1

i1  DW  0
i2  DW  0
res DW  0

DATA    ENDS


CODE    SEGMENT

Main    PROC    FAR
	mov ax,data  ;загрузка сегментного
	mov ds,ax    ;регистра данных.
	
	;Вычисление f4 и f6
	mov ax,a     ;присвоние ax a
	mov cx,i     ;присвоние cx i
	cmp ax,b     ;сравнение ax и b
	shl cx,1     ;битовый сдвиг на 2, теперь в cx хранится i*2
	jg a_greater ;переход   (a>=b)
	
	;f4, если a<=b
	mov i1,6     ;присвоние i1 6
	add cx,i     ;прибавить в cx i, теперь в cx хранится i*3
	add i1,cx    ;прибавить к i1 cx (i*3), теперь в i2 6+i*3 = 3*(i+2)
	
	;f6, если a<=b
	mov i2,2     ;присвоние в i2 2
	sub i2,cx    ;вычитание из i2 cx (3*i), теперь в i2 2-3*i = 5-3*(i+1)
	
	jmp f8       ;переход к f8
	
a_greater:
	;f6, если a>b
	mov i2,cx    ;присвоение i2 cx (i*2)
	sub i2,2     ;вычитание из i2 2, теперь в i2 i*2-2 = 2*(i+1)-4

	;f4, если a>b
	mov i1,4     ;присвоение i1 4
	add cx,i     ;сложение с cx i, теперь cx=3*i
	shl cx,1     ;битовый сдвиг на 2, теперь в cx хранится i*6
	sub i1,cx    ;вычитание из i1 cx, теперь в i1 4-i*2-i*4 = 4-6*i

f8:
	;Вычисление f8
	mov ax,k     ;присвоение в ax k
	mov cx,i1    ;присвоение в cx i1
	mov dx,i2    ;присвоение в dx i2
	
pos_i2:
	neg dx       ;изменение знака для взятия модуля
	jl pos_i2    ;перемещение если dx (i2) меньше 0
		
	mov res,dx   ;присвоение в res dx
	cmp k,0      ;сравнение k и 0 (k<0)
	jl k_smaller ;перемещение
	
	;k>=0
	sub res,3    ;вычитание из res 3, в res |i2|-3
	cmp res,4    ;сравнение res и 4 (res<4)
	jl res_smaller;переход
	jmp finish   ;переход на завершение
		
res_smaller:
	mov res,4    ;присвоение в res 4
	jmp finish   ;переход к завершению
	
k_smaller:
	;k<0
pos_i1:
	neg cx       ;изменение знака числа cx (i1)
	jl pos_i1    ;переход если cx (i1) отрицательное
	sub res,cx   ;вычитание cx (i1) из res 
		
finish:
	int 20h      ;завершение программы
	
Main    ENDP
CODE    ENDS

        END Main
