import { CupPreviewComponent } from '../cup-preview/cup-preview.component';
import { InteractableComponent } from '../interactable/interactable.component';
import { forwardRef } from '@angular/core';

export const BLOCK_MAP: Record<string, any> = {
  'cup_preview': CupPreviewComponent,
  'interactable':InteractableComponent
};