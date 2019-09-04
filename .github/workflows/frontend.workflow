name: frontend

on:
  push:
    branches: [master]
    paths:
      - 'packages/frontend'
  pull_request:
    branches: [master]
    paths:
      - 'packages/frontend'

jobs:
  quality:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v1
    - uses: actions/setup-node@v1
    - name: Install
      run: |
        yarn install
    - name: Lint
      run: |
        yarn lint:js
        yarn lint:hbs
        yarn lint:sass
        yarn lint:i18n
    - name: Type Checking
      run: yarn lint:types

  tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - uses: actions/setup-node@v1
    - name: Test
      run: yarn test



