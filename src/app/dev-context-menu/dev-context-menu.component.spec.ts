import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevContextMenuComponent } from './dev-context-menu.component';

describe('DevContextMenuComponent', () => {
  let component: DevContextMenuComponent;
  let fixture: ComponentFixture<DevContextMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevContextMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
