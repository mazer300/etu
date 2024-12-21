.model small

.stack 400h

.data
    KEEP_IP DW 0        ; ��� �࠭���� ᬥ饭��
    KEEP_CS DW 0        ; ��� �࠭���� ᥣ����

    EOFLine EQU '$'     ; ��।������ ᨬ���쭮� ����⠭�� '����� ��ப�';

	welcome_str db '������ ��ப�:', 0ah, 0dh, EOFLine                              ; �ਢ������� ��ப�
    change db "������ ���� ������� ��� �맮�� �����񭭮�� 09H", 0ah, 0dh, EOFLine  ; ����饭�� � ������ 9h

    input_head DB 64H, 0                        ; ��������� ��ப�: ����� ����� ���ᨬ� 64h=100 ᨬ�����.
                                                ; � ᫥� ���� ����� 0 ����� 䠪��᪮� ������⢮ ������� ᨬ�����
    input DB 64H DUP('*'), 0ah, 0dh, EOFLine    ; ���� ����� ��� ������� ᨬ�����
                                                ; ���� ����� ��� ���४⭮�� �����襭�� �뢮��
    output DB 64H DUP('$'), 0ah, 0dh, EOFLine   ; ���� ����� ��� ��ࠡ�⠭��� ᨬ�����
                                                ; ���� ����� ��� ���४⭮�� �����襭�� �뢮��

.code
    mov   ax,@data            ; ����㧪� ᥣ���⭮��
    mov   ds,ax               ; ॣ���� ������

    ; �뢮� �ਢ��⢨�
    mov dx, OFFSET welcome_str
	mov ah, 09h               ; �㭪�� DOS ��� �뢮�� ��ப�
    int 21h    

    ; ���� ��ப� ���짮��⥫��
    mov dx, OFFSET input_head
    call stringRead

    ; ���࠭���� ����権 ��ண� ��ࠡ��稪� ���뢠��� 9h
    mov ah, 35h               ; �㭪�� ����祭�� �����
    mov al, 9h                ; ����� �����
    int 21h
    mov KEEP_CS, es           ; ����������� ᥣ���� �ਣ����쭮�� ��ࠡ��稪�
    mov KEEP_IP, bx           ; ����������� ᬥ饭�� �ਣ����쭮�� ��ࠡ��稪�

    ; ����প� �� �६���
    mov cx, 0eh               ; 14 * 65535 ��� ����প�
    mov dx, 0ffffh            ; ��� 65535 ��� ����প�
    mov ah, 86h               ; �㭪�� "�����"
    int 15h                   ; �맮� �㭪樨 ��������

    ; ������ ��ࠡ��稪� ���뢠��� 9h
    push ds
    mov dx, OFFSET SUBR_INT   ; ���饭�� ��� ��楤��� � DX ���� ��ࠡ��稪 SUBR_INT
    mov ax, SEG SUBR_INT      ; ������� ��楤���
    mov ds, ax                ; ����頥� � DS
    mov ah, 25h               ; �㭪�� ��⠭���� �����
    mov al, 09h               ; ����� �����
    int 21h                   ; ���塞 ���뢠���
    pop ds
    
    ; ����饭�� �� ��������
    lea dx, change
    call  writeMsg	

	; �������� ������ Enter
wait_for_enter:
	mov ah, 0h                ; �㭪�� "�஢�ઠ ������"
	int 16h                   ; ��뢠�� ���뢠��� ��� �⥭�� ������
	cmp ah, 1Ch               ; �஢��塞, �� ����� ������ Enter (��� 0x0D)
	jne wait_for_enter        ; �᫨ ���, �த������ ��������

    ; ����⠭������� 9h
    push ds
    mov dx, KEEP_IP           ; ���饭�� ��� �ਣ����쭮�� ��ࠡ��稪� 9h
    mov ax, KEEP_CS           ; ������� �ਣ����쭮�� ��ࠡ��稪�
    mov ds, ax                ; ����頥� � DS
    mov ah, 25h               ; �㭪�� ��⠭���� ����� ���뢠���
    mov al, 9h                ; ����� �����
    int 21h                   ; ������ ���뢠���
    pop ds

    ; �����襭�� �ணࠬ��
    mov ah, 4ch
    int 21h

; ��楤�� ���뢠��� ��ப�
StringRead PROC NEAR
    ; ����������� �����塞�� ॣ���஢
    push ax
	push bp
	push bx
	
	mov ah, 0ah                       ; �㭪�� ����� ��ப�
	push dx                           ; ���饭�� ��������� ��ப�
	int 21h                           ; �맮� �㭪樨 DOS ����� ��ப�
	pop bp                            ; �������� � bp
	xor bx, bx                        ; ���㫥��� bx
	mov BL, ds:[bp + 1]               ; ������ � bx ������⢮ ��������� ᨬ�����
	add bx, bp                        ; ������ bx 㪠�뢠�� �� ������ ������ ᨬ���
	add bx, 2                         ; ������ bx 㪠�뢠�� �� ����, ᫥���騩 �� 䨭���� 0dh
	mov word ptr [bx + 1], 240ah      ; �������� � ����� 0ah � '$'

	; �����饭�� ��࠭����� ॣ���஢
	pop bx
	pop bp
	pop ax
	ret
StringRead ENDP

; ��楤�� �뢮�� ᮮ�饭��
writeMsg  PROC  NEAR
	push ax             ; ����������� �����塞��� ॣ����
    mov ah, 09h         ; �㭪�� DOS ��� �뢮�� ��ப�
    int 21h             ; �맮� DOS
    pop ax              ; ���㧪� �����塞��� ॣ����
    ret
writeMsg  ENDP

