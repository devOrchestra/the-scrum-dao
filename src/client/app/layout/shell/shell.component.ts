import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../../core/web3.service'

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css']
})
export class ShellComponent implements OnInit {
  public connectionState: string = null;

  constructor(
    private _web3Service: Web3Service
  ) { }

  ngOnInit() {
    this._web3Service.getConnectionState().subscribe(connectionState => {
      this.connectionState = connectionState;
    })
  }

}
