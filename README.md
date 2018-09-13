# [emberclear](https://emberclear.io)
[![pipeline status](https://gitlab.com/NullVoxPopuli/emberclear/badges/master/pipeline.svg)](https://gitlab.com/NullVoxPopuli/emberclear/commits/master)
[![coverage report](https://gitlab.com/NullVoxPopuli/emberclear/badges/master/coverage.svg)](https://gitlab.com/NullVoxPopuli/emberclear/commits/master)



An implementation of the [mesh-chat](https://github.com/neuravion/mesh-chat) protocol.


emberclear is published at: https://emberclear.io

## Development

Note: the frontend code is in `packages/frontend`. This is to separate the over-arching  repo files from the individual project(s).

```bash
git submodule update --init --recursive
./run yarn start:dev
```

Question: should the relay finally become part of the same project?

Written in ember for demonstration of
 - progressive web apps
 - server side rendering (via prember, since this is statically hosted)
 - service workers
 - websockets
 - typescript
 - all the modern features / best practices of ember


TODO:
 - implement WebRTC for messaging/audio/video and use websockets as a fallback
   - ensure that WebRTC messages can be manually encrypted (otherwise, it's not worth it)
 - websocket via [WebWorker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) for disconnecting the UI App from the data management so that the UI App can update independently from the WebWorker Socket Connection
 - [WASM / ASM.js Renderer](https://github.com/201-created/emberconf-schedule-2018/compare/master...asmjs?expand=1)

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

[GNU General Public License version 3](https://tldrlegal.com/license/gnu-general-public-license-v3-(gpl-3)#summary)
