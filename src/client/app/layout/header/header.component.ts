import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/user.service';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  providers: []
})
export class HeaderComponent implements OnInit {
  public username: string;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private dataService: DataService,
    private _router: Router
  ) { }

  ngOnInit() {
    this.authService.getIsLoggedIn().subscribe(loggedIn => {
      if (loggedIn) {
        this.userService.getCurrentUsername().subscribe(username => {
          this.username = username;
        });
        this.getUser(this.username);
      }
      // } else {
      //   this._router.navigate(['/sign-in'])
      //     .catch(error => console.error('error while navigating to "/sign-in" ("header.component"):' + error));
      // }
    });
  }

  getUser(email): void {
    this.userService.getUser(email)
      .then(response => {
        if (!response.error) {
          this.username = response[0].email.address;
        }
      })
      .catch(error => {
        console.log(error);
      })
  }

  signOut(): void {
    this.authService.signOut()
      .then(response => {
        if (!response.error) {
          this.userService.setCurrentUsername('');
          this.authService.setIsLoggedIn(false);
          this._router.navigate(['/sign-in']).catch();
        }
      })
      .catch(error => {
        console.log(error);
      })
  }
}
