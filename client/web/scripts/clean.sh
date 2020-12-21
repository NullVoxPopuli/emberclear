#!/bin/bash

function try_unmount {
  if mountpoint -q -- "$1"; then
    printf '%s\n' "$1 is in RAM, unmounting..."
    sudo umount -f $1
  fi
}

function delete_excluding {
  to_delete=$1
  exclude=$2

  find . \
    \( -type d -name ${exclude} -prune \) \
    -o \( -type d -name ${to_delete} -prune \
          -exec rm -rf {} + \)
}

try_unmount "emberclear/dist"
try_unmount "emberclear/node_modules"
try_unmount "node_modules"

# The simple way to recursively delete is
#
#  find . -type d -name "declarations" -exec rm -rf {} +
#
# But this also searches within node_modules

delete_excluding 'node_modules' 'declarations'
delete_excluding 'declarations' 'node_modules'
delete_excluding 'dist' 'node_modules'
