import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractableComponent } from './interactable.component';

describe('InteractableComponent', () => {
  let component: InteractableComponent;
  let fixture: ComponentFixture<InteractableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteractableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InteractableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
