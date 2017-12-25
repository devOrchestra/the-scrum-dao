import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningPokerTaskItemComponent } from './planning-poker-task-item.component';

describe('PlanningPokerTaskItemComponent', () => {
  let component: PlanningPokerTaskItemComponent;
  let fixture: ComponentFixture<PlanningPokerTaskItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanningPokerTaskItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanningPokerTaskItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
