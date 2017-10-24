import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormGroup, FormControl, FormBuilder, Validators} from '@angular/forms';
import {AuthService} from '../../core/auth.service';
import {UserService} from '../../core/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
  providers: []
})
export class SignInComponent implements OnInit {
  public SignInForm: FormGroup;
  public submitted: boolean;
  public events: any[] = [];

  constructor(private authService: AuthService,
              private userService: UserService,
              private _fb: FormBuilder,
              private _router: Router) {
  }

  ngOnInit() {
    this.SignInForm = this._fb.group({
      username: ['', [<any>Validators.required]],
      password: ['', [<any>Validators.required]]
    });
  }

  signIn(model: { [key: string]: string, username: string }, isValid: boolean): void {
    if (isValid) {
      this.authService.signIn(model)
        .then(response => {
          if (!response.error) {
            if (response.emailConfirmed) {
              this.userService.setCurrentUsername(model.username);
              this.authService.setIsLoggedIn(true);
              this._router.navigate(['/app/dashboard'])
                .catch(error => console.error('error while navigating to "/app/dashboard" ("sign-in.component"):' + error));
            } else {
              alert('Email не подтвержден, проверьте вашу почту');
            }
          } else {
            alert('При входе возникла ошибка, попробойте снова')
          }
        })
        .catch(error => {
          if (error === 'Unauthorized') {
            alert('Вы неверно ввели логин или пароль');
          } else {
            console.error('error while trying to sign in ("signIn"):');
            console.error(error);
          }
        })
    } else {
      console.error('form is invalid ("signIn")');
    }
  }
}
