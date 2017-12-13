import { Component, Input, Inject, forwardRef } from '@angular/core';
import { IContributor } from "../../shared/interfaces";
import { ContributorListComponent } from "../contributor-list.component";

@Component({
  selector: 'app-contributor-list-worker-item',
  templateUrl: './contributor-list-worker-item.component.html',
  styleUrls: ['./contributor-list-worker-item.component.css']
})
export class ContributorListWorkerItemComponent {
  @Input() contributor: IContributor;
  @Input() tokenSymbol: string;

  public countBalance = this._parent.countBalance;

  constructor(@Inject(forwardRef(() => ContributorListComponent)) private _parent: ContributorListComponent) { }
}
