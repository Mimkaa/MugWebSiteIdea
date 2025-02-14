import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { CupPreviewComponent } from './cup-preview/cup-preview.component';
import { InteractableComponent } from './interactable/interactable.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule, CupPreviewComponent, InteractableComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showRegistrationOnly = false;
  showHomeOnly = false;
  
  
  constructor(private router: Router) {}

  ngOnInit(): void 
  {
    // Set the flag based on the current route
    this.showRegistrationOnly = (this.router.url === '/register');
    this.showHomeOnly = (this.router.url === '/home');

    // Listen to NavigationEnd just once
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Check the final URL
      const url = event.urlAfterRedirects;

      this.showRegistrationOnly = (url === '/register');
      this.showHomeOnly = (url === '/home');
    });
  }
 
}
