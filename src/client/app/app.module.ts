import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router'

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app.routing.module';
import { LayoutModule } from './layout/layout.module';

import { WorkersResolverService } from './core/resolvers/workers-resolver.service'
import { JiraIssuesResolverService } from './core/resolvers/jira-issues-resolver.service';
import { Web3ResolverService } from './core/resolvers/web3-resolver.service';
import { WalletStateResolverService } from './core/resolvers/wallet-state-resolver.service';
import { OrdersResolverService } from './core/resolvers/orders-resolver.service';

import { OwnerGuardService } from './owner-guard.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,

    CoreModule,
    AppRoutingModule,
    LayoutModule
  ],
  providers: [
    WorkersResolverService,
    JiraIssuesResolverService,
    Web3ResolverService,
    WalletStateResolverService,
    OrdersResolverService,
    Title,

    OwnerGuardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
