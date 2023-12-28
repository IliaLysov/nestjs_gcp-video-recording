import * as os from 'os';

export const networkInterfaces = os.networkInterfaces();
export const primaryAddress = networkInterfaces.en0[1].address;

export const getMainUrl = () => {
  return `https://${primaryAddress}:${process.env.PORT}`;
};
