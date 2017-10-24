import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SignUpSuccessComponent } from './sign-up-success/sign-up-success.component';
import { SignUpFailureComponent } from './sign-up-failure/sign-up-failure.component';
import { PasswordRecoveryComponent } from './password-recovery/password-recovery.component';
import { NewPasswordComponent } from './new-password/new-password.component';

const routes: Routes = [
  {path: 'sign-in', component: SignInComponent},
  {path: 'sign-up', component: SignUpComponent},
  {path: 'sign-up-success', component: SignUpSuccessComponent},
  {path: 'sign-up-failure', component: SignUpFailureComponent},
  {path: 'password-recovery', component: PasswordRecoveryComponent},
  {path: 'reset/:code', component: NewPasswordComponent},
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {
}
