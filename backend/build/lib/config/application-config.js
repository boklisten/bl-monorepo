import moment from "moment";
export const APP_CONFIG = {
    path: {
        client: {
            checkout: "cart/confirm",
            agreement: {
                rent: "info/policies/conditions",
            },
            auth: {
                failure: "auth/authentication/failure",
                socialLoginFailure: "auth/social/failure",
            },
        },
        dibs: {
            payment: "payments",
        },
        host: "boklisten",
        local: {
            host: "localhost",
        },
    },
    server: {
        basePath: "http://localhost:1337",
    },
    url: {
        bring: {
            shipmentInfo: "https://api.bring.com/shippingguide/v2/products",
        },
        blWeb: {
            base: "https://localhost:4200",
        },
    },
    dev: {
        server: {
            host: "https://localhost",
            port: 1337,
            path: "api",
            version: "v1",
        },
        client: {
            base: "https://localhost:4200/",
        },
        mongoDb: {
            basePath: "mongodb://",
            host: "localhost",
            port: 27_017,
        },
    },
    prod: {
        server: {
            host: "",
            port: 0,
            path: "",
            version: "",
        },
        mongoDb: {
            basePath: "",
            host: "",
            port: 0,
            dbName: "",
        },
    },
    test: true,
    login: {
        google: {
            name: "google",
        },
        facebook: {
            name: "facebook",
        },
        local: {
            name: "local",
        },
    },
    token: {
        refresh: {
            iss: "boklisten.no",
            aud: "boklisten.no",
            expiresIn: "365d",
        },
        access: {
            iss: "boklisten.no",
            aud: "boklisten.no",
            expiresIn: "10 minutes",
        },
    },
    date: {
        cancelDays: 14,
    },
    payment: {
        paymentServiceConfig: {
            roundDown: true,
            roundUp: false,
        },
    },
    delivery: {
        // If in season, lower the delivery estimate
        deliveryDays: moment().isBetween(moment().clone().set({ month: 7, date: 5 }), moment().clone().set({ month: 8, date: 10 })) ||
            moment().isBetween(moment().clone().set({ month: 0, date: 7 }), moment().clone().set({ month: 1, date: 8 }))
            ? 3
            : 7,
        maxWeightLetter: 4800,
    },
};
