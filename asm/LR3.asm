ASSUME CS:CODE, SS: AStack, DS: DATA

AStack  SEGMENT STACK
        DW 32 DUP(0)
AStack  ENDS


DATA    SEGMENT

a   DW  0
b   DW  0
i   DW  0
k   DW  0

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
	jg a_greater ;переход   (a>=b)
	
	;f4, если a<=b
	mov dx,6     ;присвоние dx 6
	shl cx,1     ;битовый сдвиг на 2, теперь в cx хранится i*2
	add cx,i     ;прибавить в cx i, теперь в cx хранится i*3
	add dx,cx    ;прибавить к dx cx (6+i*3 = 3*(i+2))
	mov i1,dx    ;присвоение в ответ
	
	;f6, если a<=b
	mov dx,2     ;присвоние dx 2
	sub dx,cx    ;вычитание из dx cx (2-3*i = 5-3*(i+1))
	mov i2,dx    ;присвоение в ответ
	
	jmp f8       ;переход к f8
	
a_greater:
	;f6, если a>b
	shl cx,1     ;битовый сдвиг на 2, теперь в cx хранится i*2
	mov dx,cx    ;присвоение dx cx 
	sub dx,2     ;i*2-2 = 2*(i+1)-4
	mov i2,dx    ;присвоение в ответ

	;f4, если a>b
	mov dx,4     ;присвоение dx 4
	sub dx,cx    ;вычитание (4-i*2)
	shl cx,1     ;битовый сдвиг на 2, теперь в cx хранится i*4
	sub dx,cx    ;вычитание (4-i*2-i*4 = 4-6*i)
	mov i1,dx    ;присвоение в ответ

f8:
	;Вычисление f8
	mov ax,k     ;присвоение в ax k
	mov cx,i1    ;присвоение в cx i1
	mov dx,i2    ;присвоение в dx i2
	cmp dx,0     ;сравнение dx и 0 (dx>=0)
	jge cmp_k    ;если да, то переход
	neg dx       ;изменение знака для взятия модуля
	
cmp_k:
	mov res,dx   ;присвоение в res dx
	cmp k,0      ;сравнение k и 0 (k<0)
	jl k_smaller ;перемещение
	
	;k>=0
	sub res,3    ;вычитание из res 3
	cmp res,4    ;сравнение res и 4 (res<4)
	jl res_smaller;переход
	jmp finish   ;переход на завершение
		
res_smaller:
	mov res,4    ;присвоение в res 4
	jmp finish   ;переход к завершению
	
k_smaller:
	;k<0
	cmp cx,0     ;сравнение cx c 0
	jge cx_greater;переход  (cx>=0)
	add res,cx   ;сложение res и cx
	
cx_greater:
	sub res,cx   ;вычитание из res cx 
	
finish:
	int 20h      ;завершение программы
	
Main    ENDP
CODE    ENDS
        END Main
