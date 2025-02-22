import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
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

  // Because the container is ALWAYS in the DOM, we can set static = true
  @ViewChild('dynamicContainer', { read: ViewContainerRef, static: true })
  dynamicContainer!: ViewContainerRef;

  constructor(
    private router: Router,
    private devModeService: DeveloperModeService,
    private greetingService: GreetingService
  ) {
    // Subscribe to developer mode changes
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

 // Called when the dev context menu emits addComponentAction
 handleAddComponent(componentType: string): void {
  console.log('Parent handling add component of type:', componentType);

  // 1) Lookup the component class from your block map
  const componentClass = BLOCK_MAP[componentType];
  if (!componentClass) {
    console.warn(`Component type "${componentType}" is not defined in BLOCK_MAP`);
    return;
  }

  // 2) Dynamically create the component
  const componentRef = this.dynamicContainer.createComponent(componentClass);

  // 3) Hard-code the modelUrl/mtlUrl by casting the instance to any
  (componentRef.instance as any).cup = {
    id: 'cup-unique-id',
    name: 'My Hardcoded Cup',
    modelUrl: 'assets/models/Mug.obj',
    mtlUrl: 'assets/models/Mug.mtl'
  };
}


  

  // Called when the dev context menu emits deleteComponentAction
  handleDeleteComponent(): void {
    console.log('Parent handling delete component');
    // Implement your logic for component removal if needed
  }
}
