import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration-form',
  standalone: true, // This marks the component as standalone.
  imports: [CommonModule, FormsModule], // Import CommonModule for directives like *ngIf and FormsModule for template-driven forms.
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.css']
})
export class RegistrationFormComponent {
  constructor(private router: Router) {}

  // This method is called when the form is submitted.
  onSubmit(form: NgForm): void {
    if (form.valid) {
      console.log('Registration Data:', form.value);
      // Navigate to /home then reload the page
      this.router.navigate(['/home']).then(() => {
        window.location.reload();
      });
    } else {
      console.log('Form is invalid.');
    }
  }
}
