import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningPokerComponent } from './planning-poker.component';

describe('PlanningPokerComponent', () => {
  let component: PlanningPokerComponent;
  let fixture: ComponentFixture<PlanningPokerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanningPokerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanningPokerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
