import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CdkTableModule } from '@angular/cdk';

import 'hammerjs';
import {FlexLayoutModule} from '@angular/flex-layout'
import { MaterialModule, MdNativeDateModule } from '@angular/material'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdMenuModule, MdButtonModule, MdToolbarModule, MdCardModule, MdSidenavModule, MdInputModule,
  MdDialogModule, MdSelectModule} from '@angular/material';

import {OrderContributorsByBalancePipe} from './pipes/orderContributorsByBalancePipe'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CdkTableModule,

    FlexLayoutModule,
    MaterialModule,
    MdNativeDateModule,
    BrowserAnimationsModule,

    MdMenuModule,
    MdButtonModule,
    MdToolbarModule,
    MdCardModule,
    MdSidenavModule,
    MdInputModule,
    MdDialogModule,
    MdSelectModule
  ],
  declarations: [
    OrderContributorsByBalancePipe
  ],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CdkTableModule,

    FlexLayoutModule,
    MaterialModule,
    MdNativeDateModule,
    BrowserAnimationsModule,

    MdMenuModule,
    MdButtonModule,
    MdToolbarModule,
    MdCardModule,
    MdSidenavModule,
    MdInputModule,
    MdDialogModule,
    MdSelectModule,

    OrderContributorsByBalancePipe
  ]
})
export class SharedModule {
}
