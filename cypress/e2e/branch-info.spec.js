describe("Info pages", () => {
  beforeEach(() => {
    cy.visit("/info/branch/select");
  });

  describe("as a customer", () => {
    it("displays branch select when branch is not present", () => {
      cy.getBySel("branchSelect").should("have.length", 2);
    });

    it("displays an info box and contact info when there are no opening hours", () => {
      cy.getBySel("branchSelect").eq(1).click();
      cy.getBySel("branchOption").should("have.length", 4);
      cy.getBySel("branchOption").eq(0).click();
      cy.url().should("contain", "/info/branch/60074e293309ff001a51b244");
      cy.getBySel("noHours").should("exist");
    });

    it("only displays future opening hours for current branch", () => {
      cy.getBySel("branchSelect").eq(1).click();
      cy.getBySel("branchOption").eq(2).click();
      cy.getBySel("openingHourRow").should("have.length", 2);
      cy.getBySel("branch-address").should("exist");
    });
  });
});
