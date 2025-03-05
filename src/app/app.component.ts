import { Component, OnInit, AfterViewInit, ViewChild, ViewContainerRef, HostListener, NgZone } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterModule } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { CupPreviewComponent } from './cup-preview/cup-preview.component';
import { InteractableComponent } from './interactable/interactable.component';
import { DeveloperModeService } from '../developer-mode/developer-mode.service';
import { GreetingService } from '../greeting/greeting.service';
import { DevContextMenuComponent } from './dev-context-menu/dev-context-menu.component';
import { BLOCK_MAP } from './dynamic/block-map';
import { PageComponentService, PageComponent } from './page-component/page-component.service';

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
export class AppComponent implements OnInit, AfterViewInit {
  showRegistrationOnly = false;
  showHomeOnly = false;
  developerMode = false;
  greeting = '';

  // Flag to know if dynamic components are fully loaded.
  componentsLoaded = false;

  // The container into which dynamic components will be inserted.
  @ViewChild('dynamicContainer', { read: ViewContainerRef, static: true })
  dynamicContainer!: ViewContainerRef;

  // Variables to store the last mouse coordinates.
  lastMouseX = 0;
  lastMouseY = 0;

  constructor(
    private router: Router,
    private devModeService: DeveloperModeService,
    private greetingService: GreetingService,
    private pageComponentService: PageComponentService,
    private ngZone: NgZone
  ) {
    // Subscribe to developer mode changes.
    this.devModeService.developerMode$.subscribe(mode => {
      this.developerMode = mode;
      console.log('Developer mode is', this.developerMode ? 'ON' : 'OFF');
    });
  }

  ngOnInit(): void {
    // Set initial flags based on the current URL.
    this.showRegistrationOnly = (this.router.url === '/register');
    this.showHomeOnly = (this.router.url === '/home');

    // Listen for NavigationEnd events and reload dynamic components when the URL changes.
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        this.showRegistrationOnly = (url === '/register');
        this.showHomeOnly = (url === '/home');
        console.log('Navigation ended. New URL:', url);
        this.loadPageComponents(url);
      });
  }

  ngAfterViewInit(): void {
    // Initial load of dynamic components when the view is ready.
    this.loadPageComponents(this.router.url);
  }

  // Load all page components for a given URL.
  loadPageComponents(pageUrl: string): void {
    console.log('Loading page components for:', pageUrl);
    // Clear the container immediately and mark components as not loaded.
    this.dynamicContainer.clear();
    this.componentsLoaded = false;
    // Wait until Angular is stable (i.e. after change detection).
    this.ngZone.onStable.pipe(take(1)).subscribe(() => {
      this.pageComponentService.getPageComponentsByUrl(pageUrl).subscribe({
        next: (components: PageComponent[]) => {
          console.log('Loaded page components:', components);
          for (const compData of components) {
            // Lookup the dynamic component class from BLOCK_MAP.
            const componentClass = BLOCK_MAP[compData.componentType];
            if (!componentClass) {
              console.warn(`Component type "${compData.componentType}" not defined in BLOCK_MAP`);
              continue;
            }
            // Dynamically create the component.
            const componentRef = this.dynamicContainer.createComponent(componentClass);
            // Subscribe to the component's deactivate event to remove it when needed.
            (componentRef.instance as any).deactivate.subscribe(() => {
              console.log('Deactivation event received from component.');
              const index = this.dynamicContainer.indexOf(componentRef.hostView);
              if (index !== -1) {
                this.dynamicContainer.remove(index);
                console.log('Component removed from dynamic container.');
              }
            });
            // Set the instance's properties based on the retrieved data.
            (componentRef.instance as any).initialWidth = `${compData.width}px`;
            (componentRef.instance as any).initialHeight = `${compData.height}px`;
            (componentRef.instance as any).initialLeft = `${compData.posX}px`;
            (componentRef.instance as any).initialTop = `${compData.posY}px`;
            (componentRef.instance as any).uuid = compData.uuid;
            (componentRef.instance as any).myUrl = compData.pagePath;
            (componentRef.instance as any).componentType = compData.componentType;
            // Optionally, set additional properties (example for CupPreview).
            (componentRef.instance as any).cup = {
              id: 'cup-unique-id',
              name: 'My Hardcoded Cup',
              modelUrl: 'assets/models/Mug.obj',
              mtlUrl: 'assets/models/Mug.mtl',
              myUrl: pageUrl
            };
            console.log('Created dynamic component from saved data:', compData);
          }
          // Mark that components are now fully loaded.
          this.componentsLoaded = true;
        },
        error: (err) => {
          console.error('Error loading page components:', err);
        }
      });
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
    const componentClass = BLOCK_MAP[componentType];
    if (!componentClass) {
      console.warn(`Component type "${componentType}" is not defined in BLOCK_MAP`);
      return;
    }
    const componentRef = this.dynamicContainer.createComponent(componentClass);
    (componentRef.instance as any).cup = {
      id: 'cup-unique-id',
      name: 'My Hardcoded Cup',
      modelUrl: 'assets/models/Mug.obj',
      mtlUrl: 'assets/models/Mug.mtl',
      myUrl: this.router.url
    };
    (componentRef.instance as any).myUrl = this.router.url;
    console.log(`Assigned myUrl: ${(componentRef.instance as any).myUrl}`);
    // Subscribe to the component's deactivate event.
    (componentRef.instance as any).deactivate.subscribe(() => {
      console.log('Deactivation event received from component.');
      const index = this.dynamicContainer.indexOf(componentRef.hostView);
      if (index !== -1) {
        this.dynamicContainer.remove(index);
        console.log('Component removed from dynamic container.');
      }
    });
    setTimeout(() => {
      const instance: any = componentRef.instance;
      const pageComponentData: PageComponent = {
        width: instance.width,
        height: instance.height,
        posX: instance.x,
        posY: instance.y,
        pagePath: this.router.url,
        componentType: componentType,
        uuid: instance.uuid
      };
      console.log('Creating page component with data:', pageComponentData);
      this.pageComponentService.createPageComponent(pageComponentData).subscribe({
        next: (createdComponent) => {
          console.log('Page component created on backend:', createdComponent);
        },
        error: (error) => {
          console.error('Error creating page component on backend:', error);
        }
      });
    }, 100);
  }

  // Called when the dev context menu emits deleteComponentAction.
  handleDeleteComponent(): void {
    if (!this.componentsLoaded) {
      console.warn('Components are not fully loaded yet; deletion is not allowed.');
      return;
    }
    console.log('Parent handling delete component');
    const mouseX = this.lastMouseX;
    const mouseY = this.lastMouseY;
    let closestIndex = -1;
    let minDistance = Number.POSITIVE_INFINITY;
    const viewCount = this.dynamicContainer.length;
    for (let i = 0; i < viewCount; i++) {
      const viewRef = this.dynamicContainer.get(i);
      if (viewRef) {
        const rootNodes = (viewRef as any).rootNodes as HTMLElement[];
        if (rootNodes && rootNodes.length) {
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
