import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../core/contract-calls/project.service';
import { parseBigNumber, countDecimals } from '../../../shared/methods';

@Component({
  selector: 'app-total-supply',
  templateUrl: './total-supply.component.html',
  styleUrls: ['./total-supply.component.css']
})
export class TotalSupplyComponent implements OnInit {
  parseBigNumber = parseBigNumber;
  countDecimals = countDecimals;

  readyToDisplay = false;
  symbol: string;
  decimals: number;
  totalSupply: number;

  constructor(
    private _projectService: ProjectService
  ) { }

  ngOnInit() {
    let totalSupplyUnformatted;
    this._projectService.totalSupply()
      .then(totalSupplyResponse => {
        totalSupplyUnformatted = this.parseBigNumber(totalSupplyResponse);
        return this._projectService.symbol();
      })
      .then(symbolResponse => {
        this.symbol = symbolResponse;
        return this._projectService.decimals();
      })
      .then(decimalsResponse => {
        this.decimals = this.countDecimals(this.parseBigNumber(decimalsResponse));
        this.totalSupply = totalSupplyUnformatted / this.decimals;
        console.log("decimals", this.decimals);
        console.log("totalSupply", this.totalSupply);
        this.readyToDisplay = true;
      })
      .catch(err => {
        console.error('An error occurred on total-supply.component in "OnInit" block:', err);
      });
  }
}
