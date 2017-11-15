
#The Scrum DAO

[![](https://2.downloader.disk.yandex.ru/disk/cd3cf6f76f746ca8a8db8a0d76ae76459a32bbfb457fdaad18160dcb89ce7385/5a0a13ad/fKqInKw3d7bLFOeFnMGnhP3F38B2d_t2ZD3HIz2WceI7YlRVWOTKvE56LR6iw7Azm_jDI0MphJXwK_xBcAndo4qgo6vopMwwBlJ9ufJYkPar8npumZHI4midPdWhecNq?uid=1130000025307753&filename=scrum-dao%20%281%29.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&fsize=97142&hid=39fff4393235ddb7d14700f8faed9f5a&media_type=image&tknv=v2&etag=da2b038f374cd8195edf5141d722d822)](https://2.downloader.disk.yandex.ru/disk/cd3cf6f76f746ca8a8db8a0d76ae76459a32bbfb457fdaad18160dcb89ce7385/5a0a13ad/fKqInKw3d7bLFOeFnMGnhP3F38B2d_t2ZD3HIz2WceI7YlRVWOTKvE56LR6iw7Azm_jDI0MphJXwK_xBcAndo4qgo6vopMwwBlJ9ufJYkPar8npumZHI4midPdWhecNq?uid=1130000025307753&filename=scrum-dao%20%281%29.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&fsize=97142&hid=39fff4393235ddb7d14700f8faed9f5a&media_type=image&tknv=v2&etag=da2b038f374cd8195edf5141d722d822)
**Table of Contents**

[TOC]

##Concept
The Scrum DAO it&#39;s an attempt to combine flexible software development methodology (Scrum) and Decentralized Autonomous Organizations (DAO).

We also want to offer a new approach to ICO to prevent over-inflating budget and greater involvement of investors in the development process. The idea is very simple - emit new tokens when some portion of work has been done and approved.

##Integrations
In our plans do integration with most popular project management systems, eg JIRA, Github. In our projects we use JIRA and very like it, so we started with it. 

##Main Scenario
- Project Owner deploys contracts and adds Workers.
- When Issue created TrustedOracle(not Owner) push new votings to ProductBacklog and PlanningPoker Contracts.
- Any token Holders can vote for issue's priority in the ProductBacklog.
- Workers play in a PlanningPoker and vote for issue's story points.
- When Issue closed Worker get an award which depends on issue's story points.
- Worker put sell order in the Crowdsale contract.
- Investor pays ETH to buy Tokens.
- Investor now can vote to issue's priority and expect part of a future company's profits.


#QuickStart

#Oracle

#Project Contract
The main contract implements ERC20 interface. New Tokens generate only when some work has been done and represent the contribution of each participant.

Project Owner deploys contracts, link all of them to Project contract and add Workers

    struct Worker {
      address _address;
      string username; 	 //JIRA username
      }

Owner also initializes trustedOracle account, which can call payAward function. This is done for security purposes because oracle private key stored on the server and can be compromised but with this separations, it's not critical.

#PlanningPoker Contract

Planning Poker is the main concept of scrum methodology. Team members estimate tasks and the final average result represents the award amount.
When a new task added to a project management tool trustedOracle initializes new voting:

      struct Voting {
      string issue;
      uint votesCount;
      uint sum;
      bool isValid;
      bool isOpen;
      bool awardPaid;
      mapping (address => uint) votes;
      }

#ProductBacklog Contract
Very similar to PlanningPoker. The first difference is any Tokens Holder can vote. The second is the weight of a vote depends on Holder's balance and the final result is calculated as a percentage of the total supply of Tokens.
#Crowdsale Contract
This contract allows Workers to sell the earned Tokens to anyone. It works like usual order book but with some limitations:
 - You should fully fill order
 - You can fill one order per transaction
 - Cancel an order take some time
