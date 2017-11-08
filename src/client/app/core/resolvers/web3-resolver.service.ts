import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Web3Service } from '../web3.service';
import project_artifacts from '../../../../../build/contracts/Project.json'
import {default as contract} from 'truffle-contract'

@Injectable()
export class Web3ResolverService {
  Project = contract(project_artifacts);

  constructor(
    private _web3Service: Web3Service
  ) { console.log('project_artifacts', project_artifacts) }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): void {
    const connectionStateIsSet = JSON.parse(sessionStorage.getItem("connectionStateIsSet"));
    console.log('connectionStateIsSet', connectionStateIsSet);
    this.Project.setProvider(web3.currentProvider);
    this.Project.deployed()
      .then(contractInstance => {
        contractInstance.balanceOf(web3.eth.accounts[0])
          .then(balanceResponse => {
            if (!connectionStateIsSet || connectionStateIsSet.connectionStateIsSet === false) {
              this._web3Service.setConnectionState("connected");
              sessionStorage.setItem("connectionStateIsSet", JSON.stringify({connectionStateIsSet: true}));
            } else if (connectionStateIsSet) {
              this._web3Service.setConnectionState("none");
            }
          })
          .catch(err => {
            sessionStorage.setItem("connectionStateIsSet", JSON.stringify({connectionStateIsSet: false}));
            this._web3Service.setConnectionState("not connected")
          })
      })
      .catch(() => {
        sessionStorage.setItem("connectionStateIsSet", JSON.stringify({connectionStateIsSet: false}));
        this._web3Service.setConnectionState("not connected")
      })
  }
}
