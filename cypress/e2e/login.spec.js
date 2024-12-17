describe("Login", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.getBySel("MenuIcon").click();
    cy.get(".MuiListItemButton-root").eq(5).click();
  });

  it("displays all important elements", () => {
    cy.getBySel("facebook-button").should("be.visible");
    cy.getBySel("google-button").should("be.visible");
    cy.getBySel("error-message").should("not.exist");
    cy.getBySel("email-field").should("be.visible");
    cy.getBySel("password-field").should("be.visible");
    cy.getBySel("login-submit").should("be.visible");
    cy.getBySel("forgot-password").should("be.visible");
  });

  it("accepts a legal email and password", () => {
    cy.getBySel("email-field").type("petter@hansen.no");
    cy.getBySel("error-message").should("not.exist");

    cy.getBySel("password-field").type("password");
    cy.getBySel("error-message").should("not.exist");

    cy.getBySel("login-submit").should("not.be.disabled");
  });

  it(
    "rejects badly formatted emails and passwords",
    { scrollBehavior: false },
    () => {
      cy.getBySel("login-submit").click();
      cy.getBySel("login-submit").click();
      cy.getBySel("error-message").should("contain", "Du må fylle inn epost");
      cy.getBySel("login-submit").should("be.disabled");

      cy.getBySel("email-field").type("petter@");
      cy.getBySel("error-message").should(
        "contain",
        "Du må fylle inn en gyldig epost",
      );
      cy.getBySel("login-submit").should("be.disabled");

      cy.getBySel("email-field").type("hansen.no");
      cy.getBySel("error-message").should("not.exist");
      cy.getBySel("login-submit").should("not.be.disabled");

      cy.getBySel("password-field").clear();
      cy.getBySel("login-submit").click();

      cy.getBySel("error-message").should("contain", "Du må fylle inn passord");
      cy.getBySel("login-submit").should("be.disabled");

      cy.getBySel("password-field").type("password");
      cy.getBySel("error-message").should("not.exist");
      cy.getBySel("login-submit").should("not.be.disabled");
    },
  );

  it("displays an error message when username and password is wrong", () => {
    cy.getBySel("email-field").clear();
    cy.getBySel("password-field").clear();
    cy.getBySel("email-field").type("ola@halvorsen.no");
    cy.getBySel("password-field").type("0977 det er livet min");
    cy.intercept("/auth/local/login").as("login");
    cy.getBySel("login-submit").click();
    cy.wait("@login").its("response.statusCode").should("eq", 401);
    cy.getBySel("api-error").should(
      "contain",
      "Error: username or password is wrong",
    );
  });

  it("can log in with registered user", () => {
    cy.login(
      "richard.stallman@protonmail.com",
      "Programming is not a science. Programming is a craft.",
    );
    cy.url().should("not.include", "login");
    cy.getBySel("MenuIcon").click();
    cy.get(".MuiListItemButton-root").eq(7).should("contain", "Logg ut");
  });
});
