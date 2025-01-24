export class Hook {
    before(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    body, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    accessToken, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    id, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    query) {
        return Promise.resolve(true);
    }
    after(docs, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    accessToken) {
        return Promise.resolve(docs ? docs : []);
    }
}
