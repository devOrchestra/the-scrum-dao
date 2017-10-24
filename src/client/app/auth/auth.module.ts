import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';

import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SignUpSuccessComponent } from './sign-up-success/sign-up-success.component';
import { SignUpFailureComponent } from './sign-up-failure/sign-up-failure.component';
import { PasswordRecoveryComponent } from './password-recovery/password-recovery.component';
import { NewPasswordComponent } from './new-password/new-password.component';

@NgModule({
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    BrowserModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    SignInComponent,
    SignUpComponent,
    SignUpSuccessComponent,
    SignUpFailureComponent,
    PasswordRecoveryComponent,
    NewPasswordComponent
  ],
  exports: [RouterModule]
})
export class AuthModule { }
