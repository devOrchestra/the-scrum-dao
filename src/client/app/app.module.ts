import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router'

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app.routing.module';
import { LayoutModule } from './layout/layout.module';

import { WorkersResolverService } from './core/resolvers/workers-resolver.service'

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
    WorkersResolverService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
