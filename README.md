# emberclear
[![Build Status](https://travis-ci.com/NullVoxPopuli/emberclear.svg?branch=master)](https://travis-ci.com/NullVoxPopuli/emberclear)

An implementation of the [mesh-chat](https://github.com/neuravion/mesh-chat) protocol.

TODO:
- add rust/wasm bip39 mnemonics?
- replace tweetnacl with wasm version.

## Development

```bash
./run
```

TODO: implement run script.

Question: should the relay finally become part of the same project?

Written in ember for demonstration of
 - progressive web apps
 - service workers
 - websockets
 - typescript
 - all the modern features / best practices of ember


#### Onetime browserify things

https://wzrd.in/

#### Debugging

Module Resolation:
```js
// shows all detected services
Object.keys(window.requirejs.entries).filter(b => b.includes("service"))
```

File Watch Problems?
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```
