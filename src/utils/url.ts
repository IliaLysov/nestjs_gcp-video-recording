import * as os from 'os';

export const networkInterfaces = os.networkInterfaces();

export const primaryAddress = () => {
    if (process.env.NODE_ENV === 'production') return process.env.HOST;
    const { address } = networkInterfaces.en0.find(({ family, internal }) => {
        return family === 'IPv4' && !internal;
    });
    return address;
};

export const getMainUrl = () => {
    return `https://${primaryAddress()}:${process.env.PORT}`;
};

export const getMainWsUrl = () => {
    return `wss://${primaryAddress()}:${process.env.PORT}`;
};
