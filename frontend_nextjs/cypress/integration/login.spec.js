describe("Test login page", () => {
    beforeEach(()=> {
        cy.visit("/login");
    });

    it("Should login", () => {
        let email = "user_admin@test.be";
        let password = "Test123!user_admin";

        // login
        cy.get("input[name='email']").notDisabledType(email).should("have.value", email);
        cy.get("input[name='password']").notDisabledType(password).should("have.value", password);
        cy.get("button.submit").click();

        // check link
        cy.url().should("eq", Cypress.config().baseUrl + "/");// Check we are in homepage

        // logout
        cy.contains("log out", {matchCase: false}).click();

        // check link
        cy.url().should("eq", Cypress.config().baseUrl + "/login")// Check we are in login
    });

    it("Should fail login by bad password.", () => {
        let email = "user_admin@test.be";
        let password = "bad password";

        cy.get("input[name='email']").notDisabledType(email).should("have.value", email);
        cy.get("input[name='password']").notDisabledType(password).should("have.value", password);
        cy.get("button.submit").click();

        cy.contains("Login failed", {matchCase: false});
    });

    it("Should fail login by bad user.", () => {
        let email = "user_unactivated@test.be";
        let password = "Test123!user_unactivated_coach";

        cy.get("input[name='email']").notDisabledType(email).should("have.value", email);
        cy.get("input[name='password']").notDisabledType(password).should("have.value", password);
        cy.get(".submit").click();

        cy.contains("Login failed", {matchCase: false});
    });

    it("Reset password and return to login.", () => {
        let email = "just.a.test@test.test";
        cy.contains("Forgot your password").click();
        cy.get("input[name='email']").notDisabledType(email).should("have.value", email);
        cy.get(".submit").click();

        cy.get("input[name='email']");
    });
});
