import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterModule } from '@angular/router';
import { CupPreviewComponent } from '../cup-preview/cup-preview.component';
import { CommonModule } from '@angular/common';

interface Cup {
  id: string;
  name: string;
  modelUrl: string;  // Changed from imageUrl to modelUrl
  mtlUrl: string;
}

@Component({
  selector: 'app-catalog',
  imports: [RouterOutlet, CommonModule, RouterModule, CupPreviewComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
  standalone: true,
})

export class CatalogComponent {
  // Define your catalog of cups with modelUrl now.
  cups: Cup[] = [
    { id: 'cup1', name: 'Classic Mug', modelUrl: 'assets/models/Mug.obj', mtlUrl:'assets/models/Mug.mtl'},
    { id: 'cup2', name: 'Modern Cup', modelUrl: 'assets/models/Mug.obj', mtlUrl:'assets/models/Mug.mtl'},
    { id: 'cup3', name: 'Vintage Cup', modelUrl: 'assets/models/Mug.obj', mtlUrl:'assets/models/Mug.mtl'}
  ];

  constructor(private router: Router) {}

  goToEditor(cupId: string): void {
    this.router.navigate(['/editor', cupId]);
  }
}
