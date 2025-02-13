import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import * as THREE from 'three';

// Import MTLLoader and OBJLoader
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

@Component({
  selector: 'app-cup-preview',
  templateUrl: './cup-preview.component.html',
  styleUrls: ['./cup-preview.component.css'],
  standalone: true
})
export class CupPreviewComponent implements OnInit, AfterViewInit {
  @ViewChild('canvasElement', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  // Cup data (could include model URL or configuration)
  @Input() cup!: { id: string; name: string; modelUrl?: string; mtlUrl?: string };

  // three.js essentials
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private renderer!: THREE.WebGLRenderer;
  private model!: THREE.Object3D;

  constructor() {}

  ngOnInit(): void {
    // Debugging logs for input data
    console.log('CupPreviewComponent initialized with cup:', this.cup);
  }

  ngAfterViewInit(): void {
    // Run only on the client side
    if (typeof window !== 'undefined') {
      console.log('ngAfterViewInit: Initializing Three.js...');
      this.initThree();
      this.animate();
    }
  }

  private initThree(): void {
    console.log('initThree: Setting up renderer, scene, camera, lights...');

    // Create the renderer and set its size
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(200, 200);

    // Create the scene
    this.scene = new THREE.Scene();

    // Setup a perspective camera
    this.camera = new THREE.PerspectiveCamera(30, 200 / 200, 0.1, 1000);
    this.camera.position.set(0.5, 0.3, 0.5);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();

    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);

    // Decide which model to load
    if (this.cup.modelUrl && this.cup.mtlUrl) {
      console.log('initThree: Loading OBJ + MTL...', this.cup.modelUrl, this.cup.mtlUrl);
      this.loadObjAndMtl(this.cup.modelUrl, this.cup.mtlUrl);
    } else {
      console.log(
        'initThree: No modelUrl/mtlUrl provided, using fallback geometry.',
        this.cup.modelUrl,
        this.cup.mtlUrl
      );
      this.createFallbackGeometry();
    }
  }

  /**
   * Load OBJ + MTL files, then add the loaded model to the scene.
   */
  private loadObjAndMtl(objPath: string, mtlPath: string): void {
    console.log('loadObjAndMtl: Starting MTLLoader for:', mtlPath);

    const mtlLoader = new MTLLoader();
    mtlLoader.load(
      mtlPath,
      (materials) => {
        console.log('loadObjAndMtl: MTL loaded successfully:', materials);
        materials.preload();

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);

        console.log('loadObjAndMtl: Starting OBJLoader for:', objPath);
        objLoader.load(
          objPath,
          (obj) => {
            console.log('loadObjAndMtl: OBJ loaded successfully:', obj);

            this.model = obj;
            this.scene.add(this.model);

            // Make the model red
            this.makeRedTexture();

            // Debug: Check bounding box
            const box = new THREE.Box3().setFromObject(this.model);
            console.log('loadObjAndMtl: Loaded model bounding box:', box);
          },
          (xhr) => {
            // Progress event for OBJ
            const percent = (xhr.loaded / xhr.total) * 100;
            console.log(`OBJ loading progress: ${percent.toFixed(2)}%`);
          },
          (error) => {
            console.error('Error loading OBJ model:', error);
            console.log('Using fallback geometry instead.');
            this.createFallbackGeometry();
          }
        );
      },
      (xhr) => {
        // Progress event for MTL
        const percent = (xhr.loaded / xhr.total) * 100;
        console.log(`MTL loading progress: ${percent.toFixed(2)}%`);
      },
      (error) => {
        console.error('Error loading MTL file:', error);
        console.log('Using fallback geometry instead.');
        this.createFallbackGeometry();
      }
    );
  }

  /**
   * Create a simple fallback mesh (e.g. a "cup" cylinder).
   */
  private createFallbackGeometry(): void {
    console.log('createFallbackGeometry: Creating fallback cylinder...');
    const geometry = new THREE.CylinderGeometry(1.5, 1.5, 3, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    this.model = new THREE.Mesh(geometry, material);
    this.scene.add(this.model);

    // Make the fallback geometry red
    this.makeRedTexture();
  }

  /**
   * NEW FUNCTION: Make the model's material red.
   * This will override any existing color or texture.
   */
  private makeRedTexture(): void {
    if (!this.model) {
      console.warn('makeRedTexture: No model to color.');
      return;
    }
    this.model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        // If there's a texture map, you can remove it:
        // mat.map = null; 
        mat.color.set(0xff0000);
        mat.needsUpdate = true;
      }
    });
    console.log('makeRedTexture: Model material has been set to red.');
  }

  /**
   * Change the texture of the loaded model or fallback geometry.
   * This will assign the texture as the 'map' for each MeshStandardMaterial in the model.
   */
  changeTexture(textureUrl: string): void {
    console.log('changeTexture: Loading texture from:', textureUrl);
    const loader = new THREE.TextureLoader();
    loader.load(
      textureUrl,
      (texture) => {
        if (this.model) {
          this.model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.map = texture;
              mat.needsUpdate = true;
            }
          });
          console.log('changeTexture: Texture applied successfully.');
        } else {
          console.warn('changeTexture: No main model found to apply the texture.');
        }
      },
      undefined,
      (err) => {
        console.error('changeTexture: Error loading texture:', err);
      }
    );
  }

  /**
   * Animation loop
   */
  private animate = (): void => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };
}
