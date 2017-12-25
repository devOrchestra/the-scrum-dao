import { Component, Input, Inject, forwardRef } from '@angular/core';
import { ContributorListComponent } from "../contributor-list.component";
import { IHolder } from "../../shared/interfaces";

@Component({
  selector: 'app-contributor-list-holder-item',
  templateUrl: './contributor-list-holder-item.component.html',
  styleUrls: ['./contributor-list-holder-item.component.css']
})
export class ContributorListHolderItemComponent {
  @Input() holder: IHolder;
  @Input() tokenSymbol: string;
  @Input() totalBalance: number;

  public countBalance = this._parent.countBalance;

  constructor(@Inject(forwardRef(() => ContributorListComponent)) private _parent: ContributorListComponent) { }
}
