import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

import { ShellComponent } from './shell/shell.component';
import { HeaderComponent } from './header/header.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { SettingsComponent } from '../settings/settings.component';
import { ProjectBacklogComponent } from '../project-backlog/project-backlog.component';
import { ProjectBacklogAddTrackDialogComponent } from '../project-backlog/project-backlog-add-track-dialog/project-backlog-add-track-dialog.component';
import { PlanningPokerComponent } from '../planning-poker/planning-poker.component';
import { ContributorListComponent } from '../contributor-list/contributor-list.component';
import { CrowdsaleComponent } from '../crowdsale/crowdsale.component';
import { CrowdsaleAddOrderDialogComponent } from '../crowdsale/crowdsale-add-order-dialog/crowdsale-add-order-dialog.component';
import { CrowdsaleAddBuyOrderErrorDialogComponent } from '../crowdsale/crowdsale-add-buy-order-error-dialog/crowdsale-add-buy-order-error-dialog.component';
import { CrowdsaleCanNotTradeOrderDialogComponent } from '../crowdsale/crowdsale-can-not-trade-order-dialog/crowdsale-can-not-trade-order-dialog.component';
import { ChatbroComponent } from './header/chatbro/chatbro.component';
import { WalletComponent } from './header/wallet/wallet.component'
import { LinkToJiraComponent } from './header/link-to-jira/link-to-jira.component';
import { TotalSupplyComponent } from './header/total-supply/total-supply.component'
import { ConnectionStateComponent } from './connection-state/connection-state.component';

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
    SettingsComponent,
    ProjectBacklogComponent,
    ProjectBacklogAddTrackDialogComponent,
    PlanningPokerComponent,
    ContributorListComponent,
    CrowdsaleComponent,
    CrowdsaleAddOrderDialogComponent,
    CrowdsaleAddBuyOrderErrorDialogComponent,
    CrowdsaleCanNotTradeOrderDialogComponent,
    WalletComponent,
    TotalSupplyComponent,
    ConnectionStateComponent,
    ChatbroComponent,
    LinkToJiraComponent
  ],
  entryComponents: [
    ProjectBacklogAddTrackDialogComponent,
    CrowdsaleAddOrderDialogComponent,
    CrowdsaleAddBuyOrderErrorDialogComponent,
    CrowdsaleCanNotTradeOrderDialogComponent
  ]
})
export class LayoutModule { }
