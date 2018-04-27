# emberclear

An implementation of the [mesh-chat](https://github.com/neuravion/mesh-chat) protocol.


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

#### Debugging

Module Resolation:
```js
// shows all detected services
Object.keys(window.requirejs.entries).filter(b => b.includes("service"))
```
