declare module 'qr-scanner' {
  // https://stackoverflow.com/questions/39019502/seeking-typescript-type-definition-new-callable-clarification
  // interface IScanner {
  //   new (options: IOptions): Scanner;
  // }

  class QrScanner {
    constructor(element: Element, onDecode: (result: string) => void, canvasSize?: number);

    _qrWorker: Worker;

    start: () => Promise<void>;
    stop: () => Promise<void>;
  }

  export default QrScanner;
}
