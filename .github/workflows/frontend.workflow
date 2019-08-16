name: emberclear frontend

on: [push]

jobs:
  build:

    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [8.x, 10.x, 12.x]

    steps:
    - uses: actions/checkout@v1
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v1
      with:
        node-version: ${{ matrix.node-version }}
    - name: run everything
      run: |
        cd packages/frontend
        yarn install
        yarn lint:js
        yarn lint:hbs
        yarn lint:sass
        yarn lint:i18n
        yarn lint:types
        yarn test
