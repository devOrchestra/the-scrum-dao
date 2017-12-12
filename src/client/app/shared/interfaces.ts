export interface IBalances {
  currentBalance: number
  lastBalanceFromStorage: number
  accountWasNotChanged: boolean
}

export interface IContributor {
  avatar?: string
  balance: number
  username: string
  walletAddress: string
}

export interface IHolder {
  balance: number
  walletAddress: string
  includes?: any
}

export interface IOrder {
  id: number
  isLocked: boolean
  isOpen: boolean
  orderType: string
  owner: string
  price: number
  value: number
  index?: number
  ownerName?: string
}

export interface IPlanningPokerTask {
  id: string
  key: string
  self: string
  storyPointsLoading: boolean
  votingLoading: boolean
  flashAnimation?: string
  fields: {
    votesCount: number
    votesSum: number
    votesUserChoice: number
    votingWasNotCreated: boolean
    isOpen: boolean
  }
}

export interface IBacklogTask {
  id: string
  key: string
  self: string
  storyPointsLoading: boolean
  totalPercentsLoading: boolean
  userHasAlreadyVoted: number
  bgcEasingApplied?: boolean
  flashAnimation?: string
  fields: {
    isOpen: boolean
    storyPoints: number
    totalSupply: number
    votingCount: number
    votingWasNotCreated: boolean
  }
}

export interface ISettingsWorker {
  address: string
  balance: number
  username: string
  highlightAnimation?: string
}
