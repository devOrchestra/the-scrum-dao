import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';

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
    UserService,
    WorkerService,
    JiraService,
    Web3Service,
    WalletStateService
  ]
})
export class CoreModule {}
