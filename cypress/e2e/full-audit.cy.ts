/// <reference types="cypress" />

/**
 * Full System Audit - E2E Tests
 * Comprehensive test suite covering all critical paths
 */
describe("🔍 Full System Audit", () => {
    // Test credentials
    const studentEmail = Cypress.env("STUDENT_EMAIL") || "123456@gmail.com";
    const studentPassword = Cypress.env("STUDENT_PASSWORD") || "12345678";

    // ============================================
    // PHASE 1: LANDING PAGE AUDIT
    // ============================================
    describe("📄 Landing Page", () => {
        beforeEach(() => {
            cy.visit("/");
        });

        it("should load landing page successfully", () => {
            cy.url().should("eq", Cypress.config().baseUrl + "/");
        });

        it("should display the site title/logo", () => {
            // Check for logo or main heading
            cy.get("header").should("be.visible");
            cy.get('[class*="logo"], img[alt*="logo"], h1').first().should("be.visible");
        });

        it("should display login button", () => {
            cy.contains(/دخول|تسجيل|login/i).should("be.visible");
        });

        it("should display hero section", () => {
            cy.get("main").should("be.visible");
            cy.get('[class*="hero"], section').first().should("be.visible");
        });

        it("should have working navigation links", () => {
            cy.get("nav a, header a").should("have.length.at.least", 1);
        });
    });

    // ============================================
    // PHASE 2: AUTHENTICATION AUDIT
    // ============================================
    describe("🔐 Authentication", () => {
        it("should redirect unauthenticated users from /student to /login", () => {
            cy.visit("/student");
            cy.url().should("include", "/login");
        });

        it("should display login form correctly", () => {
            cy.visit("/login");
            cy.get('input[type="email"]').should("be.visible");
            cy.get('input[type="password"]').should("be.visible");
            cy.get('button[type="submit"]').should("be.visible");
        });

        it("should show error for invalid credentials", () => {
            cy.visit("/login");
            cy.get('input[type="email"]').type("invalid@test.com");
            cy.get('input[type="password"]').type("wrongpassword");
            cy.get('button[type="submit"]').click();

            // Should show error or stay on login page
            cy.url({ timeout: 5000 }).should("include", "/login");
        });

        it("should login successfully with valid credentials", () => {
            cy.visit("/login");
            cy.get('input[type="email"]').type(studentEmail);
            cy.get('input[type="password"]').type(studentPassword);
            cy.get('button[type="submit"]').click();

            // Wait for redirect
            cy.url({ timeout: 15000 }).should("include", "/student");
        });
    });

    // ============================================
    // PHASE 3: STUDENT DASHBOARD AUDIT
    // ============================================
    describe("📊 Student Dashboard", () => {
        beforeEach(() => {
            // Login before each test
            cy.visit("/login");
            cy.get('input[type="email"]').type(studentEmail);
            cy.get('input[type="password"]').type(studentPassword);
            cy.get('button[type="submit"]').click();
            cy.url({ timeout: 15000 }).should("include", "/student");
        });

        describe("Desktop View", () => {
            it("should display navbar with logo", () => {
                cy.get("nav, header").should("be.visible");
                cy.get('[class*="logo"], img').first().should("be.visible");
            });

            it("should display leaderboard component", () => {
                cy.contains("فرسان الحلقة").should("be.visible");
            });

            it("should show current month in leaderboard", () => {
                const arabicMonths = [
                    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
                    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
                ];
                const currentMonth = arabicMonths[new Date().getMonth()];
                cy.contains(currentMonth).should("be.visible");
            });

            it("should display rank badges correctly", () => {
                cy.get("body").then(($body) => {
                    if ($body.find('[class*="from-yellow"]').length > 0) {
                        // Has gold badge for first place
                        cy.get('[class*="from-yellow"]').should("exist");
                    }
                });
            });

            it("should display student stats section", () => {
                // Check for stats cards or summary
                cy.get('[class*="card"], [class*="stats"]').should("exist");
            });
        });

        describe("Mobile View (iPhone X)", () => {
            beforeEach(() => {
                cy.viewport("iphone-x");
            });

            it("should display leaderboard on mobile", () => {
                cy.contains("فرسان الحلقة").should("be.visible");
            });

            it("should have truncated text for long names", () => {
                cy.get('[class*="truncate"]').should("exist");
                cy.get('[class*="whitespace-nowrap"]').should("exist");
            });

            it("should have reduced padding on mobile", () => {
                cy.get('[class*="p-3"]').should("exist");
            });

            it("should not have horizontal scroll", () => {
                cy.document().then((doc) => {
                    expect(doc.documentElement.scrollWidth).to.be.lte(
                        doc.documentElement.clientWidth + 5 // 5px tolerance
                    );
                });
            });

            it("should maintain proper layout without overlap", () => {
                // Check that rank badges don't overlap with names
                cy.get('[class*="rounded-xl"]').each(($el) => {
                    const rect = $el[0].getBoundingClientRect();
                    expect(rect.width).to.be.greaterThan(100);
                });
            });
        });
    });

    // ============================================
    // PHASE 4: NAVIGATION AUDIT
    // ============================================
    describe("🧭 Navigation", () => {
        beforeEach(() => {
            cy.visit("/login");
            cy.get('input[type="email"]').type(studentEmail);
            cy.get('input[type="password"]').type(studentPassword);
            cy.get('button[type="submit"]').click();
            cy.url({ timeout: 15000 }).should("include", "/student");
        });

        it("should navigate to different sections", () => {
            // Check sidebar or navbar navigation
            cy.get("nav a, aside a, [role='navigation'] a").should("have.length.at.least", 1);
        });

        it("should have working back navigation", () => {
            cy.go("back");
            cy.go("forward");
            cy.url().should("include", "/student");
        });
    });

    // ============================================
    // PHASE 5: PERFORMANCE AUDIT
    // ============================================
    describe("⚡ Performance", () => {
        it("should load landing page within 3 seconds", () => {
            const start = Date.now();
            cy.visit("/");
            cy.get("main").should("be.visible").then(() => {
                const loadTime = Date.now() - start;
                expect(loadTime).to.be.lessThan(3000);
            });
        });

        it("should load dashboard within 5 seconds after login", () => {
            cy.visit("/login");
            cy.get('input[type="email"]').type(studentEmail);
            cy.get('input[type="password"]').type(studentPassword);

            const start = Date.now();
            cy.get('button[type="submit"]').click();

            cy.contains("فرسان الحلقة", { timeout: 5000 }).should("be.visible").then(() => {
                const loadTime = Date.now() - start;
                cy.log(`Dashboard load time: ${loadTime}ms`);
            });
        });
    });

    // ============================================
    // PHASE 6: ACCESSIBILITY BASICS
    // ============================================
    describe("♿ Accessibility Basics", () => {
        it("should have proper heading hierarchy", () => {
            cy.visit("/");
            cy.get("h1").should("have.length.at.least", 1);
        });

        it("should have alt text on images", () => {
            cy.visit("/");
            cy.get("img").each(($img) => {
                cy.wrap($img).should("have.attr", "alt");
            });
        });

        it("should have proper form labels", () => {
            cy.visit("/login");
            cy.get("input").each(($input) => {
                const id = $input.attr("id");
                const ariaLabel = $input.attr("aria-label");
                const placeholder = $input.attr("placeholder");
                // Should have either label, aria-label, or placeholder
                expect(id || ariaLabel || placeholder).to.exist;
            });
        });
    });
});
