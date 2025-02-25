import {
  Component,
  ElementRef,
  HostListener,
  Renderer2,
  AfterViewInit,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter
} from '@angular/core';
import { DeveloperModeService } from '../../developer-mode/developer-mode.service';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import ResizeObserver from 'resize-observer-polyfill';

@Component({
  selector: 'app-interactable',
  standalone: true,
  templateUrl: './interactable.component.html',
  styleUrls: ['./interactable.component.css']
})
export class InteractableComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  // Inputs defined as strings (percentages or pixel values)
  @Input() initialLeft: string = "0%";
  @Input() initialTop: string = "0%";
  @Input() initialWidth: string = "200px";
  @Input() initialHeight: string = "150px";
  @Input() minWidth: string = "50px";
  @Input() minHeight: string = "50px";
  @Input() draggable: boolean = true;
  @Input() resizable: boolean = true;

  // Input for redirectUrl
  @Input() redirectUrl: string = '';

  // Input for the URL where this component should be active.
  @Input() myUrl: string = '/home';

  // Property to store the actual current URL
  public currentUrl: string = '/home';

  // Output event emitter to signal that the component should be removed
  @Output() deactivate: EventEmitter<void> = new EventEmitter<void>();

  protected container!: HTMLElement; // Reference to the .interactable div
  private isDragging = false;
  private isResizing = false;
  private startX = 0;
  private startY = 0;
  private startWidth = 0;
  private startHeight = 0;
  private startLeft = 0;
  private startTop = 0;
  
  private resizeObserver!: ResizeObserver;
  private devModeSubscription!: Subscription;
  private routerSubscription!: Subscription;
  
  // Local variable for developer mode (read from global service)
  protected developerMode: boolean = false;

  constructor(
    protected el: ElementRef,
    protected renderer2: Renderer2,
    protected devModeService: DeveloperModeService,
    protected router: Router
  ) {
    // Subscribe to developer mode changes.
    this.devModeSubscription = this.devModeService.developerMode$.subscribe(mode => {
      this.developerMode = mode;
      console.log('Developer mode in InteractableComponent is', this.developerMode ? 'ON' : 'OFF');
    });
  }

  ngOnInit(): void {
    // Set currentUrl from the router immediately.
    this.currentUrl = this.router.url;
    console.log('Initial currentUrl:', this.currentUrl);
    
    // Subscribe to router events to update currentUrl whenever navigation ends.
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.urlAfterRedirects;
        console.log('Current URL updated:', this.currentUrl);
        // If the current URL no longer matches the desired myUrl, emit the deactivate event.
        if (this.currentUrl !== this.myUrl) {
          console.log('URL mismatch detected, emitting deactivate event.');
          this.deactivate.emit();
        }
      });
  }

  ngAfterViewInit(): void {
    this.findContainerBase();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (this.container) {
      this.applyStyles();
    }
    if (changes['myUrl']) {
      console.log('myUrl changed to:', changes['myUrl'].currentValue);
    }
  }
  
  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.devModeSubscription) {
      this.devModeSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  public findContainerBase(): void {
    this.container = this.el.nativeElement.querySelector('.interactable');
    console.log('Container element:', this.container);
    
    // Only proceed if the container is defined
    if (!this.container) {
      console.warn('Container not found. Skipping applyStyles and resizeObserver setup.');
      return;
    }
    
    this.applyStyles();
    this.resizeObserver = new ResizeObserver(() => {
      this.updateSizeState();
    });
    this.resizeObserver.observe(this.container);
  }

  public updateSizeState(): void {
    console.log("Resized");
    // (Additional code to update state if needed.)
  }
  
  public getContainerSizeRelativeToScreen(): { width: string; height: string } {
    if (this.container) {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const widthPercent = (this.container.clientWidth / screenWidth) * 100;
      const heightPercent = (this.container.clientHeight / screenHeight) * 100;
      return {
        width: `${widthPercent.toFixed(2)}%`,
        height: `${heightPercent.toFixed(2)}%`
      };
    }
    return { width: '0%', height: '0%' };
  }

  private applyStyles(): void {
    if (!this.container) {
      return;
    }
    this.renderer2.setStyle(this.container, 'left', this.initialLeft);
    this.renderer2.setStyle(this.container, 'top', this.initialTop);
    this.renderer2.setStyle(this.container, 'width', this.initialWidth);
    this.renderer2.setStyle(this.container, 'height', this.initialHeight);
    this.startLeft = this.container.offsetLeft;
    this.startTop = this.container.offsetTop;
    this.startWidth = this.container.clientWidth;
    this.startHeight = this.container.clientHeight;
  }

  // Click handler: if not in developer mode and redirectUrl is provided, navigate.
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.developerMode && this.redirectUrl.trim() !== '') {
      console.log('Redirecting to:', this.redirectUrl);
      this.router.navigate([this.redirectUrl]);
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    // For debugging, log myUrl and currentUrl.
    console.log('myUrl:', this.myUrl, 'currentUrl:', this.currentUrl);
    
    if (!this.draggable || !this.developerMode) {
      return;
    }
    console.log('mousedown event:', event);
    if ((event.target as HTMLElement).classList.contains('resizer')) {
      console.log('Resizer clicked, skipping drag.');
      return;
    }
    this.isDragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startLeft = this.container.offsetLeft;
    this.startTop = this.container.offsetTop;
    console.log('Started dragging at:', { startX: this.startX, startY: this.startY, startLeft: this.startLeft, startTop: this.startTop });
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.developerMode) return;
    if (this.isDragging) {
      const deltaX = event.clientX - this.startX;
      const deltaY = event.clientY - this.startY;
      console.log('Dragging - delta:', { deltaX, deltaY });
      this.renderer2.setStyle(this.container, 'left', `${this.startLeft + deltaX}px`);
      this.renderer2.setStyle(this.container, 'top', `${this.startTop + deltaY}px`);
    } else if (this.isResizing && this.resizable) {
      const deltaX = event.clientX - this.startX;
      const deltaY = event.clientY - this.startY;
      const newWidth = this.startWidth + deltaX;
      const newHeight = this.startHeight + deltaY;
      console.log('Resizing - new dimensions:', { newWidth, newHeight });
      const minW = parseFloat(this.minWidth);
      const minH = parseFloat(this.minHeight);
      if (newWidth > minW) {
        this.renderer2.setStyle(this.container, 'width', `${newWidth}px`);
      }
      if (newHeight > minH) {
        this.renderer2.setStyle(this.container, 'height', `${newHeight}px`);
      }
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (!this.developerMode) return;
    if (this.isDragging) console.log('Mouse up - stopping drag.');
    if (this.isResizing) console.log('Mouse up - stopping resize.');
    this.isDragging = false;
    this.isResizing = false;
  }

  startResize(event: MouseEvent): void {
    if (!this.developerMode || !this.resizable) return;
    console.log('startResize triggered:', event);
    this.isResizing = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startWidth = this.container.clientWidth;
    this.startHeight = this.container.clientHeight;
    console.log('Started resizing at:', { startX: this.startX, startY: this.startY, startWidth: this.startWidth, startHeight: this.startHeight });
    event.preventDefault();
    event.stopPropagation();
  }
}
