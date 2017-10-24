import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';

import { AuthService } from './auth.service';
import { DataService } from './data.service';
import { UserService } from './user.service';

@NgModule({
  imports: [
    CommonModule,
    HttpModule
  ],
  declarations: [],
  providers: [AuthService, DataService, UserService]
})
export class CoreModule {}
