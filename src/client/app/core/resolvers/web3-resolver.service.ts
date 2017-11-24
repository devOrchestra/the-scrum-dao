import { Injectable } from '@angular/core';
import { RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Web3Service } from '../web3.service';
import { ProjectService } from '../contracts/project.service';

@Injectable()
export class Web3ResolverService {
  constructor(
    private _web3Service: Web3Service,
    private _projectService: ProjectService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): void {
    const connectionStateIsSet = JSON.parse(sessionStorage.getItem("connectionStateIsSet"));
    this._projectService.balanceOf()
      .then(balanceResponse => {
        if (!connectionStateIsSet || connectionStateIsSet.connectionStateIsSet === false) {
          this._web3Service.setConnectionState("connected");
          sessionStorage.setItem("connectionStateIsSet", JSON.stringify({connectionStateIsSet: true}));
        } else if (connectionStateIsSet) {
          this._web3Service.setConnectionState("none");
        }
      })
      .catch(err => {
        console.error('An error occurred on web3-resolver.service:', err);
        sessionStorage.setItem("connectionStateIsSet", JSON.stringify({connectionStateIsSet: false}));
        this._web3Service.setConnectionState("not connected")
      });
  }
}
