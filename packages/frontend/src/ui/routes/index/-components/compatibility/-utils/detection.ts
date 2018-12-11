// https://stackoverflow.com/questions/47879864/how-can-i-check-if-a-browser-supports-webassembly
export function hasWASM() {
  try {
    if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
      const module = new WebAssembly.Module(
        Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
      );

      if (module instanceof WebAssembly.Module) {
        new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
        return true;
      }
    }
  } catch (e) {
    // deliberately empty
  }
  return false;
}

export function hasCamera() {
  return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
}

export function hasIndexedDb() {
  return new Promise((resolve /* , reject */) => {
    let request = indexedDB.open('MyTestDatabase');

    request.onerror = function() {
      resolve(false);
    };
    request.onsuccess = function() {
      resolve(true);
    };
  });
}
