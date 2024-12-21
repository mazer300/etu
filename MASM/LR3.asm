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
	mov ax,data  ;����㧪� ᥣ���⭮��
	mov ds,ax    ;ॣ���� ������.
	
	;���᫥��� f4 � f6
	mov ax,a     ;��᢮��� ax a
	mov cx,i     ;��᢮��� cx i
	cmp ax,b     ;�ࠢ����� ax � b
	shl cx,1     ;��⮢� ᤢ�� �� 2, ⥯��� � cx �࠭���� i*2
	jg a_greater ;���室   (a>=b)
	
	;f4, �᫨ a<=b
	mov i1,6     ;��᢮��� i1 6
	add cx,i     ;�ਡ����� � cx i, ⥯��� � cx �࠭���� i*3
	add i1,cx    ;�ਡ����� � i1 cx (i*3), ⥯��� � i2 6+i*3 = 3*(i+2)
	
	;f6, �᫨ a<=b
	mov i2,2     ;��᢮��� � i2 2
	sub i2,cx    ;���⠭�� �� i2 cx (3*i), ⥯��� � i2 2-3*i = 5-3*(i+1)
	
	jmp f8       ;���室 � f8
	
a_greater:
	;f6, �᫨ a>b
	mov i2,cx    ;��᢮���� i2 cx (i*2)
	sub i2,2     ;���⠭�� �� i2 2, ⥯��� � i2 i*2-2 = 2*(i+1)-4

	;f4, �᫨ a>b
	mov i1,4     ;��᢮���� i1 4
	add cx,i     ;᫮����� � cx i, ⥯��� cx=3*i
	shl cx,1     ;��⮢� ᤢ�� �� 2, ⥯��� � cx �࠭���� i*6
	sub i1,cx    ;���⠭�� �� i1 cx, ⥯��� � i1 4-i*2-i*4 = 4-6*i

f8:
	;���᫥��� f8
	mov ax,k     ;��᢮���� � ax k
	mov cx,i1    ;��᢮���� � cx i1
	mov dx,i2    ;��᢮���� � dx i2
	
pos_i2:
	neg dx       ;��������� ����� ��� ����� �����
	jl pos_i2    ;��६�饭�� �᫨ dx (i2) ����� 0
		
	mov res,dx   ;��᢮���� � res dx
	cmp k,0      ;�ࠢ����� k � 0 (k<0)
	jl k_smaller ;��६�饭��
	
	;k>=0
	sub res,3    ;���⠭�� �� res 3, � res |i2|-3
	cmp res,4    ;�ࠢ����� res � 4 (res<4)
	jl res_smaller;���室
	jmp finish   ;���室 �� �����襭��
		
res_smaller:
	mov res,4    ;��᢮���� � res 4
	jmp finish   ;���室 � �����襭��
	
k_smaller:
	;k<0
pos_i1:
	neg cx       ;��������� ����� �᫠ cx (i1)
	jl pos_i1    ;���室 �᫨ cx (i1) ����⥫쭮�
	sub res,cx   ;���⠭�� cx (i1) �� res 
		
finish:
	int 20h      ;�����襭�� �ணࠬ��
	
Main    ENDP
CODE    ENDS

        END Main
