import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';

import { AuthService } from './auth.service';
import { DataService } from './data.service';
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
    AuthService,
    DataService,
    UserService,
    WorkerService,
    JiraService,
    Web3Service,
    WalletStateService
  ]
})
export class CoreModule {}
