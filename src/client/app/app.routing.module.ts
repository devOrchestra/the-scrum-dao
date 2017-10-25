import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ShellComponent} from './layout/shell/shell.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {SettingsComponent} from './settings/settings.component';
import {ProjectBacklogComponent} from './project-backlog/project-backlog.component';
import {SprintBacklogComponent} from './sprint-backlog/sprint-backlog.component';
import {MasterComponent} from './master/master.component';
import {TaskListComponent} from './task-list/task-list.component';
import {ContributorListComponent} from './contributor-list/contributor-list.component';
import {SprintsComponent} from './sprints/sprints.component';
import {AuthGuard} from './auth-guard.service'

const routes: Routes = [
  {
    path: 'app',
    component: ShellComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: 'project-backlog',
        component: ProjectBacklogComponent
      },
      {
        path: 'sprint-backlog',
        component: SprintBacklogComponent
      },
      {
        path: 'master',
        component: MasterComponent
      },
      {
        path: 'task-list',
        component: TaskListComponent
      },
      {
        path: 'contributor-list',
        component: ContributorListComponent
      },
      {
        path: 'sprints',
        component: SprintsComponent
      }
    ]
  },
  {
    path: '',
    redirectTo: '/sign-in',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  declarations: [],
  providers: [AuthGuard]
})
export class AppRoutingModule {
}
