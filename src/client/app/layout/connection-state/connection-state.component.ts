import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../../core/web3.service'
import { LongControlledEnterLeaveAnimation } from '../../shared/animations'

@Component({
  selector: 'app-connection-state',
  templateUrl: './connection-state.component.html',
  styleUrls: ['./connection-state.component.css'],
  animations: [LongControlledEnterLeaveAnimation]
})
export class ConnectionStateComponent implements OnInit {
  public backdrop = false;
  public backdropAnimation = "";
  public showConnectionSuccessSection = false;
  public connectionSuccess = false;
  public connectionSuccessAnimation = "";
  public showConnectionFailureSection = false;

  constructor(
    private _web3Service: Web3Service
  ) { }

  ngOnInit() {
    this._web3Service.getConnectionState().subscribe(state => {
      console.log('STATE:', state);
      if (state === 'connected') {
        this.showConnectionSuccess();
      } else if (state === 'not connected') {
        this.backdrop = true;
        this.showConnectionFailureSection = true;
      }
    });
  }

  showConnectionSuccess(): void {
    this.backdrop = true;
    this.showConnectionSuccessSection = true;
    this.connectionSuccess = true;
    this.connectionSuccessAnimation = "animate";
    setTimeout(() => {
      this.connectionSuccessAnimation = "void";
      this.connectionSuccess = false;
    }, 5000);
    setTimeout(() => {
      this.backdropAnimation = "void";
    }, 6000);
    setTimeout(() => {
      this.backdrop = false;
    }, 7000);
  }
}
