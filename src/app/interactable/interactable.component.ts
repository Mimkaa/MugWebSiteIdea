import { Component, ElementRef, HostListener, Renderer2, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-interactable',
  standalone: true,
  templateUrl: './interactable.component.html',
  styleUrls: ['./interactable.component.css']
})
export class InteractableComponent implements AfterViewInit, OnChanges {
  // Inputs defined as strings (you can use percentages or pixel values)
  @Input() initialLeft: string = "0%";
  @Input() initialTop: string = "0%";
  @Input() initialWidth: string = "200px";
  @Input() initialHeight: string = "150px";
  @Input() minWidth: string = "50px";
  @Input() minHeight: string = "50px";
  @Input() draggable: boolean = true;
  @Input() resizable: boolean = true;

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
  
  constructor(protected el: ElementRef, protected renderer2: Renderer2) {}

  ngAfterViewInit(): void {
    this.findContainerBase();
  }

  public findContainerBase(): void {
    this.container = this.el.nativeElement.querySelector('.interactable');
    console.log('Container element:', this.container);
    this.applyStyles();
    this.resizeObserver = new ResizeObserver(() => {
      this.updateSizeState();
    });
    this.resizeObserver.observe(this.container);
  }

  public updateSizeState(): void {
   console.log("Resized");
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

  
  ngOnChanges(changes: SimpleChanges): void {
    if (this.container) {
      this.applyStyles();
    }
  }

  // Apply the initial styles from the string inputs directly.
  private applyStyles(): void {
    // Set the styles based on the input values
    this.renderer2.setStyle(this.container, 'left', this.initialLeft);
    this.renderer2.setStyle(this.container, 'top', this.initialTop);
    this.renderer2.setStyle(this.container, 'width', this.initialWidth);
    this.renderer2.setStyle(this.container, 'height', this.initialHeight);
  
    // Update the internal state variables based on the applied styles.
    // Note: If you’re using percentages, these will be computed as pixels.
    this.startLeft = this.container.offsetLeft;
    this.startTop = this.container.offsetTop;
    this.startWidth = this.container.clientWidth;
    this.startHeight = this.container.clientHeight;
  }

  // When mouse is pressed down (except on the resizer)
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (!this.draggable) return;

    console.log('mousedown event:', event);
    // Check if resizer was clicked; if so, skip dragging.
    if ((event.target as HTMLElement).classList.contains('resizer')) {
      console.log('Resizer clicked, skipping drag.');
      return;
    }
    this.isDragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    // Capture the computed pixel values for left and top
    this.startLeft = this.container.offsetLeft;
    this.startTop = this.container.offsetTop;
    console.log('Started dragging at:', { startX: this.startX, startY: this.startY, startLeft: this.startLeft, startTop: this.startTop });
    event.preventDefault();
  }

  // Handle moving or resizing on mouse move
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
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
      // For minWidth/minHeight, convert them to numbers (assumes "50px" format)
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

  // Stop dragging/resizing when mouse is released
  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.isDragging) console.log('Mouse up - stopping drag.');
    if (this.isResizing) console.log('Mouse up - stopping resize.');
    this.isDragging = false;
    this.isResizing = false;
  }

  // Called when resizing starts (from the template)
  startResize(event: MouseEvent): void {
    if (!this.resizable) return;

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
