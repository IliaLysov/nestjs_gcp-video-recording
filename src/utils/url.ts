import * as os from 'os';

export const networkInterfaces = os.networkInterfaces();

export const primaryAddress = () => {
  const { address } = networkInterfaces.en0.find(({ family, internal }) => {
    return family === 'IPv4' && !internal;
  });
  return address;
};

export const getMainUrl = () => {
  return `https://${primaryAddress()}:${process.env.PORT}`;
};
