import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectBacklogTaskItemComponent } from './project-backlog-task-item.component';

describe('ProjectBacklogTaskItemComponent', () => {
  let component: ProjectBacklogTaskItemComponent;
  let fixture: ComponentFixture<ProjectBacklogTaskItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectBacklogTaskItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectBacklogTaskItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
