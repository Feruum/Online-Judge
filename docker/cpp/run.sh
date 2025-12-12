#!/bin/bash
g++ -o main main.cpp
if [ $? -eq 0 ]; then
    ./main
else
    exit 1
fi
