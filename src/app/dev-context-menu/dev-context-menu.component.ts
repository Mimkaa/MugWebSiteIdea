import { Component, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BLOCK_MAP } from '../dynamic/block-map';

@Component({
  standalone: true,
  selector: 'app-dev-context-menu',
  templateUrl: './dev-context-menu.component.html',
  styleUrls: ['./dev-context-menu.component.css'],
  imports: [CommonModule]
})
export class DevContextMenuComponent {
  showContextMenu = false;
  menuX = 0;
  menuY = 0;
  availableComponents: string[] = Object.keys(BLOCK_MAP);
  
  // New property to store the ID of the component on which the context menu was called.
  contextMenuComponentId: string | null = null;

  @Output() addComponentAction = new EventEmitter<string>();
  @Output() deleteComponentAction = new EventEmitter<string>(); // Emit the id of the component to delete

  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
    this.menuX = event.clientX;
    this.menuY = event.clientY;
    
    // Attempt to find the closest element with a data-component-id attribute.
    const target = event.target as HTMLElement;
    const componentElem = target.closest('[data-component-id]');
    if (componentElem) {
      // Store the id for later use.
      this.contextMenuComponentId = componentElem.getAttribute('data-component-id');
      console.log('Context menu activated on component with id:', this.contextMenuComponentId);
    } else {
      this.contextMenuComponentId = null;
      console.log('Context menu activated, but no component id found.');
    }
    
    this.showContextMenu = true;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.showContextMenu = false;
  }

  addComponent(componentType: string) {
    // Emit the event along with the componentType.
    this.addComponentAction.emit(componentType);
    this.showContextMenu = false;
  }

  deleteComponent() {
    // Emit the delete event along with the memorized component id.
    if (this.contextMenuComponentId) {
      this.deleteComponentAction.emit(this.contextMenuComponentId);
      console.log('Emitting delete for component id:', this.contextMenuComponentId);
    } else {
      console.warn('No component id available to delete.');
    }
    this.showContextMenu = false;
  }
}
