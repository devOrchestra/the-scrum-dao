import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router'

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app.routing.module';
import { LayoutModule } from './layout/layout.module';

import { Web3ResolverService } from './core/resolvers/web3-resolver.service';
import { WalletStateResolverService } from './core/resolvers/wallet-state-resolver.service';

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
    Web3ResolverService,
    WalletStateResolverService,
    Title,

    OwnerGuardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
