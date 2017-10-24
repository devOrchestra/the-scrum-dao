import {Component, OnInit} from '@angular/core';
import {FormGroup, FormControl, FormBuilder, Validators} from '@angular/forms';
import {AuthService} from '../../core/auth.service';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.css'],
  providers: []
})

export class PasswordRecoveryComponent implements OnInit {
  public passwordRecoveryForm: FormGroup;
  public submitted: boolean;
  public events: any[] = [];

  constructor(private authService: AuthService,
              private _fb: FormBuilder) {
  }

  ngOnInit() {
    this.passwordRecoveryForm = this._fb.group({
      email: ['', [<any>Validators.required, <any>Validators.pattern(EMAIL_REGEX)]]
    });
  }

  recoverPassword(email: { [key: string]: string, email: string }, isValid: boolean): void {
    if (isValid) {
      this.authService.recoverPassword({username: email.email})
        .then(response => {
          // console.log('"recoverPassword" response:');
          // console.log(response);
        })
        .catch(error => {
          console.error('"recoverPassword" error:');
          console.error(error);
        })
    } else {
      console.error('form is invalid ("recoverPassword")');
    }
  }
}
