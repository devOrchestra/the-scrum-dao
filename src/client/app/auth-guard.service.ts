import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from './core/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // return true
    return this.authService.isAuth().then(data => {
      if (!data.error) {
        if (data.result) {

        } else {
          this.router.navigate(['/sign-in']);
        }
        return data.result
      }
      return false
    })
  }
}
