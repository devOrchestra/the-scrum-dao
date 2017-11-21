export const gas = 140000;

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
