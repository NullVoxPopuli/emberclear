/**
 * Catch-all for ember-data.
 */
declare module 'instascan' {
  export class Scanner {
    // export namespace Camera {
    //     export function getCameras(): Camera[];
    // }
    captureImage: boolean;

    start(camera: Camera): void;
    stop(): void;
    scan(): null | { content: any, image: any };
    addListener(name: string, callback: () => any): void;

  }

  export class Camera {
    id: string;
    name: string;
  }
}
