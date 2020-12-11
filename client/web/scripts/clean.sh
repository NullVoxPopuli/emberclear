#!/bin/bash

function try_unmount {
  if mountpoint -q -- "$1"; then
    printf '%s\n' "$1 is in RAM, unmounting..."
    sudo umount -f $1
  fi
}

try_unmount "emberclear/dist"
try_unmount "emberclear/node_modules"
try_unmount "node_modules"

find . -type d -name "node_modules" -exec rm -rf {} +
find . -type d -name "declarations" -exec rm -rf {} +
