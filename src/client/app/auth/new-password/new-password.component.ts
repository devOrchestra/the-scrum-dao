import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {FormGroup, FormControl, FormBuilder, Validators} from '@angular/forms';
import {AuthService} from '../../core/auth.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css'],
  providers: []
})

export class NewPasswordComponent implements OnInit {
  public newPasswordForm: FormGroup;
  public submitted: boolean;
  public events: any[] = [];

  private code: string;

  constructor(private activatedRoute: ActivatedRoute,
              private authService: AuthService,
              private _fb: FormBuilder,) {
  }

  ngOnInit() {
    this.newPasswordForm = this._fb.group({
      password: ['', [<any>Validators.required]],
      passwordConfirmation: ['', [<any>Validators.required]]
    });
    this.activatedRoute.params.subscribe((params: Params) => {
      this.code = params['code'];
    });
  }

  setNewPassword(model: { [key: string]: string, password: string, passwordConfirmation: string }, isValid: boolean): void {
    if (isValid && model.password === model.passwordConfirmation) {
      const formattedObjWithNewPassword: { [key: string]: string } = this.formatNewPasswordObj(model);
      // console.log('"new password" formatted model ("setNewPassword"):');
      // console.log(formattedObjWithNewPassword);

      this.authService.setNewPassword(formattedObjWithNewPassword)
        .then(response => {
          // console.log('"setNewPassword" response:');
          // console.log(response);
        })
        .catch(error => {
          console.error('"setNewPassword" error:');
          console.error(error);
        })
    } else {
      console.error('form is invalid or passwords are not equal ("setNewPassword")');
    }
  }

  formatNewPasswordObj(obj: { [key: string]: string, password: string, passwordConfirmation: string }): { [key: string]: string } {
    return {
      password: obj.password,
      passwordConfirmation: obj.passwordConfirmation,
      code: this.code
    }
  }
}
