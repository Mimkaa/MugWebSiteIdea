import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CupPreviewComponent } from './cup-preview.component';

describe('CupPreviewComponent', () => {
  let component: CupPreviewComponent;
  let fixture: ComponentFixture<CupPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CupPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CupPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
