import { Suite } from 'asyncmark';
import libsodiumWrapper from 'libsodium-wrappers';

import { wrapCatch, fromString } from '../utils';
import * as libsodiumjs from '../lib/libsodium';
import * as tweetNaCl from  '../lib/tweet-nacl';

const lorem = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse libero risus, porttitor nec urna ut, pellentesque feugiat ex. Integer viverra enim at pulvinar congue. Nunc et turpis vitae nisi maximus laoreet. Mauris malesuada lorem arcu, ut suscipit ante dictum nec. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Maecenas eget ex at ligula accumsan tincidunt ac vel erat. Nunc non nunc et dui feugiat finibus. Fusce efficitur, tortor a viverra consequat, sem nulla viverra quam, imperdiet malesuada dui justo vel lacus. Aenean malesuada gravida eros ut dictum. In vehicula vestibulum lacus vel auctor. Proin rutrum ut felis sit amet sagittis.

Vivamus quis sapien vel sapien rutrum posuere eu nec nulla. Fusce fermentum nulla et vehicula pharetra. Duis tempor libero cursus, accumsan tellus id, accumsan nulla. Nulla facilisi. In aliquet hendrerit pulvinar. Mauris nulla nibh, vulputate vitae malesuada at, pulvinar id magna. Aliquam eget elit maximus, pretium nunc sit amet, molestie felis. Mauris in dolor imperdiet metus lobortis vestibulum non ac risus. Nunc pretium mattis sapien, a scelerisque libero pharetra nec. Pellentesque nisi est, sollicitudin vitae feugiat ac, fringilla vitae lacus. Donec ullamcorper fringilla dolor, commodo vulputate metus accumsan mollis. Morbi maximus vehicula velit, in congue neque vestibulum sed. Nam volutpat, urna eu posuere consequat, leo metus mollis enim, ut scelerisque lectus leo eu urna. Aliquam porttitor sapien ut risus vehicula imperdiet. Sed nunc nisi, cursus quis porta ac, ultricies non erat. Sed tristique ante at accumsan malesuada.

Proin ante urna, lacinia at lacinia quis, condimentum in nunc. Proin ultricies velit nisl, at gravida lectus ultricies in. Aliquam laoreet, purus at commodo feugiat, felis nisl dignissim augue, non dapibus turpis nisi non lacus. In sit amet libero ut risus laoreet tristique eget sit amet erat. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Integer varius dolor eu pharetra lobortis. Nam non risus eu lectus congue maximus.

Proin mauris justo, condimentum eu rutrum at, lacinia nec urna. Vivamus vitae tristique tortor, non ultrices ante. Aliquam quis tortor et eros dapibus posuere sed non enim. Fusce a dui fringilla, imperdiet neque vel, vestibulum erat. Praesent mi lectus, dignissim posuere vulputate a, tempus et quam. Pellentesque ornare congue neque sit amet rutrum. Ut convallis ac dolor id hendrerit. Duis placerat est sit amet orci egestas congue. Donec sed nunc id leo vestibulum blandit eu eu mauris. Nam eget tempus arcu, ac lobortis metus.

Sed dolor nibh, pulvinar sit amet dui at, dictum aliquam quam. Nulla condimentum iaculis arcu. Maecenas vel metus egestas, placerat magna in, mattis massa. Cras et hendrerit purus. Nullam id porta ligula, eget feugiat risus. Nam varius nunc eu elit sodales, congue molestie turpis bibendum. Aenean eu diam dapibus, luctus odio vitae, laoreet ipsum. In vehicula purus id suscipit tristique. Praesent ultrices risus risus, eget imperdiet est rutrum et. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ac ante non turpis interdum sodales. Fusce a ligula eget enim cursus mollis. Maecenas et est magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent consectetur tempus viverra. Sed ultricies molestie blandit.

Praesent eu dictum sem. Proin porta elit lacus, vel ornare arcu cursus eu. Integer a dolor ut arcu pellentesque fringilla. Nunc eget suscipit sem, sed pellentesque elit. Nam arcu nisi, condimentum at quam pretium, semper hendrerit massa. Fusce maximus turpis velit, vel molestie est volutpat rhoncus. Praesent finibus lacinia feugiat. Sed in nulla luctus, imperdiet urna et, sodales neque. Mauris commodo mattis sapien id pulvinar.

