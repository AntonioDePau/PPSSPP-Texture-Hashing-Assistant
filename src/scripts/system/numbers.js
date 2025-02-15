export function Round(number, decimals){
  return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export const bigInt = window.BigInt;