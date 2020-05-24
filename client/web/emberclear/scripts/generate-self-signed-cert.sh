#!/bin/bash

openssl genrsa \
  -des3 \
  -passout pass:fakepassword \
  -out local.pass.key 2048

openssl rsa \
  -passin pass:fakepassword \
  -in local.pass.key \
  -out local.key

rm local.pass.key

openssl req \
  -new \
  -key local.key \
  -out local.csr \
  -subj "/C=EA/ST=Earth/L=Earth/O=emberclear/OU=local-dev/CN=localhost"

openssl x509 \
  -req \
  -sha256 \
  -days 365 \
  -in local.csr \
  -signkey local.key \
  -out local.crt

# openssl req \
#   -newkey rsa:4096 \
#   -new \
#   -nodes \
#   -x509 \
#   -days 3650 \
#   -out local.crt \
#   -keyout local.key \
#   -subj "/C=EA/ST=Earth/L=Earth/O=emberclear/OU=local-dev/CN=localhost"
