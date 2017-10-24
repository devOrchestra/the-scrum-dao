import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

import { ShellComponent } from './shell/shell.component';
import { HeaderComponent } from './header/header.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { SettingsComponent } from '../settings/settings.component';
import { ProjectBacklogComponent } from '../project-backlog/project-backlog.component';
import { ProjectBacklogAddTrackDialogComponent } from '../project-backlog/project-backlog-add-track-dialog/project-backlog-add-track-dialog.component';
import { SprintBacklogComponent } from '../sprint-backlog/sprint-backlog.component';
import { MasterComponent } from '../master/master.component';
import { TaskListComponent } from '../task-list/task-list.component';
import { SprintsComponent } from '../sprints/sprints.component';

import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ],
  declarations: [
    ShellComponent,
    HeaderComponent,
    SidenavComponent,
    DashboardComponent,
    SettingsComponent,
    ProjectBacklogComponent,
    ProjectBacklogAddTrackDialogComponent,
    SprintBacklogComponent,
    MasterComponent,
    TaskListComponent,
    SprintsComponent
  ],
  entryComponents: [ProjectBacklogAddTrackDialogComponent]
})
export class LayoutModule { }
