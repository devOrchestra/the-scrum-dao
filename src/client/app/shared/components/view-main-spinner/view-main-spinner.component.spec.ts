import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMainSpinnerComponent } from './view-main-spinner.component';

describe('ViewMainSpinnerComponent', () => {
  let component: ViewMainSpinnerComponent;
  let fixture: ComponentFixture<ViewMainSpinnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewMainSpinnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewMainSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
