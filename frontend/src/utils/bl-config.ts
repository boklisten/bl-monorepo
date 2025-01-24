const BL_CONFIG = {
  api: {
    basePath: process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:1337/",
  },
  blWeb: {
    basePath: process.env["NEXT_PUBLIC_BL_WEB_URL"] ?? "http://localhost:4200/",
  },
  blAdmin: {
    basePath:
      process.env["NEXT_PUBLIC_BL_ADMIN_URL"] ?? "http://localhost:8080/",
  },
  token: {
    accessToken: "bl-access-token",
    refreshToken: "bl-refresh-token",
  },
  login: {
    local: {
      url: "auth/local/login",
    },
    facebook: {
      url: "auth/facebook",
    },
    google: {
      url: "auth/google",
    },
    localStorageKeys: {
      redirect: "bl-redirect",
      caller: "bl-caller",
    },
  },
  register: {
    local: {
      url: "auth/local/register",
    },
    facebook: {
      url: "auth/facebook",
    },
    google: {
      url: "auth/google",
    },
  },
  order: {
    receipt: {
      operation: "receipt",
    },
    agreement: {
      operation: "agreement",
    },
  },
  pendingPasswordReset: {
    confirm: {
      operation: "confirm",
    },
  },
  emailValidation: {
    confirm: {
      operation: "confirm",
    },
  },
  delivery: {
    postalCodeLookup: {
      operation: "postal-code-lookup",
    },
  },
  collection: {
    item: "items",
    branch: "branches",
    branchItem: "branchitems",
    editableText: "editabletexts",
    openingHour: "openinghours",
    userDetail: "userdetails",
    customerItem: "customeritems",
    order: "orders",
    orderItem: "orderitems",
    payment: "payments",
    delivery: "deliveries",
    pendingPasswordReset: "pendingpasswordresets",
    company: "companies",
    emailValidation: "email_validations",
    message: "messages",
    invoice: "invoices",
    userMatches: "user_matches",
    standMatches: "stand_matches",
    booking: "bookings",
    uniqueItem: "uniqueitems",
  },
};

export default BL_CONFIG;
