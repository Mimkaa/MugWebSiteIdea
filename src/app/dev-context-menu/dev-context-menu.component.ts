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

  @Output() addComponentAction = new EventEmitter<string>();
  @Output() deleteComponentAction = new EventEmitter<void>();

  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
    this.menuX = event.clientX;
    this.menuY = event.clientY;
    this.showContextMenu = true;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.showContextMenu = false;
  }

  addComponent(componentType: string) {
    // Emit the event instead of directly handling it here.
    this.addComponentAction.emit(componentType);
    this.showContextMenu = false;
  }

  deleteComponent() {
    // Emit the delete event to let the parent decide what to do.
    this.deleteComponentAction.emit();
    this.showContextMenu = false;
  }
}
