/// <reference types="cypress" />

/**
 * Student Dashboard E2E Tests
 * Tests the critical path: Login → Dashboard → Leaderboard visibility
 */
describe("Student Dashboard", () => {
    // Test credentials (use environment variables in production)
    const testEmail = Cypress.env("STUDENT_EMAIL") || "student@test.com";
    const testPassword = Cypress.env("STUDENT_PASSWORD") || "password123";

    beforeEach(() => {
        // Clear any previous session
        cy.clearLocalStorage();
        cy.clearCookies();
    });

    describe("Authentication Flow", () => {
        it("should redirect unauthenticated users to login", () => {
            cy.visit("/student");
            cy.url().should("include", "/login");
        });

        it("should login successfully with valid credentials", () => {
            cy.visit("/login");

            // Fill in login form
            cy.get('input[type="email"]').type(testEmail);
            cy.get('input[type="password"]').type(testPassword);
            cy.get('button[type="submit"]').click();

            // Wait for redirect
            cy.url({ timeout: 15000 }).should("include", "/student");
        });
    });

    describe("Leaderboard Component - Desktop", () => {
        beforeEach(() => {
            // Login before each test
            cy.visit("/login");
            cy.get('input[type="email"]').type(testEmail);
            cy.get('input[type="password"]').type(testPassword);
            cy.get('button[type="submit"]').click();
            cy.url({ timeout: 15000 }).should("include", "/student");
        });

        it("should display leaderboard section", () => {
            // Check for leaderboard title
            cy.contains("فرسان الحلقة").should("be.visible");
        });

        it("should show month indicator", () => {
            // Verify current month is displayed in Arabic
            const arabicMonths = [
                "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
                "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
            ];
            const currentMonth = arabicMonths[new Date().getMonth()];
            cy.contains(currentMonth).should("be.visible");
        });

        it("should display student list or empty state", () => {
            // Either has students or shows empty message
            cy.get("body").then(($body) => {
                if ($body.find('[class*="grid"]').length > 0) {
                    // Has students - check list items
                    cy.get('[class*="rounded-xl"]').should("have.length.at.least", 1);
                } else {
                    // Empty state
                    cy.contains("لا توجد بيانات").should("be.visible");
                }
            });
        });

        it("should display rank badges for top 3", () => {
            // Check for gold/silver/bronze badges (gradient classes)
            cy.get('[class*="from-yellow"]').should("exist"); // Gold
        });
    });

    describe("Leaderboard Component - Mobile", () => {
        beforeEach(() => {
            // Set mobile viewport
            cy.viewport("iphone-x");

            // Login
            cy.visit("/login");
            cy.get('input[type="email"]').type(testEmail);
            cy.get('input[type="password"]').type(testPassword);
            cy.get('button[type="submit"]').click();
            cy.url({ timeout: 15000 }).should("include", "/student");
        });

        it("should display leaderboard on mobile", () => {
            cy.contains("فرسان الحلقة").should("be.visible");
        });

        it("should have truncated names on mobile (no wrapping)", () => {
            // Verify text truncation classes are applied
            cy.get('[class*="truncate"]').should("exist");
            cy.get('[class*="whitespace-nowrap"]').should("exist");
        });

        it("should have reduced padding on mobile", () => {
            // CardContent should have p-3 class on mobile
            cy.get('[class*="p-3"]').should("exist");
        });

        it("should fit content without horizontal scroll", () => {
            // Check no horizontal overflow
            cy.document().then((doc) => {
                expect(doc.documentElement.scrollWidth).to.be.lte(doc.documentElement.clientWidth);
            });
        });
    });

    describe("Performance Checks", () => {
        it("should load dashboard within acceptable time", () => {
            cy.visit("/login");
            cy.get('input[type="email"]').type(testEmail);
            cy.get('input[type="password"]').type(testPassword);
            cy.get('button[type="submit"]').click();

            // Dashboard should load within 5 seconds
            cy.contains("فرسان الحلقة", { timeout: 5000 }).should("be.visible");
        });
    });
});
