interface IOptions {
  video?: HTMLElement;
  mirror?: boolean;
  continuous?: boolean;
  captureImage?: boolean;
  backgroundScan?: boolean;
  refractoryPeriod?: number;
  scanPeriod?: number;
}

declare class Scanner {
  // static new(options: IOptions): Scanner;
  constructor(options: IOptions);
  captureImage: boolean;

  start(camera: Camera): Promise<void>;
  stop(): Promise<void>;
  scan(): null | { content: string, image: null | string };
  addListener(name: string, callback: (content: any) => any): void;

}

declare class Camera {
  id: string;
  name: string;

  // not actually on camera, but set by me
  displayName: string;

  getCameras(): Promise<Camera[]>;
}

declare module 'instascan' {
  const defaultExport: {
    Scanner: Scanner,
    Camera: Camera
  };

  export default defaultExport;
}