Nulla in nisi eget sem tempus placerat. Nunc at mi sit amet tellus pulvinar imperdiet. Sed consequat efficitur felis, at aliquam est imperdiet quis. In in scelerisque lectus. Suspendisse luctus pretium tortor tincidunt interdum. Nullam ornare arcu vel magna auctor aliquam. Sed ut rutrum nunc. Pellentesque dignissim mattis iaculis. Morbi facilisis interdum neque, eu pulvinar est venenatis at. Fusce lobortis varius justo, in finibus turpis tincidunt ac. Suspendisse et ornare enim, vel placerat mauris.

Aliquam laoreet nunc eget ligula convallis, eget aliquet ipsum pulvinar. Praesent tempor nulla non magna dictum lobortis. Praesent eleifend, velit eu semper tristique, tortor velit pharetra metus, nec dignissim mi nibh ut sem. Nulla in finibus ipsum, vitae ullamcorper lorem. Donec ac ligula lacinia, placerat massa ac, mollis odio. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus imperdiet, ante sed pretium vestibulum, orci dui vulputate lacus, vel sodales metus ipsum ut velit.

Integer tempus lobortis metus, eu vulputate leo fermentum id. Praesent ut velit ultricies, maximus risus eu, lobortis ante. Nam interdum finibus fermentum. Maecenas in semper purus. Fusce ac enim ac ligula aliquet egestas. In hac habitasse platea dictumst. Morbi purus enim, pellentesque eu sagittis ac, pharetra in leo. Phasellus fermentum felis vitae nisi pulvinar semper. Sed consequat ligula tortor, et posuere orci laoreet vitae. Ut ultrices, urna et volutpat scelerisque, justo neque porta ipsum, ac mollis urna nunc vitae eros. Sed rhoncus nunc et purus finibus, ut pretium libero finibus. Nulla condimentum, nulla ac mattis commodo, est mi imperdiet odio, sed elementum orci velit quis est. Vestibulum quis justo nibh. Ut egestas tellus eu diam commodo vulputate. Vestibulum suscipit, tellus non auctor bibendum, metus nisi hendrerit elit, ut euismod magna ipsum sed tellus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;

Proin varius mi augue, sed auctor eros sagittis sed. Phasellus vehicula ex ut venenatis sagittis. Vivamus volutpat euismod lorem. Aliquam tempor quam orci. Cras ut nulla metus. Donec tempor, leo a tempor venenatis, enim ipsum aliquam tellus, id faucibus turpis magna quis ante. Ut sit amet volutpat nisl, at venenatis tellus. Praesent auctor ut risus at accumsan. Vestibulum venenatis viverra tristique. Duis a velit ornare, ultricies ipsum eu, vehicula felis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec et purus consequat, fringilla augue ut, rhoncus nisi. Duis semper metus nunc, non egestas tellus semper et. Suspendisse congue tempus nunc, id vulputate neque consectetur in. Pellentesque rhoncus, justo at dignissim feugiat, ex ligula gravida lacus, ut varius augue libero eget ante.
`;

const msg = fromString(lorem);

export async function libsodium() {
  const receiver = await libsodiumjs.generateAsymmetricKeys();
  const sender = await libsodiumjs.generateAsymmetricKeys();

  const cipherText = await libsodiumjs.encryptFor(msg, receiver.publicKey, sender.privateKey);
  await libsodiumjs.decryptFrom(cipherText, sender.publicKey, receiver.privateKey);

}

export async function tweetnacl() {
  const receiver = tweetNaCl.generateAsymmetricKeys();
  const sender = tweetNaCl.generateAsymmetricKeys();

  const cipherText = await tweetNaCl.encryptFor(msg, receiver.publicKey, sender.secretKey);
  await tweetNaCl.decryptFrom(cipherText, sender.publicKey, receiver.secretKey);

}


export const roundTrip = new Suite({
  async before() {
    await libsodiumWrapper.ready;
    console.log('\nRound-trip Box Encryption (long message)');
    console.log('libsodium using WASM:', libsodiumWrapper.libsodium.usingWasm);
  }
});

roundTrip.add({
  name: 'libsodium',
  fun: () => wrapCatch(libsodium),
});

roundTrip.add({
  name: 'tweetnacl',
  fun: () => wrapCatch(tweetnacl),
});

