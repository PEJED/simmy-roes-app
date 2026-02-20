from playwright.sync_api import sync_playwright

def verify_wizard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to app...")
            page.goto("http://localhost:3005/simmy-roes-app/")

            # 1. Step 1: Select Direction
            print("Selecting Informatics (Πληροφορικής)...")
            # Find the button that contains "Πληροφορικής"
            informatics_btn = page.locator("button:has-text('Πληροφορικής')")
            informatics_btn.click()

            # 2. Check Validation Error (Should be present initially or after interaction?)
            # The "Next" button should be disabled.
            next_btn = page.locator("button:has-text('Επόμενο Βήμα')")
            if not next_btn.is_disabled():
                print("FAIL: Next button should be disabled initially.")
            else:
                print("PASS: Next button is disabled.")

            # 3. Configure Flows
            # Required: Y (Full), L (Full), + 1 Half/Full

            # Select Full for Y (Υπολογιστές)
            # Find row for Y
            print("Selecting Full Y...")
            page.locator("div").filter(has_text="Υπολογιστές (Y)").locator("button:has-text('Ολόκληρη')").click()

            # Select Full for L (Λογισμικό)
            print("Selecting Full L...")
            page.locator("div").filter(has_text="Λογισμικό (L)").locator("button:has-text('Ολόκληρη')").click()

            # Still invalid? (Need 1 more half)
            if not next_btn.is_disabled():
                 print("FAIL: Should still be disabled (missing 1/2 flow).")

            # Select Half for D (Δίκτυα)
            print("Selecting Half D...")
            page.locator("div").filter(has_text="Δίκτυα (D)").locator("button:has-text('Μισή')").click()

            # Now should be valid
            if next_btn.is_disabled():
                print("FAIL: Should be enabled now.")
            else:
                print("PASS: Next button enabled.")
                next_btn.click()

            # 4. Step 2: Check Course Filtering
            print("Checking Step 2...")
            page.wait_for_selector("text=Επιλογή Μαθημάτων")

            # Should see Y courses, L courses, D courses.
            # Should NOT see Energy (E) courses unless Core/Free.

            # Check for a specific Y course "Λειτουργικά Συστήματα"
            if page.locator("text=Λειτουργικά Συστήματα").count() > 0:
                print("PASS: Found Y course.")
            else:
                print("FAIL: Missing Y course.")

            # Check for Accordion functionality
            # Click on card header
            print("Testing Accordion...")
            card = page.locator("div").filter(has_text="Λειτουργικά Συστήματα").first()
            # Click strictly on the header area to expand, avoiding buttons if any
            card.click()

            # Check for description visibility
            if page.locator("text=Θεμελιώδεις έννοιες").is_visible():
                 print("PASS: Accordion expanded.")
            else:
                 print("FAIL: Description not visible.")

            # Take screenshot
            page.screenshot(path="verification/wizard_success.png")
            print("Screenshot saved.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/wizard_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_wizard()
