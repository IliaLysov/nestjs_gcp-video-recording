export const getAccessTokenFromCookie = (cookie: string): string => {
    const accessToken = cookie
        .split(';')
        .find((c) => c.trim().startsWith('accessToken='))
        .split('=')[1];
    return accessToken;
};
