import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ProjectService } from './core/contract-calls/project.service'

@Injectable()
export class OwnerGuardService {
  constructor(
    private _projectService: ProjectService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this._projectService.owner()
      .then(ownerResponse => {
        return ownerResponse === web3.eth.accounts[0];
      });
  }
}
