import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CupPreviewComponent } from '../cup-preview/cup-preview.component';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CupPreviewComponent],
  templateUrl: './editor.component.html' // <-- Use templateUrl here
  // If you have a stylesheet, you can also add styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  cupId: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.cupId = this.route.snapshot.paramMap.get('cupId') || '';
    // Or subscribe if you expect the param to change over time:
    // this.route.paramMap.subscribe(params => {
    //   this.cupId = params.get('cupId') || '';
    // });
  }
}
