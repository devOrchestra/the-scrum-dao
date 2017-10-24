import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintsComponent } from './sprints.component';

describe('SprintsComponent', () => {
  let component: SprintsComponent;
  let fixture: ComponentFixture<SprintsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SprintsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SprintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
