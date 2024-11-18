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
	mov ax,data  ;����㧪� ᥣ���⭮��
	mov ds,ax    ;ॣ���� ������.
	
	;���᫥��� f4 � f6
	mov ax,a     ;��᢮��� ax a
	mov cx,i     ;��᢮��� cx i
	cmp ax,b     ;�ࠢ����� ax � b
	jg a_greater ;���室   (a>=b)
	
	;f4, �᫨ a<=b
	mov dx,6     ;��᢮��� dx 6
	shl cx,1     ;��⮢� ᤢ�� �� 2, ⥯��� � cx �࠭���� i*2
	add cx,i     ;�ਡ����� � cx i, ⥯��� � cx �࠭���� i*3
	add dx,cx    ;�ਡ����� � dx cx (6+i*3 = 3*(i+2))
	mov i1,dx    ;��᢮���� � �⢥�
	
	;f6, �᫨ a<=b
	mov dx,2     ;��᢮��� dx 2
	sub dx,cx    ;���⠭�� �� dx cx (2-3*i = 5-3*(i+1))
	mov i2,dx    ;��᢮���� � �⢥�
	
	jmp f8       ;���室 � f8
	
a_greater:
	;f6, �᫨ a>b
	shl cx,1     ;��⮢� ᤢ�� �� 2, ⥯��� � cx �࠭���� i*2
	mov dx,cx    ;��᢮���� dx cx 
	sub dx,2     ;i*2-2 = 2*(i+1)-4
	mov i2,dx    ;��᢮���� � �⢥�

	;f4, �᫨ a>b
	mov dx,4     ;��᢮���� dx 4
	sub dx,cx    ;���⠭�� (4-i*2)
	shl cx,1     ;��⮢� ᤢ�� �� 2, ⥯��� � cx �࠭���� i*4
	sub dx,cx    ;���⠭�� (4-i*2-i*4 = 4-6*i)
	mov i1,dx    ;��᢮���� � �⢥�

f8:
	;���᫥��� f8
	mov ax,k     ;��᢮���� � ax k
	mov cx,i1    ;��᢮���� � cx i1
	mov dx,i2    ;��᢮���� � dx i2
	cmp dx,0     ;�ࠢ����� dx � 0 (dx>=0)
	jge cmp_k    ;�᫨ ��, � ���室
	neg dx       ;��������� ����� ��� ����� �����
	
cmp_k:
	mov res,dx   ;��᢮���� � res dx
	cmp k,0      ;�ࠢ����� k � 0 (k<0)
	jl k_smaller ;��६�饭��
	
	;k>=0
	sub res,3    ;���⠭�� �� res 3
	cmp res,4    ;�ࠢ����� res � 4 (res<4)
	jl res_smaller;���室
	jmp finish   ;���室 �� �����襭��
		
res_smaller:
	mov res,4    ;��᢮���� � res 4
	jmp finish   ;���室 � �����襭��
	
k_smaller:
	;k<0
	cmp cx,0     ;�ࠢ����� cx c 0
	jge cx_greater;���室  (cx>=0)
	add res,cx   ;᫮����� res � cx
	
cx_greater:
	sub res,cx   ;���⠭�� �� res cx 
	
finish:
	int 20h      ;�����襭�� �ணࠬ��
	
Main    ENDP
CODE    ENDS
        END Main
