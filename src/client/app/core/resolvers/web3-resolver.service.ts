import { Injectable } from '@angular/core';
import { RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Web3Service } from '../web3.service';
import { ProjectService } from '../contract-calls/project.service';

@Injectable()
export class Web3ResolverService {
  connectionStateAfterInit: string;

  constructor(
    private _web3Service: Web3Service,
    private _projectService: ProjectService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): void {
    if (!web3.isConnected()) {
      sessionStorage.setItem("connectionStateIsSet", JSON.stringify({connectionStateIsSet: false}));
      this._web3Service.setConnectionState("not connected");
      this.connectionStateAfterInit = "not connected";
    } else {
      const connectionStateIsSet = JSON.parse(sessionStorage.getItem("connectionStateIsSet"));
      this._projectService.balanceOf()
        .then(balanceResponse => {
          if (!connectionStateIsSet || connectionStateIsSet.connectionStateIsSet === false) {
            this._web3Service.setConnectionState("connected");
            this.connectionStateAfterInit = "connected";
            sessionStorage.setItem("connectionStateIsSet", JSON.stringify({connectionStateIsSet: true}));
          } else if (connectionStateIsSet) {
            this._web3Service.setConnectionState("none");
            this.connectionStateAfterInit = "none";
          }
          const lastAddress = JSON.parse(sessionStorage.getItem("lastAddress"));
          if (web3.eth.accounts[0] && lastAddress && lastAddress.lastAddress && lastAddress.lastAddress !== web3.eth.accounts[0]) {
            if (this.connectionStateAfterInit === "connected") {
              setTimeout(() => {
                this._web3Service.setNeedToShowAccountChange(true);
              }, 6000);
            } else {
              this._web3Service.setNeedToShowAccountChange(true);
            }
          }
          this.setWatcher();
        })
        .catch(err => {
          if (!err.toString().includes("Invalid number of arguments to Solidity function")) {
            console.error('An error occurred on web3-resolver.service:', err);
          }
          sessionStorage.setItem("connectionStateIsSet", JSON.stringify({connectionStateIsSet: false}));
          this._web3Service.setConnectionState("not connected");
          this.connectionStateAfterInit = "not connected";
          this.setWatcher();
        });
    }
  }

  setWatcher() {
    let connectionStateInWatcherIsOk = true,
      connectionStateInWatcherWasSwitchedFromErrorState = false,
      currentAccount = web3.eth.accounts[0];
    setInterval(() => {
      web3.eth.getAccounts((err, accounts) => {
        if (web3.eth.accounts[0] !== currentAccount) {
          if (currentAccount) {sessionStorage.setItem("lastAddress", JSON.stringify({lastAddress: currentAccount}))}
          window.location.reload()
        } else if (web3.eth.accounts[0] === currentAccount && !err && accounts.length !== 0 &&
          !connectionStateInWatcherIsOk && !connectionStateInWatcherWasSwitchedFromErrorState) {
          connectionStateInWatcherIsOk = true;
          connectionStateInWatcherWasSwitchedFromErrorState = false;
          currentAccount = web3.eth.accounts[0];
        } else if ((err || accounts.length === 0) && connectionStateInWatcherIsOk) {
          sessionStorage.setItem("connectionStateIsSet", JSON.stringify({connectionStateIsSet: false}));
          this._web3Service.setConnectionState("not connected");
          connectionStateInWatcherWasSwitchedFromErrorState = true;
          connectionStateInWatcherIsOk = false;
        }
      });
    }, 250)
  }
}
