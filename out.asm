section .rodata
str_2: db "fucking", 0 ; for fuck
section .rodata
str_1: db "sdfsdfs", 0 ; for str
section .rodata
str_0: db "includes works!", 0 ; for s
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
lea rax, [rel str_0]; s
mov [rbp-12], rax
mov dword [rbp-16], 0; f
mov dword [rbp-20], 0; x
mov dword [rbp-24], 0; y
lea rax, [rel str_1]; str
mov [rbp-36], rax
lea rax, [rel str_2]; fuck
mov [rbp-48], rax
mov dword [rbp-52], 0; a
mov dword [rbp-56], 50; MAX
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
whl1:
mov edi, dword [rbp-52]
lea rdi, [rel fmt_int]
mov esi, dword [rbp-52]
xor eax, eax
call printf

mov edi, dword [rbp-56]
lea rdi, [rel fmt_int]
mov esi, dword [rbp-56]
xor eax, eax
call printf

mov edx, 5
add dword [rbp-52], edx
xor edx, edx

mov edx, dword [rbp-56]
cmp dword [rbp-52], edx
jne whl1
mov edi, dword [rbp-52]
lea rdi, [rel fmt_int]
mov esi, dword [rbp-52]
xor eax, eax
call printf
xor eax, eax
leave
ret