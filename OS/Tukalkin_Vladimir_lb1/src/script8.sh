#!/bin/bash
echo "Содержимое /etc/passwd:"
cat /etc/passwd

echo "Права доступа:"
ls -l /etc/passwd /etc/shadow /usr/bin/passwd
