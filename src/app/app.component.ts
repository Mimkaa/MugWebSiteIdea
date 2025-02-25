import { Component, OnInit, ViewChild, ViewContainerRef, HostListener } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { CupPreviewComponent } from './cup-preview/cup-preview.component';
import { InteractableComponent } from './interactable/interactable.component';
import { DeveloperModeService } from '../developer-mode/developer-mode.service';
import { GreetingService } from '../greeting/greeting.service';
import { DevContextMenuComponent } from './dev-context-menu/dev-context-menu.component';
import { BLOCK_MAP } from './dynamic/block-map';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    RouterModule,
    CupPreviewComponent,
    InteractableComponent,
    DevContextMenuComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showRegistrationOnly = false;
  showHomeOnly = false;
  developerMode = false;
  greeting = '';

  // The container into which dynamic components will be inserted.
  @ViewChild('dynamicContainer', { read: ViewContainerRef, static: true })
  dynamicContainer!: ViewContainerRef;

  // Variables to store the last mouse coordinates.
  lastMouseX: number = 0;
  lastMouseY: number = 0;

  constructor(
    private router: Router,
    private devModeService: DeveloperModeService,
    private greetingService: GreetingService
  ) {
    // Subscribe to developer mode changes.
    this.devModeService.developerMode$.subscribe(mode => {
      this.developerMode = mode;
      console.log('Developer mode is', this.developerMode ? 'ON' : 'OFF');
    });
  }

  ngOnInit(): void {
    // Set flags based on the current route.
    this.showRegistrationOnly = (this.router.url === '/register');
    this.showHomeOnly = (this.router.url === '/home');

    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        this.showRegistrationOnly = (url === '/register');
        this.showHomeOnly = (url === '/home');
      });
  }

  // Capture mouse clicks to store the last mouse coordinates.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
  }

  toggleDeveloperMode(): void {
    this.devModeService.toggleDeveloperMode();
  }

  sendGreeting(): void {
    this.greetingService.getGreeting().subscribe({
      next: (data: string) => {
        this.greeting = data;
        console.log('Greeting from backend:', data);
      },
      error: (error) => {
        console.error('Error fetching greeting:', error);
      }
    });
  }

  // Called when the dev context menu emits addComponentAction.
  handleAddComponent(componentType: string): void {
    console.log('Parent handling add component of type:', componentType);

    // 1) Lookup the component class from your block map.
    const componentClass = BLOCK_MAP[componentType];
    if (!componentClass) {
      console.warn(`Component type "${componentType}" is not defined in BLOCK_MAP`);
      return;
    }

    // 2) Dynamically create the component.
    const componentRef = this.dynamicContainer.createComponent(componentClass);

    // 3) Hard-code the modelUrl/mtlUrl and set myUrl on the new component.
    (componentRef.instance as any).cup = {
      id: 'cup-unique-id',
      name: 'My Hardcoded Cup',
      modelUrl: 'assets/models/Mug.obj',
      mtlUrl: 'assets/models/Mug.mtl',
      myUrl: this.router.url
    };
    (componentRef.instance as any).myUrl = this.router.url;
    console.log(`Assigned myUrl: ${(componentRef.instance as any).myUrl}`);

    // 4) Subscribe to the deactivate event from the dynamic component.
    (componentRef.instance as any).deactivate.subscribe(() => {
      console.log('Deactivation event received from component.');
      const index = this.dynamicContainer.indexOf(componentRef.hostView);
      if (index !== -1) {
        this.dynamicContainer.remove(index);
        console.log('Component removed from dynamic container.');
      }
    });
  }

  // Called when the dev context menu emits deleteComponentAction.
  handleDeleteComponent(): void {
    console.log('Parent handling delete component');
    
    // Ensure we have valid mouse coordinates.
    const mouseX = this.lastMouseX;
    const mouseY = this.lastMouseY;
    
    let closestIndex = -1;
    let minDistance = Number.POSITIVE_INFINITY;
    
    const viewCount = this.dynamicContainer.length;
    // Loop through each dynamic component's view.
    for (let i = 0; i < viewCount; i++) {
      const viewRef = this.dynamicContainer.get(i);
      if (viewRef) {
        // Get the root DOM nodes of the view.
        const rootNodes = (viewRef as any).rootNodes as HTMLElement[];
        if (rootNodes && rootNodes.length) {
          // For each node, compute the center and distance to the mouse.
          for (const node of rootNodes) {
            if (node instanceof HTMLElement) {
              const rect = node.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const dx = mouseX - centerX;
              const dy = mouseY - centerY;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
              }
            }
          }
        }
      }
    }
    
    if (closestIndex !== -1) {
      console.log(`Closest dynamic component found at index ${closestIndex} (distance: ${minDistance.toFixed(2)}). Removing it.`);
      this.dynamicContainer.remove(closestIndex);
    } else {
      console.warn('No dynamic component found near the mouse.');
    }
  }
  
}
