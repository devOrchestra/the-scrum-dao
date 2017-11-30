import { IOrder } from './interfaces'

export const countDecimals = (numberOfNulls: number): number => {
  let final = "1";
  const parsedNumberOfNulls = parseBigNumber(numberOfNulls);
  for (let i = 0; i < parsedNumberOfNulls; i++) {
    final += "0";
  }
  return Number(final);
};

export const parseBigNumber = (item: number): number => {
  return !parseInt(item.toString(), 10) ? 0 : parseInt(item.toString(), 10);
};

export const countStoryPoints = (votesCount: number, votesSum: number): number => {
  const result = votesSum / votesCount;
  if (!result) {
    return 0;
  } else {
    return Math.round(result);
  }
};

export const formatOrder = (item: IOrder, type: string, decimals: number): IOrder => {
  for (let i = 1; i <= 3; i++) {
    item[i] = parseBigNumber(item[i]);
  }
  item = transformOrderToObject(item, type);
  item.price = item.price / decimals;
  return item;
};

export const transformOrderToObject = (item: IOrder, orderType: string): IOrder => {
  return {
    owner: item[0],
    value: item[1],
    price: item[2],
    id: item[3],
    isOpen: item[4],
    isLocked: item[5] || false,
    orderType: orderType
  }
};
