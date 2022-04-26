import {signIn} from 'next-auth/react';

describe('Navigation', () => {
    beforeEach(async () => {
        await signIn('credentials',
            {redirect: false, email: "user_admin@test.be", password: "Test123!user_admin"});
    });

    it('should navigate to the select students page', () => {
        cy.visit("/");
        cy.contains("a", "select students", {matchCase: false}).click();
        cy.url().should("contain", "students");
    });

    it('should navigate to the select students page', () => {
        cy.visit("/");
        cy.contains("a", "email students", {matchCase: false}).click();
        cy.url().should("contain", "students").should("contain", "email");
    });

    it('should navigate to the projects page', () => {
        cy.visit("/");
        cy.contains("a", "projects", {matchCase: false}).click();
        cy.url().should("contain", "projects");
    });

    it('should navigate to the settings page', () => {
        cy.visit("/");
        cy.contains("a", "settings", {matchCase: false}).click();
        cy.url().should("contain", "settings");
    });
});
