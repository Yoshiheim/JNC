node main.js
nasm -f elf64 out.asm
gcc -no-pie out.o -o out
./out

