section .rodata
str_2: db "fucking", 0
section .rodata
str_1: db "sdfsdfs", 0
section .rodata
str_0: db "includes works!", 0
bits 64
default rel
extern putchar
extern printf
extern scanf
extern fopen
global main
section .rodata
mode_r: db "r", 0
fmt_int: db "%d", 10, 0
fmt_str: db "%s", 10, 0
section .text
main:
push rbp
mov rbp, rsp
sub rsp, 256
lea rax, [rel str_0]
mov [rbp-12], rax
mov dword [rbp-16], 0
lea rax, [rel str_1]
mov [rbp-28], rax
lea rax, [rel str_2]
mov [rbp-40], rax
mov dword [rbp-44], 0
jmp proc1
procmain:
lea rdi, [rel fmt_str]
mov rsi, [rbp-12]
xor eax, eax
call printf
lea rdx, [rel fmt_int]
mov rsi, 0
xor eax, eax
call putchar
ret
proc1:
doitagain:
cmp byte [rbp-44], 50
je nextmain1
mov edi, dword [rbp-44]
lea rdi, [rel fmt_int]
mov esi, dword [rbp-44]
xor eax, eax
call printf

mov edi, dword [rbp-16]
lea rdi, [rel fmt_int]
mov esi, dword [rbp-16]
xor eax, eax
call printf

mov edx, 2
add dword [rbp-44], edx
add dword [rbp-16], edx
xor edx, edx

jmp doitagain

call procmain

nextmain1:
lea rdi, [rel fmt_str]
mov rsi, [rbp-12]
xor eax, eax
call printf
call procmain
xor eax, eax
leave
ret