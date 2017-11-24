import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';

import { ProjectService } from './contracts/project.service'
import { PlanningPokerService } from './contracts/planning-poker.service'
import { ProjectBacklogService } from './contracts/project-backlog.service'
import { CrowdsaleService } from './contracts/crowdsale.service'

import { UserService } from './user.service';
import { WorkerService } from './worker.service';
import { JiraService } from './jira.service';
import { Web3Service } from './web3.service';
import { WalletStateService } from './wallet-state.service';

@NgModule({
  imports: [
    CommonModule,
    HttpModule
  ],
  declarations: [],
  providers: [
    ProjectService,
    PlanningPokerService,
    ProjectBacklogService,
    CrowdsaleService,

    UserService,
    WorkerService,
    JiraService,
    Web3Service,
    WalletStateService
  ]
})
export class CoreModule {}
