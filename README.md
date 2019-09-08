# [emberclear](https://emberclear.io)

emberclear is published at: https://emberclear.io
and can be run locally with docker via
```
docker run -d -p 4201:80 nullvoxpopuli/emberclear
```
and then can be visited at `http://localhost:4201`.

## Project Directory

### [Frontend](https://github.com/NullVoxPopuli/emberclear/tree/master/packages/frontend)


![Tests](https://github.com/NullVoxPopuli/emberclear/workflows/Frontend%20Tests/badge.svg)
![Quality](https://github.com/NullVoxPopuli/emberclear/workflows/Frontend%20Quality/badge.svg)
![Deploy](https://github.com/NullVoxPopuli/emberclear/workflows/Frontend%20Deploy/badge.svg)


[![coverage report](https://gitlab.com/NullVoxPopuli/emberclear/badges/master/coverage.svg)](https://nullvoxpopuli.gitlab.io/emberclear/master/coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/3f2faa686db3db3a52f8/maintainability)](https://codeclimate.com/github/NullVoxPopuli/emberclear/maintainability)
[![bundle analysis](https://img.shields.io/badge/bundle-analysis-blue.svg)](https://nullvoxpopuli.gitlab.io/emberclear/master/bundle.html)

[![Build Status](https://travis-ci.com/NullVoxPopuli/emberclear.svg?branch=master)](https://travis-ci.com/NullVoxPopuli/emberclear)
[![Crowdin](https://d322cqt584bo4o.cloudfront.net/emberclear/localized.svg)](https://crowdin.com/project/emberclear)
[![BrowserStack Status](https://automate.browserstack.com/badge.svg?badge_key=SDYxMWtDbjBhcnZnOTBpdGZMbzl6Mktyb2QyT0FUZTlwazByUWF2ZEFUUT0tLVZKaFBZR0kzdTlmZEUxM202QnA3aVE9PQ==--58be570679305f818be70e6aef2c24f1d4dc1698)](https://automate.browserstack.com/public-build/SDYxMWtDbjBhcnZnOTBpdGZMbzl6Mktyb2QyT0FUZTlwazByUWF2ZEFUUT0tLVZKaFBZR0kzdTlmZEUxM202QnA3aVE9PQ==--58be570679305f818be70e6aef2c24f1d4dc1698)
[![This project is using Percy.io for visual regression testing.](https://percy.io/static/images/percy-badge.svg)](https://percy.io/Open-Source/emberclear)

### [Phoenix Relay](https://github.com/NullVoxPopuli/mesh-relay-phoenix)


## Another Chat App?

Yes, there is a lack of trust that manifests when existing chat apps are closed source and centralized. Emberclear, by design, is trustless -- meaning that, while there is a server component, the server knows nothing more than your "_public_ key".  The server(s) are also meant to be a hot-swappable member of a mesh network, so no one implementation matters, as long as the same protcol is used.

<a href='https://docs.google.com/spreadsheets/d/116MpTXfga_f8N0tLSY_Glt_fd4GIag9T5-P_mag7RlQ/edit#gid=0'  target='_blank'>
  Here is a table of detailing out some differences between emberclear and other chat apps:
  <img src='https://gitlab.com/NullVoxPopuli/emberclear/raw/master/images/comparison.png'>
</a>

## Development

```bash
git submodule update --init --recursive
cd packages/frontend && yarn start:dev
```

Written in ember for demonstration of
 - progressive web apps
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

## Special Thanks

<a href='http://browserstack.com' target='_blank'><img src='https://p14.zdusercontent.com/attachment/1015988/tPHKnEGj5UmlAZin6VBzV2PXP?token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0.._iQRaP0Z2EIo_bydcVxYgw.a45ScjGVDLEUj-eKschCJj2H2GnIwrb3H7fcFAHZsJIhdlVh2SLlVb3_DQcig6s1S4osAt-jNocejQdDlB-jq4DotpLlG2xXvIOO-MssjlDu5QQbCU5XwPyT2hk_0fHTVyCznoiup70QSnwfUm-xcl0bbxZI8ljgy1wQtzoqTd2CRovrOwfzQNXFg_MQ6TWkx5tkQDzhV0GbxIffZwN6s-4f5AHRNRP-3rbxtuEy6Lkz3WdQXbdynMcL2ElOS4h_zt7hEj0XRs1xNIQQhTsnjay4ZQvYSVfH13_aY3jVgVI.n_nXLbZaW3gj-FJcQxKD4A' width=100></a>
 - Cross-Browser / Cross-Platform Testing and Automation



## License

[GNU General Public License version 3](https://tldrlegal.com/license/gnu-general-public-license-v3-(gpl-3)#summary)
