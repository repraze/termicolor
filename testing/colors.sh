#!/usr/bin/env sh
# Termicolor sample: prints the 16 ANSI colors, backgrounds and text styles for terminal screenshots.
printf 'Hello, world - Termicolor terminal test\n\n'
for base in 30 90; do
    for i in 0 1 2 3 4 5 6 7; do
        code=$((base + i))
        printf '\033[%sm %3s \033[0m' "$code" "$code"
    done
    printf '\n'
done
printf '\n'
for i in 0 1 2 3 4 5 6 7; do printf '\033[4%sm     \033[0m' "$i"; done
printf '\n'
for i in 0 1 2 3 4 5 6 7; do printf '\033[10%sm     \033[0m' "$i"; done
printf '\n\n\033[2mdim text\033[0m  \033[1mbold text\033[0m  \033[3mitalic\033[0m  \033[4munderline\033[0m  \033[7mreverse\033[0m\n'
