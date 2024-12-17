Cypress.Commands.add("logout", () => {
  cy.visit("/");
  cy.getBySel("MenuIcon").click();
  cy.get(".MuiListItemButton-root")
    .eq(5)
    .invoke("text")
    .then((button) => {
      if (button.includes("Logg inn")) {
        cy.get("html").click("topLeft");
      } else {
        cy.get(".MuiListItemButton-root").eq(7).click();
      }
    });
});

Cypress.Commands.add("login", (username, password) => {
  cy.visit("/");
  cy.logout();
  cy.visit("/auth/login");
  cy.getBySel("email-field").type(username);
  cy.getBySel("password-field").type(password);
  cy.intercept("/auth/local/login").as("login");
  cy.getBySel("login-submit").click();
  cy.wait("@login").its("response.statusCode").should("eq", 200);
});

Cypress.Commands.add("getBySel", (selector, ...arguments_) => {
  return cy.get(`[data-testid=${selector}]`, ...arguments_);
});
