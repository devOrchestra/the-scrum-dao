import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';

import { ProjectService } from './contract-calls/project.service'
import { PlanningPokerService } from './contract-calls/planning-poker.service'
import { ProjectBacklogService } from './contract-calls/project-backlog.service'
import { CrowdsaleService } from './contract-calls/crowdsale.service'

import { UserService } from './user.service';
import { WorkerService } from './worker.service';
import { JiraService } from './jira.service';
import { Web3Service } from './web3.service';
import { WalletStateService } from './wallet-state.service';
import { ChatbroService } from './chatbro.service';

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
    WalletStateService,
    ChatbroService
  ]
})
export class CoreModule {}
