import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ShellComponent} from './layout/shell/shell.component';
import {SettingsComponent} from './settings/settings.component';
import {ProjectBacklogComponent} from './project-backlog/project-backlog.component';
import {TaskListComponent} from './task-list/task-list.component';
import {ContributorListComponent} from './contributor-list/contributor-list.component';
import {CrowdsaleComponent} from './crowdsale/crowdsale.component';

import {WorkersResolverService} from './core/resolvers/workers-resolver.service';
import {JiraIssuesResolverService} from './core/resolvers/jira-issues-resolver.service';
import {Web3ResolverService} from './core/resolvers/web3-resolver.service';

import {OwnerGuardService} from './owner-guard.service'

const routes: Routes = [
  {
    path: 'app',
    component: ShellComponent,
    resolve: {
      connection: Web3ResolverService,
      workers: WorkersResolverService,
      issues: JiraIssuesResolverService
    },
    children: [
      {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [OwnerGuardService]
      },
      {
        path: 'project-backlog',
        component: ProjectBacklogComponent
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
        path: 'crowdsale',
        component: CrowdsaleComponent
      }
    ],
  },
  {
    path: '',
    redirectTo: 'app/contributor-list',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  declarations: []
})
export class AppRoutingModule {
}
