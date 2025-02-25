import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Input,
  HostListener,
  Renderer2,
  OnChanges,
  SimpleChanges,
  OnDestroy
} from '@angular/core';
import * as THREE from 'three';

// Import MTLLoader and OBJLoader from three/examples
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { InteractableComponent } from '../interactable/interactable.component';
import { DeveloperModeService } from '../../developer-mode/developer-mode.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cup-preview',
  templateUrl: './cup-preview.component.html',
  styleUrls: ['./cup-preview.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class CupPreviewComponent extends InteractableComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvasElement', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // Cup data (could include model URL or configuration)
  @Input() cup!: {
    id: string;
    name: string;
    modelUrl?: string;  // e.g. 'assets/models/cup.obj'
    mtlUrl?: string;    // e.g. 'assets/models/cup.mtl'
  };

  @Input() canvasWidth: string = '400px';  // default as a string
  @Input() canvasHeight: string = '300px'; // default as a string

  // three.js essentials
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private model!: THREE.Object3D;

  constructor(
    protected override el: ElementRef, 
    protected override renderer2: Renderer2,
    protected override devModeService: DeveloperModeService,
    protected override router: Router
  ) {
    super(el, renderer2, devModeService, router);
  }

  override updateSizeState(): void {
    // Ensure canvasRef and its nativeElement exist before updating
    if (!this.canvasRef || !this.canvasRef.nativeElement) {
      console.warn('updateSizeState: Canvas reference is not defined.');
      return;
    }
  
    // Get the container's size relative to the screen as percentage strings
    const containerRelativeSize = this.getContainerSizeRelativeToScreen();
    console.log("Container size relative to screen:", containerRelativeSize);
  
    // Parse the percentage strings and convert to a decimal (0-1)
    const widthFraction = parseFloat(containerRelativeSize.width) / 100;
    const heightFraction = parseFloat(containerRelativeSize.height) / 100;
  
    // Get screen dimensions (using window.innerWidth/innerHeight for the viewport)
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
  
    // Multiply the fraction by the screen dimensions to get pixel values
    const newCanvasWidthPx = screenWidth * widthFraction;
    const newCanvasHeightPx = screenHeight * heightFraction;
  
    // Update the canvas element's style to these pixel values
    this.canvasRef.nativeElement.style.width = `${newCanvasWidthPx}px`;
    this.canvasRef.nativeElement.style.height = `${newCanvasHeightPx}px`;
    console.log("Canvas size updated to:", newCanvasWidthPx, newCanvasHeightPx);
  
    // Update the Three.js renderer to match the new canvas size.
    this.resizeRendererToDisplaySize();
    console.log("Resized");
  }
  
  override ngAfterViewInit(): void {
    this.findContainerBase();
    if (typeof window !== 'undefined') {
      console.log('ngAfterViewInit: Initializing Three.js...');
      this.initThree();
      this.animate();
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.resizeRendererToDisplaySize();
  }

  private initThree(): void {
    // Ensure the canvas reference is available
    if (!this.canvasRef || !this.canvasRef.nativeElement) {
      console.warn('initThree: Canvas reference is undefined.');
      return;
    }
    console.log('initThree: Setting up renderer, scene, camera, lights...');

    // Get the native canvas element
    const canvasEl = this.canvasRef.nativeElement;

    // Create the renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasEl,
      alpha: true,
      antialias: true
    });

    // Set the renderer size based on the canvas’s current client size
    this.resizeRendererToDisplaySize();

    // Create the scene
    this.scene = new THREE.Scene();

    // Setup a perspective camera
    const width = canvasEl.clientWidth;
    const height = canvasEl.clientHeight;
    this.camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000);
    this.camera.position.set(0.5, 0.3, 0.5);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera.updateProjectionMatrix();

    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);

    // Load model (OBJ + MTL) or fallback geometry
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

  private resizeRendererToDisplaySize(): void {
    if (!this.renderer || !this.canvasRef || !this.canvasRef.nativeElement) {
      return;
    }
  
    const canvasEl = this.canvasRef.nativeElement;
    const width = canvasEl.clientWidth;
    const height = canvasEl.clientHeight;
  
    // Adjust renderer size
    this.renderer.setSize(width, height);
  
    // Also update camera if it exists
    if (this.camera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }

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

            // Make the model red (example)
            this.makeRedTexture();

            // Debug: Check bounding box
            const box = new THREE.Box3().setFromObject(this.model);
            console.log('loadObjAndMtl: Loaded model bounding box:', box);
          },
          (xhr) => {
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

  private createFallbackGeometry(): void {
    console.log('createFallbackGeometry: Creating fallback cylinder...');
    const geometry = new THREE.CylinderGeometry(1.5, 1.5, 3, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    this.model = new THREE.Mesh(geometry, material);
    this.scene.add(this.model);

    // Make the fallback geometry red (example)
    this.makeRedTexture();
  }

  private makeRedTexture(): void {
    if (!this.model) {
      console.warn('makeRedTexture: No model to color.');
      return;
    }
    this.model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.map = null;
        mat.color.set(0xff0000);
        mat.needsUpdate = true;
      }
    });
    console.log('makeRedTexture: Model material has been set to red.');
  }

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
          console.warn('changeTexture: No model found to apply the texture.');
        }
      },
      undefined,
      (err) => {
        console.error('changeTexture: Error loading texture:', err);
      }
    );
  }

  private animate = (): void => {
    // Ensure renderer and canvas are defined before proceeding
    if (!this.renderer || !this.canvasRef || !this.canvasRef.nativeElement) {
      return;
    }
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };
}
