import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';
import { IRegisterUser, IRegisterUserFromForm } from '../../shared/interfaces';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  providers: []
})

export class SignUpComponent implements OnInit {
  public registerForm: FormGroup;
  public submitted: boolean;
  public events: any[] = [];

  constructor(
      private authService: AuthService,
      private dataService: DataService,
      private _fb: FormBuilder
  ) { }

  ngOnInit() {
    this.registerForm = this._fb.group({
      email: ['', [<any>Validators.required, <any>Validators.pattern(EMAIL_REGEX)]],
      password: ['', [<any>Validators.required]],
      passwordConfirmation: ['', [<any>Validators.required]]
    });
  }

  registerNewUser(model: IRegisterUserFromForm, isValid: boolean): void {
    if (isValid) {
      if (model.password === model.passwordConfirmation) {
        const formattedModel: IRegisterUser = this.formatNewUserObject(model);
        this.dataService.setSignUpData(formattedModel);

        this.authService.registerNewUser(formattedModel)
          .then(response => {
            if (response.userAlreadyRegistered) {
              alert('Пользователь с указанным логином уже зарегистрирован в системе');
            }
            if (response.emailAlreadyRegistered) {
              alert('Пользователь с указанным email уже зарегистрирован в системе');
            }
          })
          .catch(error => {
            console.error(error);
          })
      } else {
        alert('Пароли не совпадают');
      }
    } else {
      console.error('form is invalid ("registerNewUser")');
    }
  }

  sendConfirmationEmailAgain(): void {
    // console.log('"sendConfirmationEmailAgain" works');
    let receivedSignUpData: IRegisterUser;
    this.dataService.getSignUpData().subscribe(username => {
      receivedSignUpData = username;
    });
    if (receivedSignUpData) {
      // console.log('"receivedSignUpData" exists');
      this.authService.sendConfirmationEmailAgain(receivedSignUpData)
        .then(response => {
          // console.log('"sendConfirmationEmailAgain" response:');
          // console.log(response);
          if (!response.error) {
            // console.log('email was sent again');
          } else {
            console.error('error while sending confirmation email ("sendConfirmationEmailAgain"):');
            console.error(response.error);
          }
        })
        .catch(error => {
          console.error('"sendConfirmationEmailAgain" error:');
          console.error(error);
        })
    } else {
      console.error('no receivedSignUpData ("sendConfirmationEmailAgain")');
    }
  }

  formatNewUserObject(model: IRegisterUserFromForm): IRegisterUser {
      return {
          username: model.email,
          email: {
              address: model.email
          },
          password: model.password
      };
  }
}
