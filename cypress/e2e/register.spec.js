describe("Register", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.getBySel("MenuIcon").click();
    cy.get(".MuiListItemButton-root").eq(4).click();
  });

  it("displays correct initial elements", () => {
    cy.getBySel("facebook-button").should("be.visible");
    cy.getBySel("google-button").should("be.visible");
    cy.getBySel("email-field").should("be.visible");
    cy.getBySel("password-field").should("be.visible");
    cy.getBySel("submit-button").should("be.visible");
    cy.getBySel("login-link").should("be.visible");

    cy.getBySel("error-message").should("not.exist");
    cy.getBySel("first-name-field").should("not.exist");
    cy.getBySel("last-name-field").should("not.exist");
    cy.getBySel("phone-field").should("not.exist");
    cy.getBySel("address-field").should("not.exist");
    cy.getBySel("postal-code-field").should("not.exist");
    cy.getBySel("postal-city-preview").should("not.exist");
    cy.getBySel("birthday-field").should("not.exist");
    cy.getBySel("guardian-name-field").should("not.exist");
    cy.getBySel("guardian-email-field").should("not.exist");
    cy.getBySel("guardian-phone-field").should("not.exist");
    cy.getBySel("tos-field").should("not.exist");

    cy.getBySel("email-field").click();

    cy.getBySel("first-name-field").should("be.visible");
    cy.getBySel("last-name-field").should("be.visible");
    cy.getBySel("phone-field").should("be.visible");
    cy.getBySel("address-field").should("be.visible");
    cy.getBySel("postal-code-field").should("be.visible");
    cy.getBySel("postal-city-preview").should("not.be.visible");
    cy.getBySel("birthday-field").should("be.visible");
    cy.getBySel("tos-field").should("be.visible");

    cy.getBySel("error-message").should("not.exist");
    cy.getBySel("guardian-name-field").should("not.exist");
    cy.getBySel("guardian-email-field").should("not.exist");
    cy.getBySel("guardian-phone-field").should("not.exist");
  });

  it("correctly validates a regular user", () => {
    cy.getBySel("email-field").type("richard.stallman@protonmail.com");
    cy.getBySel("password-field").type(
      "Programming is not a science. Programming is a craft.",
    );
    cy.getBySel("first-name-field").type("Richard");
    cy.getBySel("last-name-field").type("Stallman");
    cy.getBySel("phone-field").type("98765432");
    cy.getBySel("address-field").type("Cali");
    cy.getBySel("postal-code-field").type("7032");
    cy.getBySel("birthday-field").type("16031953");
    cy.getBySel("tos-field").click();

    cy.getBySel("error-message").should("not.exist");
    cy.getBySel("submit-button").should("not.be.disabled");
  });

  it("correctly validates an underage user", () => {
    cy.getBySel("email-field").type("richard.stallman@protonmail.com");
    cy.getBySel("password-field").type(
      "Programming is not a science. Programming is a craft.",
    );

    cy.getBySel("birthday-field").clear();
    cy.getBySel("birthday-field").type("16032010");
    cy.getBySel("guardian-name-field").type("Linus Thorvalds");
    cy.getBySel("guardian-email-field").type("linus.thorvalds@protonmail.com");
    cy.getBySel("guardian-phone-field").type("98765432");

    cy.getBySel("error-message").should("not.exist");
    cy.getBySel("submit-button").should("not.be.disabled");
  });

  it("correctly displays postal city", () => {
    cy.getBySel("email-field").type("richard.stallman@protonmail.com");
    cy.getBySel("password-field").type(
      "Programming is not a science. Programming is a craft.",
    );
    cy.getBySel("postal-code-field").clear();
    cy.getBySel("postal-code-field").type("7032");
    cy.getBySel("postal-city-preview").should("contain", "Trondheim");

    cy.get("#postalCode").clear();
    cy.get("#postalCode").type("1234");
    cy.getBySel("submit-button").should("be.disabled");
    cy.getBySel("error-message").should(
      "contain",
      "Du må oppgi et gyldig norsk postnummer",
    );

    cy.get("#postalCode").clear();
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    cy.get("#postalCode").type("0977").blur();
    cy.getBySel("postal-city-preview").should("contain", "Oslo");
    cy.getBySel("submit-button").should("not.be.disabled");
    cy.getBySel("error-message").should("not.exist");
  });

  it("cannot register when some fields are empty", () => {
    cy.getBySel("email-field").clear();
    cy.getBySel("password-field").clear();
    cy.getBySel("first-name-field").clear();
    cy.getBySel("last-name-field").clear();
    cy.getBySel("phone-field").clear();
    cy.getBySel("address-field").clear();
    cy.getBySel("postal-code-field").clear();
    cy.getBySel("birthday-field").clear();
    cy.getBySel("tos-field").click();
    cy.getBySel("error-message").should("have.length", 7);
    cy.getBySel("submit-button").should("be.disabled");

    cy.getBySel("email-field").type("richard.stallman@protonmail.com");
    cy.getBySel("password-field").type(
      "Programming is not a science. Programming is a craft.",
    );
    cy.getBySel("first-name-field").type("Richard");
    cy.getBySel("last-name-field").type("Stallman");
    cy.getBySel("phone-field").type("98765432");
    cy.getBySel("address-field").type("Cali");
    cy.getBySel("postal-code-field").type("7032");
    cy.getBySel("birthday-field").type("16032010");
    cy.getBySel("tos-field").dblclick();

    cy.getBySel("submit-button").should("not.be.disabled");
    cy.getBySel("error-message").should("not.exist");
  });

  it("cannot register when email is invalid", () => {
    cy.getBySel("email-field").type("richard stallman");
    cy.getBySel("footer").click();
    cy.getBySel("error-message").should("be.visible");
    cy.getBySel("submit-button").should("be.disabled");
    cy.get("#email").clear();
    cy.getBySel("email-field").type("richard.stallman@protonmail.com");
    cy.getBySel("footer").click();
    cy.getBySel("error-message").should("not.exist");
    cy.getBySel("submit-button").should("not.be.disabled");
  });

  it("cannot register when passord is invalid", () => {
    cy.get("#password").clear();
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    cy.get("#password").type("pass").blur();
    cy.getBySel("error-message").should("be.visible");
    cy.getBySel("submit-button").should("be.disabled");
    cy.getBySel("password-field").type("battery horse staple");
    cy.getBySel("error-message").should("not.exist");
    cy.getBySel("submit-button").should("not.be.disabled");
  });

  it("cannot register when birthday is invalid", () => {
    cy.getBySel("email-field").type("richard.stallman@protonmail.com");
    cy.get("#birthday").clear();
    cy.getBySel("birthday-field").type("23. januar 2002");
    cy.getBySel("error-message").should("be.visible");
    cy.getBySel("submit-button").should("be.disabled");
    cy.get("#birthday").clear();
    cy.getBySel("birthday-field").type("23/01/2002");
    cy.getBySel("error-message").should("not.exist");
    cy.getBySel("submit-button").should("not.be.disabled");
  });
});