; ��楤�� ��ࠡ�⪨ ��ப�
process_string PROC NEAR
	; ����������� �����塞�� ॣ���஢
	push si
	push di
	push bx
	push cx
	push dx
	push ax
	push es

	; ����㧪� ᥣ���� ������ � ॣ���� es
	mov ax, @data
	mov es, ax

	cld                     ; ���� 䫠�� DF ��� ���ࠢ����� ᫥�� ���ࠢ�

	lea si, input           ; ���� ������ "��㤠"
	lea di, output          ; ���� ������ "�㤠"

	xor cx, cx              ; ���㫥��� ॣ���� cx
	mov cl, input_head[1]   ; �� - ࠧ��� ��ப�
	
	cmp cl, 0               ; �᫨ ��ப� �����, � ��������
	je leave

	; ���樠������ ��६�����
	xor dx, dx              ; bx �㤥� �ᯮ�짮������ ��� ������ ᨬ����� ��᫥ "V"
	xor bx, bx

process_loop:
	lodsb                   ; ����㧨�� ᨬ��� �� si � al
	cmp al, 'V'             ; �஢�ઠ, ���� �� ᨬ��� "V"
	jne next_char           ; �᫨ ���, ��३� � ᫥���饬� ᨬ����

	; ��諨 "V", ⥯��� �㦭� ���� ���ᨬ��쭮� �᫮ ᨬ����� ��᫥ ����, ��ࠧ���� ��䨪�
	push si                 ; ���࠭��� ⥪���� ������ � ��ப�
	mov dx, 0               ; ������ ���稪 ᨬ����� ��᫥ "V"
	mov bx, 0               ; ������ ᬥ饭��
	mov al, [si]            ; ����㧨�� ᨬ��� �� si � al
	
while:
	cmp al, '$'             ; �஢�ઠ �� ����� ��ப�
	je append
	
	cmp al, input[bx]       ; �஢�ઠ �� ᮢ������� ᨬ�����
	jne append
	
	inc bx                  ; �����祭�� ᬥ饭��
	inc dx                  ; �����祭�� ����稪�
	mov al,[si+bx]          ; ����㧨�� ᨬ��� �� si � al
	jmp while
	
append:
	pop si                  ; ����⠭����� ⥪���� ������ � ��ப�
	mov al, dl              ; ����㧨�� �᫮ ᨬ����� � al
	cmp al,9                ; �᫨ �᫮ ���姭�筮�
	jle less_than_10
	
	; �८�ࠧ������ �᫠ ����� 9 � ��ப�
	mov bx, 10              ; ����⥫�
	xor dx, dx              ; ���⪠ dx ��� �������
	mov ah, 0               ; ���⪠ ah ��� ��୮�� १���� �������
	div bx                  ; ����� ax �� 10, ��⭮� � ax, ���⮪ � dx
	add al, '0'             ; �८�ࠧ����� ��⭮� � ᨬ���
	mov [di], al            ; ���࠭��� ᨬ��� � output
	inc di                  ; ��३� � ᫥���饩 ����樨 � ��ப�
	add dl, '0'             ; �८�ࠧ����� ���⮪ � ᨬ���
	mov [di], dl            ; ���࠭��� ᨬ��� � output
	inc di                  ; ��३� � ᫥���饩 ����樨 � ��ப�
	mov al, ' '             ; �������� �஡�� ��᫥ �᫠
	stosb                   ; ���࠭��� �஡�� � output
	jmp next_char           ; ��३� � ᫥���饬� ᨬ����
	
less_than_10:
	add al, '0'             ; �८�ࠧ����� �᫮ � ᨬ���
	stosb                   ; ���࠭��� ᨬ��� � output
	mov al, ' '             ; �������� �஡�� ��᫥ �᫠
	stosb                   ; ���࠭��� �஡�� � output
	jmp next_char           ; ��३� � ᫥���饬� ᨬ����

next_char:
	loop process_loop       ; �த������ ��ࠡ��� ᫥���饣� ᨬ���� ���� cx>0
	
leave:
	; �����襭�� ��ப� output
	dec di                  ; ����� ��᫥���� �஡��
	mov al, '$'             ; �������� ᨬ��� ���� ��ப�
	stosb                   ; ���࠭��� ᨬ��� ���� ��ப� � output

	; �뢮� �८�ࠧ������� ��ப�
	mov dx, offset output
	call writeMsg

	; �����饭�� ��࠭����� ॣ���஢
	pop es
	pop ax
	pop dx
	pop cx
	pop bx
	pop di
	pop si
	ret
process_string ENDP

; ��ࠡ��稪 ���뢠��� 9h
SUBR_INT proc
    ; ���࠭���� �����塞�� ॣ���஢
	push ax
    push es
    push bx
    push ds
    push dx

	; �८�ࠧ������ ��ப�
	call process_string
	 
	; ����⠭������� 9h
	push ds
    mov dx, KEEP_IP            ; ���饭�� ��� �ਣ����쭮�� ��ࠡ��稪� 9h
    mov ax, KEEP_CS            ; ������� �ਣ����쭮�� ��ࠡ��稪�
    mov ds, ax                 ; ����頥� � DS
    mov ah, 25h                ; �㭪�� ��⠭���� ����� ���뢠���
    mov al, 9h                 ; ����� �����
    int 21h                    ; ������ ���뢠���
    pop ds
	
	; �����饭�� ��࠭����� ॣ���஢
    pop dx
    pop ds
    pop bx
    pop es
    pop ax
	
    jmp dword ptr [KEEP_IP]    ; ���室 � �믮������ �ਣ����쭮�� ���� ��ࠡ�⪨ ���뢠��� 9h

SUBR_INT endp

end
