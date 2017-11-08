import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import project_artifacts from '../../../build/contracts/Project.json'
import {default as contract} from 'truffle-contract'

@Injectable()
export class OwnerGuardService {
  Project = contract(project_artifacts);

  constructor(
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.Project.setProvider(web3.currentProvider);
    return this.Project.deployed()
      .then(contractInstance => {
        return contractInstance.owner();
      })
      .then(ownerResponse => {
        return ownerResponse === web3.eth.accounts[0];
      })
  }
}
