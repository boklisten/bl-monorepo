describe("Settings page", () => {
  before(() => {
    cy.visit("/");
  });
  beforeEach(() => {
    cy.login("admin@adminsen.no", "superuser");
  });
  it("displays correct inital elements", () => {
    cy.visit("/");
    cy.getBySel("MenuIcon").click();
    cy.get(".MuiListItemButton-root").eq(6).click();

    cy.getBySel("facebook-button").should("not.to.exist");
    cy.getBySel("google-button").should("not.to.exist");
    cy.getBySel("email-field").should("be.visible");
    cy.getBySel("password-field").should("not.to.exist");
    cy.getBySel("submit-button").should("be.visible");
    cy.getBySel("login-link").should("not.to.exist");

    cy.getBySel("error-message").should("not.exist");
    cy.getBySel("first-name-field").should("be.visible");
    cy.getBySel("last-name-field").should("be.visible");
    cy.getBySel("phone-field").should("be.visible");
    cy.getBySel("address-field").should("be.visible");
    cy.getBySel("postal-code-field").should("be.visible");
    cy.getBySel("postal-city-preview").should("exist");
    cy.getBySel("birthday-field").should("exist");
    cy.getBySel("guardian-name-field").should("not.exist");
    cy.getBySel("guardian-email-field").should("not.exist");
    cy.getBySel("guardian-phone-field").should("not.exist");
    cy.getBySel("tos-field").should("not.exist");
  });
});
