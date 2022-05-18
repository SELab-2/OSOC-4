import {signIn} from 'next-auth/react';

describe('Navigation', () => {
    beforeEach(() => {
        signIn('credentials',
            {redirect: false, email: "user_admin@test.be", password: "Test123!user_admin"});
        cy.visit("/");
    });

    it('should navigate to the students page', () => {
        cy.contains("a", "students", {matchCase: false}).click();
        cy.url().should("contain", "students");
    });

    // uncaught application error
    it('should navigate to the projects page', () => {
        cy.contains("a", "projects", {matchCase: false}).click();
        cy.url().should("contain", "projects");
    });

    it('should navigate to the settings page', () => {
        cy.contains("a", "settings", {matchCase: false}).click();
        cy.url().should("contain", "settings");
    });
});
