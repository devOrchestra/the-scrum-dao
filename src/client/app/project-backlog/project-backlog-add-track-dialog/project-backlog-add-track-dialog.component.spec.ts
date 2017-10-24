import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectBacklogAddTrackDialogComponent } from './project-backlog-add-track-dialog.component';

describe('ProjectBacklogAddTrackDialogComponent', () => {
  let component: ProjectBacklogAddTrackDialogComponent;
  let fixture: ComponentFixture<ProjectBacklogAddTrackDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectBacklogAddTrackDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectBacklogAddTrackDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
