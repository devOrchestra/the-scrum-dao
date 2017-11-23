
#The Scrum DAO

[TOC]

## Concept
-------------

The Scrum DAO it&#39;s an attempt to combine flexible software development methodology (Scrum) and Decentralized Autonomous Organizations (DAO).

We also want to offer a new approach to ICO to prevent over-inflating budget and greater involvement of investors in the development process. The idea is very simple - emit new tokens when some portion of work has been done and approved.
The project capitalisation grows smoothly in parallel with features implementation and investors doesn't pay just for hype


## Integrations
-------------
In our plans do integration with most popular project management systems, eg JIRA, Github. In our projects we use JIRA and very like it, so we started with it.


# Project Structure
-------------

![](http://devorchestra.io/assets/images/presentation/scrum-dao-scheme.jpg)

## Main Scenario
-------------
- Project Owner deploys contracts and adds Workers.
- When Issue created in the PM TrustedOracle(not Owner) push new votings to ProductBacklog and PlanningPoker Contracts.
- Any token Holders can vote for issue's priority in the ProductBacklog.
- Workers play in a PlanningPoker and vote for issue's story points.
- When Issue closed Worker get an award which depends on issue's story points.
- Worker put sell order in the Crowdsale contract.
- Investor pays ETH to buy Tokens.
- Investor now can vote to issue's priority and expect part of a future company's profits.

## Oracle
-------------
## Project Contract
-------------

The main contract implements the ERC20 interface. New Tokens generate only when some work has been done and represent the contribution of each participant.

Project Owner deploys contracts, link all of them to Project contract and add Workers

```
struct Worker {
  address _address;
  string username;   //JIRA username
}
```

Owner also initializes trustedOracle account, which can call payAward function. This is done for security purposes because oracle private key stored on the server and can be compromised but with this separations, it's not critical.

## PlanningPoker Contract
-------------

Planning Poker is the main concept of scrum methodology. Team members estimate tasks and the finalaverage result represents the award amount. When a new task added to a project management tool trustedOracle initializes new voting:

```
struct Voting {
  string issue;
  uint votesCount;
  uint sum;
  bool isValid;
  bool isOpen;
  bool awardPaid;
  mapping (address => uint) votes;
}
```

## ProductBacklog Contract
-------------

Very similar to PlanningPoker. The first difference is any Tokens Holder can vote. The second is the weight of a vote depends on Holder's balance and the final result is calculated as a percentage of the total supply of Tokens.

## Crowdsale Contract
-------------

This contract allows Workers to sell earned Tokens to anyone. It works like usual order book but with some limitations:

- You should fully fill existing order
- You can fill only one order per transaction
