describe("Test login page", () => {
    beforeEach(() => {
        cy.visit("/login")
    })

    it("Should login", () => {
        let email = "user_admin@test.be"
        let password = "Test123!user_admin"

        cy.get("input[name='email']").type(email).should("have.value", email)
        cy.get("input[name='password']").type(password).should("have.value", password)
        // .should("not.exist") is used to check whether login changed pages
        cy.get("button.submit").click()

        cy.url().should("eq", Cypress.config().baseUrl + "/")// Check we are in homepage (by url at least)
        cy.get('.navbar') // Check if content is as expected, todo find a better way to check this
    })

    it("Should fail login by bad password.", () => {
        let email = "user_admin@test.be"
        let password = "bad password"

        cy.get("input[name='email']").type(email).should("have.value", email)
        cy.get("input[name='password']").type(password).should("have.value", password)
        // .should("not.exist") is used to check whether login changed pages
        cy.get("button.submit").click()
        cy.contains("Login failed")
    })

    it("Should fail login by bad user.", () => {
        let email = "user_unactivated@test.be"
        let password = "Test123!user_unactivated_coach"

        cy.get("input[name='email']").type(email).should("have.value", email)
        cy.get("input[name='password']").type(password).should("have.value", password)
        // .should("not.exist") is used to check whether login changed pages
        cy.get(".submit").click()
        cy.contains("Login failed")
    })

    it("Reset password and return to login.", () => {
        let email = "just.a.test@test.test"
        cy.contains("Forgot your password").click()
        cy.get("input[name='email']").type(email).should("have.value", email)
        cy.get(".submit").click()
        cy.get("input[name='email']")
    })
})