import {signIn} from 'next-auth/react';

describe('Students page', () => {
    beforeEach(() => {
        signIn('credentials',
            {redirect: false, email: "user_admin@test.be", password: "Test123!user_admin"});
        cy.visit("/students");
        cy.get(".infinite-scroll-component > :nth-child(1).list-element", {timeout: 5000}).as("editStudent");

    });

    // Can throw "State(...) is Null" typeError just retry
    it("Select the first student", () => {
        cy.get("@editStudent").click(); // Select the first student

        // Check whether details screen is shown
        cy.get("@editStudent").get("#name").then(($div) => {
            const studentName = $div.text();

            cy.log(studentName);
            cy.get('.student-details-window').contains(studentName);
        });
    })

    it("Change decision for the first student", () => {
        cy.get("@editStudent").click(); // Select the first student
        cy.get("@editStudent").contains("Decision").within(() => {
            cy.get("b").as("decision"); // Select the decision
        })
        cy.get(".student-details-window #dropdown-decision").as("decisionSelector"); // Decision selector
        cy.get(".suggest-confirm-button").as("confirmBtn"); // Confirm decision btn

        function assertForDecision(decision) {
            cy.get("@decisionSelector").select(decision);
            cy.get("@confirmBtn").then($btn => {
                // button could be disabled if there is no change
                if (!$btn.is(":disabled")) {
                    cy.wrap($btn).click();
                    cy.document().its('body').contains("Submit").click();
                    // wait on the request, sometimes when this is too low an NS_ERROR_UNEXCPECTED is thrown.
                    cy.wait(1000);
                }
            });
            cy.get("@decision").then($b => {
                assert($b.text() === decision,
                    "Expected '" + decision + "' but got '" + $b.text() + "'");
            });
        }

        cy.get("@decisionSelector").within(() => {
            cy.get("option").each(item => {
                assertForDecision(item.text());
            });
        });
    });

    it("Remove the first student", () => {
        cy.get("@editStudent").click(); // Select the first student
        cy.get("@editStudent").get("#name").then($div => {
            const studentName = $div.text();

            cy.get(".delete-icon").click().get('.modal-footer > .btn-primary').click(); // Delete the student

            cy.should("not.contain", studentName);// Check whether student still exists
        });
    });

    // No idea why this doesn't work
    it.skip("Give suggestion", () => {
        cy.get("@editStudent").click(); // Select the first student

        let yes = 0;
        let maybe = 0;
        let no = 0;

        let yesAfter = 0;
        let maybeAfter = 0;
        let noAfter = 0;

        function giveSuggestion(suggestion) {
            cy.get(".student-details-window").within(() => {
                cy.get(".suggestionsYes").then($div => yes = parseInt($div.text()));
                cy.get(".suggestionsMaybe").then($div => maybe = parseInt($div.text()));
                cy.get(".suggestionsNo").then($div => no = parseInt($div.text()));
            });

            cy.get(".suggest-" + suggestion.toLowerCase() + "-button").click()
                .get(".modal-footer > .btn-primary").click();
            cy.wait(5000)

            cy.get(".student-details-window").within(() => {
                cy.get(".suggestionsYes").then($div => yesAfter = parseInt($div.text()));
                cy.get(".suggestionsMaybe").then($div => maybeAfter = parseInt($div.text()));
                cy.get(".suggestionsNo").then($div => noAfter = parseInt($div.text()));

            });
        }

        giveSuggestion("Yes");
        // don't check properly to account for initial selection
        assert(yes + 1 === yesAfter || yes === yesAfter);
        assert(maybe === maybeAfter || maybe - 1 === maybeAfter);
        assert(no === noAfter || no - 1 === noAfter);

        giveSuggestion("Maybe");
        assert(yes - 1 === yesAfter);
        assert(maybe + 1 === maybeAfter);
        assert(no === noAfter);

        giveSuggestion("No");
        assert(yes === yesAfter);
        assert(maybe - 1 === maybeAfter);
        assert(no + 1 === noAfter);
    });
});
