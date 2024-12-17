describe("Forgot password", () => {
  it("can navigate to and from forgot page", () => {
    cy.visit("/");
    cy.getBySel("MenuIcon").click();
    cy.get(".MuiListItemButton-root").eq(5).click();
    cy.getBySel("forgot-password").click();
    cy.url().should("include", "forgot");
    cy.getBySel("login").click();
    cy.url().should("include", "login");
    cy.getBySel("forgot-password").click();
  });

  it("accepts a legal email", () => {
    cy.visit("/auth/forgot");
    cy.getBySel("email-field").type("petter@hansen.no");
    cy.getBySel("error-message").should("not.exist");
    cy.getBySel("forgot-submit").should("not.be.disabled");
  });

  it("rejects a badly formatted email", { scrollBehavior: false }, () => {
    cy.visit("/auth/forgot");
    cy.getBySel("forgot-submit").click();
    cy.getBySel("forgot-submit").click();
    cy.getBySel("error-message").should("contain", "Du må fylle inn epost");
    cy.getBySel("forgot-submit").should("be.disabled");

    cy.getBySel("email-field").type("petter@");
    cy.getBySel("error-message").should(
      "contain",
      "Du må fylle inn en gyldig epost",
    );
    cy.getBySel("forgot-submit").should("be.disabled");

    cy.getBySel("email-field").type("hansen.no");
    cy.getBySel("error-message").should("not.exist");
    cy.getBySel("forgot-submit").should("not.be.disabled");
  });
});
