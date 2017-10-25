import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contributor-list',
  templateUrl: './contributor-list.component.html',
  styleUrls: ['./contributor-list.component.css']
})
export class ContributorListComponent implements OnInit {
  public totalBalance = 1000;
  public contributors: { [key: string]: string | number }[] = [
    {
      username: "Username1",
      balance: 100,
      walletAddress: "0xEBA547094b6D1EB82DFDD011749165D490e07cf8",
      avatar: "../../assets/images/avatar-default.png"
    },
    {
      username: "Username2",
      balance: 200,
      walletAddress: "0xEBA547094b6D1EB82DFDD011749165D490e07cf8",
      avatar: "../../assets/images/avatar-default.png"
    },
    {
      username: "Username3",
      balance: 300,
      walletAddress: "0xEBA547094b6D1EB82DFDD011749165D490e07cf8"
    },
    {
      username: "Username4",
      balance: 400,
      walletAddress: "0xEBA547094b6D1EB82DFDD011749165D490e07cf8"
    }
  ];

  constructor() { }

  ngOnInit() {
  }

}
