import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { CupPreviewComponent } from './cup-preview/cup-preview.component';

interface Cup {
  id: string;
  name: string;
  modelUrl: string;  // Changed from imageUrl to modelUrl
  mtlUrl: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule, CupPreviewComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showRegistrationOnly = false;
  
  // Define your catalog of cups with modelUrl now.
  cups: Cup[] = [
    { id: 'cup1', name: 'Classic Mug', modelUrl: 'assets/models/Mug.obj', mtlUrl:'assets/models/Mug.mtl'},
    { id: 'cup2', name: 'Modern Cup', modelUrl: 'assets/models/Mug.obj', mtlUrl:'assets/models/Mug.mtl'},
    { id: 'cup3', name: 'Vintage Cup', modelUrl: 'assets/models/Mug.obj', mtlUrl:'assets/models/Mug.mtl'}
  ];
  
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Set the flag based on the current route
    this.showRegistrationOnly = this.router.url === '/register';

    // Subscribe to router events to update the flag when the route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showRegistrationOnly = (event.urlAfterRedirects === '/register');
    });
  }

  // Called when a cup in the catalog is clicked.
  // Navigates to the editor route with the cup's id as a parameter.
  goToEditor(cupId: string): void {
    this.router.navigate(['/editor', cupId]);
  }
}
