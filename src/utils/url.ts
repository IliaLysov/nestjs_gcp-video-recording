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
    if (process.env.NODE_ENV === 'production')
        return `https://${process.env.HOST}`;
    return `https://${primaryAddress()}:${process.env.PORT}`;
};

export const getMainWsUrl = () => {
    if (process.env.NODE_ENV === 'production')
        return `wss://${process.env.HOST}`;
    return `wss://${primaryAddress()}:${process.env.PORT}`;
};
