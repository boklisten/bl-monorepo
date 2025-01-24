export default class ForceJsonResponseMiddleware {
    async handle({ request }, next) {
        const headers = request.headers();
        headers.accept = "application/json";
        return next();
    }
}
