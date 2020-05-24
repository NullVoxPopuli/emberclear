import * as libsodumFns from './libsodium';
import * as tweetnaclFns from './tweet-nacl';
import * as jsNaclFns from './js-nacl';

export const libsodium = {
    toHex: libsodumFns.toHex,
    fromHex: libsodumFns.fromHex,
    toBase64: libsodumFns.toBase64,
    fromBase64: libsodumFns.fromBase64,
    fromString: libsodumFns.fromString,
    toString: libsodumFns.toString,
};

export const tweetnacl = {
    toBase64: tweetnaclFns.toBase64,
    fromBase64: tweetnaclFns.fromBase64,
    fromString: tweetnaclFns.fromString,
    toString: tweetnaclFns.toString,
}

export const jsnacl = {
    toHex: jsNaclFns.toHex,
    fromHex: jsNaclFns.fromHex,
    fromString: jsNaclFns.fromString,
    toString: jsNaclFns.toString,
}