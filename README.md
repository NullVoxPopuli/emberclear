# emberclear
[![Build Status](https://travis-ci.com/NullVoxPopuli/emberclear.svg?branch=master)](https://travis-ci.com/NullVoxPopuli/emberclear)

An implementation of the [mesh-chat](https://github.com/neuravion/mesh-chat) protocol.

## Development

Note: the frontend code is in `packages/frontend`. This is to separate the over-arching  repo files from the individual project(s).

```bash
./run yarn start:dev
```

Question: should the relay finally become part of the same project?

Written in ember for demonstration of
 - progressive web apps
 - server side rendering (via prember, since this is hosted on github pages)
 - service workers
 - websockets
 - typescript
 - all the modern features / best practices of ember

#### Debugging

Module Resolution:
```js
// shows all detected services
Object.keys(window.requirejs.entries).filter(b => b.includes("service"))
```

File Watch Problems?
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```



## License

[Open Pubilc License v1.0 (OPL-1.0)](https://tldrlegal.com/license/open-public-license-v1.0-(opl-1.0))
