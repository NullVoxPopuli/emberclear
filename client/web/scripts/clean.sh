#!/bin/bash

function tryUmount {
  if mountpoint -q -- "$1"; then
    printf '%s\n' "$1 is in RAM, unmounting..."
    sudo umount -f $1
  fi
}

tryUnmount "emberclear/dist"
tryUnmount "emberclear/node_modules"
tryUnmount "node_modules"

find . -type d -name "node_modules" -exec rm -rf {} +
find . -type d -name "declarations" -exec rm -rf {} +
