describe("Info pages", () => {
  describe("as a customer", () => {
    beforeEach(() => {
      cy.visit("/");
      cy.getBySel("infoBtnNav").click();
    });

    it("displays editor info", () => {
      cy.getBySel("editor").should("be.visible");
    });

    it("does not display editor edit functionality", () => {
      cy.getBySel("edit-button").should("not.exist");
    });

    it("displays qna", () => {
      cy.get(".MuiNativeSelect-select").select("/info/faq");
      cy.getBySel("qna-title").should("be.visible");
      cy.getBySel("qna-entry").should("have.length", 22);
      cy.getBySel("qna-entry")
        .eq(0)
        .should(
          "contain.text",
          "Hva betyr det at Boklisten alltid leverer riktig bok?",
        );
      cy.getBySel("qna-entry-answer").eq(0).should("not.be.visible");
      cy.getBySel("qna-entry").eq(0).click();
      cy.getBySel("qna-entry-answer").eq(0).should("be.visible");

      cy.getBySel("qna-entry").eq(1).click();
      cy.getBySel("qna-entry-answer").eq(0).should("not.be.visible");
      cy.getBySel("qna-entry-answer").eq(1).should("be.visible");
    });

    it("does not display qna edit funcitonality", () => {
      cy.getBySel("question-edit-button").should("not.exist");
      cy.getBySel("add-question-button").should("not.exist");
    });

    it("displays buyback list", () => {
      cy.get(".MuiNativeSelect-select").select("/info/buyback");
      cy.intercept(`http://localhost:1337/items*`).as("fetchItems");
      cy.wait("@fetchItems");
      cy.getBySel("missing-error").should("not.exist");
      cy.getBySel("api-error").should("not.exist");
      cy.getBySel("table-row").should("have.length", 2);
    });

    it("displays contact info", () => {
      cy.get(".MuiNativeSelect-select").select("/info/contact");
      cy.getBySel("contact-phone").should("be.visible");
      cy.getBySel("contact-email").should("be.visible");
      cy.getBySel("contact-address").should("be.visible");
    });
  });

  describe("as an admin", () => {
    beforeEach(() => {
      cy.login("admin@adminsen.no", "superuser");
    });

    it("can use edit functionality", () => {
      cy.getBySel("infoBtnNav").click();
      cy.getBySel("edit-button").should("be.visible");
    });

    it("edit qna questions", () => {
      cy.visit("/info/faq");
      cy.getBySel("question-edit-button").should("be.visible");
    });

    it("can add qna questions", () => {
      cy.visit("/info/faq");
      cy.getBySel("footer").scrollIntoView();
      cy.getBySel("add-question-button").should("be.visible");
    });
  });
});
