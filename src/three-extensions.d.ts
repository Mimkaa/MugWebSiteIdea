// three-extensions.d.ts

declare module 'three/examples/jsm/loaders/MTLLoader' {
    import { Loader, LoadingManager } from 'three';
  
    export class MTLLoader extends Loader {
      constructor(manager?: LoadingManager);
      load(
        url: string,
        onLoad?: (materialCreator: MaterialCreator) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void
      ): void;
      preload(): void;
    }
  
    export class MaterialCreator {
      // ... define as many or as few of the methods as you need
      preload(): void;
    }
  }
  
  declare module 'three/examples/jsm/loaders/OBJLoader' {
    import { Loader, LoadingManager, Object3D } from 'three';
    import { MaterialCreator } from 'three/examples/jsm/loaders/MTLLoader'; // if you need cross references
  
    export class OBJLoader extends Loader {
      constructor(manager?: LoadingManager);
      setMaterials(materials: MaterialCreator): this;
      load(
        url: string,
        onLoad?: (object: Object3D) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void
      ): void;
      parse(data: string): Object3D;
    }
  }
  