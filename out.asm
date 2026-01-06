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
lea rax, [rel str_1]
mov [rbp-24], rax
lea rax, [rel str_2]
mov [rbp-36], rax
mov dword [rbp-40], 0
cmp byte [rbp-40], 0
jne nextmain1
nextmain1:
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
lea rdi, [rel fmt_str]
mov rsi, [rbp-12]
xor eax, eax
call printf
call procmain
xor eax, eax
leave
ret