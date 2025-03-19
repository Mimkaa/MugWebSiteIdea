import { Component, OnInit, AfterViewInit, ViewChild, ViewContainerRef, HostListener, NgZone } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterModule, RouteReuseStrategy } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { CupPreviewComponent } from './cup-preview/cup-preview.component';
import { InteractableComponent } from './interactable/interactable.component';
import { DeveloperModeService } from '../developer-mode/developer-mode.service';
import { GreetingService } from '../greeting/greeting.service';
import { DevContextMenuComponent } from './dev-context-menu/dev-context-menu.component';
import { BLOCK_MAP } from './dynamic/block-map';
import { PageComponentService, PageComponent } from './page-component/page-component.service';
import { CustomReuseStrategy } from './custom-reuse-strategy'; // adjust the path if necessary

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
  styleUrls: ['./app.component.css'],
  providers: [{ provide: RouteReuseStrategy, useClass: CustomReuseStrategy }]
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
  
  // New property: stack of clicked dynamic component host views.
  clickedViews: any[] = [];

  constructor(
    private router: Router,
    private devModeService: DeveloperModeService,
    private greetingService: GreetingService,
    private pageComponentService: PageComponentService,
    private ngZone: NgZone
  ) {
    this.devModeService.developerMode$.subscribe(mode => {
      this.developerMode = mode;
      console.log('Developer mode is', this.developerMode ? 'ON' : 'OFF');
    });
  }

  ngOnInit(): void {
    this.showRegistrationOnly = (this.router.url === '/register');
    this.showHomeOnly = (this.router.url === '/home');
  
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        this.showRegistrationOnly = (url === '/register');
        this.showHomeOnly = (url === '/home');
        console.log('Navigation ended. New URL:', url);
        this.loadPageComponents(url);
      });
  
    window.addEventListener('popstate', () => {
      console.log('Popstate event detected, forcing component reload for route:', this.router.url);
      this.loadPageComponents(this.router.url);
    });
  }

  ngAfterViewInit(): void {
    this.loadPageComponents(this.router.url);
  }

  loadPageComponents(pageUrl: string): void {
    console.log('Loading page components for:', pageUrl);
    this.dynamicContainer.clear();
    this.componentsLoaded = false;
    // Clear the clicked views stack too.
    this.clickedViews = [];
    this.ngZone.onStable.pipe(take(1)).subscribe(() => {
      this.pageComponentService.getPageComponentsByUrl(pageUrl).subscribe({
        next: (components: PageComponent[]) => {
          console.log('Loaded page components:', components);
          for (const compData of components) {
            const componentClass = BLOCK_MAP[compData.componentType];
            if (!componentClass) {
              console.warn(`Component type "${compData.componentType}" not defined in BLOCK_MAP`);
              continue;
            }
            const componentRef = this.dynamicContainer.createComponent(componentClass);
            
            // Set the attribute on the native element so it can be later identified.
            componentRef.location.nativeElement.setAttribute('data-component-id', compData.uuid);
            
            // Attach a click listener to the .interactable element.
            const interactableElem = componentRef.location.nativeElement.querySelector('.interactable');
            if (interactableElem) {
              interactableElem.addEventListener('click', (event: Event) => {
                event.stopPropagation();
                const hostView = componentRef.hostView;
                // Remove if already in stack to update the order.
                const existingIndex = this.clickedViews.indexOf(hostView);
                if (existingIndex !== -1) {
                  this.clickedViews.splice(existingIndex, 1);
                }
                this.clickedViews.push(hostView);
                console.log('Dynamic component clicked. Click stack:', this.clickedViews);
              });
            } else {
              console.warn('No .interactable element found in dynamic component.');
            }
            
            (componentRef.instance as any).deactivate.subscribe(() => {
              console.log('Deactivation event received from component.');
              const index = this.dynamicContainer.indexOf(componentRef.hostView);
              if (index !== -1) {
                this.dynamicContainer.remove(index);
                console.log('Component removed from dynamic container.');
                // Also remove from the clicked stack if present.
                const pos = this.clickedViews.indexOf(componentRef.hostView);
                if (pos !== -1) {
                  this.clickedViews.splice(pos, 1);
                }
              }
            });
            (componentRef.instance as any).initialWidth = `${compData.width}px`;
            (componentRef.instance as any).initialHeight = `${compData.height}px`;
            (componentRef.instance as any).initialLeft = `${compData.posX}px`;
            (componentRef.instance as any).initialTop = `${compData.posY}px`;
            (componentRef.instance as any).uuid = compData.uuid;
            (componentRef.instance as any).myUrl = compData.pagePath;
            (componentRef.instance as any).componentType = compData.componentType;
            (componentRef.instance as any).cup = {
              id: 'cup-unique-id',
              name: 'My Hardcoded Cup',
              modelUrl: 'assets/models/Mug.obj',
              mtlUrl: 'assets/models/Mug.mtl',
              myUrl: pageUrl
            };
            console.log('Created dynamic component from saved data:', compData);
          }
          this.componentsLoaded = true;
        },
        error: (err) => {
          console.error('Error loading page components:', err);
        }
      });
    });
  }

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

  handleAddComponent(componentType: string): void {
    console.log('Parent handling add component of type:', componentType);
    const componentClass = BLOCK_MAP[componentType];
    if (!componentClass) {
      console.warn(`Component type "${componentType}" is not defined in BLOCK_MAP`);
      return;
    }
    const componentRef = this.dynamicContainer.createComponent(componentClass);
    
    // If the component instance doesn't have a uuid, assign one.
    const instance: any = componentRef.instance;
    if (!instance.uuid) {
      // Replace this with a proper UUID generator as needed.
      instance.uuid = 'new-generated-uuid-' + Date.now();
    }
    // Set the attribute on the host element.
    componentRef.location.nativeElement.setAttribute('data-component-id', instance.uuid);
    
    instance.cup = {
      id: 'cup-unique-id',
      name: 'My Hardcoded Cup',
      modelUrl: 'assets/models/Mug.obj',
      mtlUrl: 'assets/models/Mug.mtl',
      myUrl: this.router.url
    };
    instance.myUrl = this.router.url;
    console.log(`Assigned myUrl: ${instance.myUrl}`);
    
    (instance as any).deactivate.subscribe(() => {
      console.log('Deactivation event received from component.');
      const index = this.dynamicContainer.indexOf(componentRef.hostView);
      if (index !== -1) {
        this.dynamicContainer.remove(index);
        console.log('Component removed from dynamic container.');
        const pos = this.clickedViews.indexOf(componentRef.hostView);
        if (pos !== -1) {
          this.clickedViews.splice(pos, 1);
        }
      }
    });
    setTimeout(() => {
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

  deleteDynamicComponentById(componentId: string): void {
    const viewCount = this.dynamicContainer.length;
    let found = false;
    for (let i = 0; i < viewCount; i++) {
      const viewRef = this.dynamicContainer.get(i);
      if (viewRef) {
        // Try to access the native element from the view.
        const nativeElem = (viewRef as any).rootNodes[0];
        if (nativeElem && nativeElem.getAttribute('data-component-id') === componentId) {
          console.log(`Deleting dynamic component with id: ${componentId} at index ${i}`);
          this.dynamicContainer.remove(i);
          found = true;
          break;
        }
      }
    }
    if (!found) {
      console.warn(`Dynamic component with id ${componentId} not found.`);
    } else {
      // Call the service to delete the page component by UUID.
      this.pageComponentService.deletePageComponentByUuid(componentId).subscribe({
        next: () => {
          console.log(`Successfully deleted page component with uuid ${componentId} from backend.`);
        },
        error: (error) => {
          console.error(`Error deleting page component with uuid ${componentId} from backend:`, error);
        }
      });
    }
  }
  
}
