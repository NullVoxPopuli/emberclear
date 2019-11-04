# [emberclear](https://emberclear.io)

emberclear is published at: https://emberclear.io
and can be run locally with docker via
```
docker run -d -p 4201:80 nullvoxpopuli/emberclear
```
and then can be visited at `http://localhost:4201`.

## Project Directory

- [Frontend / Browser Client](https://github.com/NullVoxPopuli/emberclear/tree/master/packages/frontend)
- [Phoenix Relay](https://github.com/NullVoxPopuli/mesh-relay-phoenix)
- [Benchmarks](https://github.com/NullVoxPopuli/emberclear/tree/master/packages/benchmarks)

## Another Chat App?

Yes, there is a lack of trust that manifests when existing chat apps are closed source and centralized. Emberclear, by design, is trustless -- meaning that, while there is a server component, the server knows nothing more than your "_public_ key".  The server(s) are also meant to be a hot-swappable member of a mesh network, so no one implementation matters, as long as the same protocol is used.

<a href='https://docs.google.com/spreadsheets/d/116MpTXfga_f8N0tLSY_Glt_fd4GIag9T5-P_mag7RlQ/edit#gid=0'  target='_blank'>
  Here is a table of detailing out some differences between emberclear and other chat apps:
  <img src='https://gitlab.com/NullVoxPopuli/emberclear/raw/master/images/comparison.png'>
</a>

## Development

See: [CONTRIBUTING.md](https://github.com/NullVoxPopuli/emberclear/blob/master/CONTRIBUTING.md)

## Special Thanks

<a href='http://browserstack.com' target='_blank'><img src='https://p14.zdusercontent.com/attachment/1015988/tPHKnEGj5UmlAZin6VBzV2PXP?token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0.._iQRaP0Z2EIo_bydcVxYgw.a45ScjGVDLEUj-eKschCJj2H2GnIwrb3H7fcFAHZsJIhdlVh2SLlVb3_DQcig6s1S4osAt-jNocejQdDlB-jq4DotpLlG2xXvIOO-MssjlDu5QQbCU5XwPyT2hk_0fHTVyCznoiup70QSnwfUm-xcl0bbxZI8ljgy1wQtzoqTd2CRovrOwfzQNXFg_MQ6TWkx5tkQDzhV0GbxIffZwN6s-4f5AHRNRP-3rbxtuEy6Lkz3WdQXbdynMcL2ElOS4h_zt7hEj0XRs1xNIQQhTsnjay4ZQvYSVfH13_aY3jVgVI.n_nXLbZaW3gj-FJcQxKD4A' width=100></a>
 - Cross-Browser / Cross-Platform Testing and Automation

## License

[GNU General Public License version 3](https://tldrlegal.com/license/gnu-general-public-license-v3-(gpl-3)#summary)
