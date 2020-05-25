declare module 'qr-scanner' {
  class QrScanner {
    static WORKER_PATH: string;

    constructor(element: Element, onDecode: (result: string) => void, canvasSize?: number);

    _qrWorker: Worker;

    start: () => Promise<void>;
    stop: () => Promise<void>;
  }

  export default QrScanner;
}
