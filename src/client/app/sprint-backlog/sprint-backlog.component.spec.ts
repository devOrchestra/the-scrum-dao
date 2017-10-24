import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintBacklogComponent } from './sprint-backlog.component';

describe('SprintBacklogComponent', () => {
  let component: SprintBacklogComponent;
  let fixture: ComponentFixture<SprintBacklogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SprintBacklogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SprintBacklogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
