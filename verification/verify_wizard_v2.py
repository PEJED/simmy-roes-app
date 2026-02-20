from playwright.sync_api import sync_playwright

def verify_wizard_v2():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Note: We need to use the full path now if running on the base path version
            # Assuming 'http://localhost:3000/simmy-roes-app/' based on previous config
            # But let's check if we reverted to root or not.
            # I reverted vite.config.ts to base: '/simmy-roes-app/' but didn't set port.
            # I should probably just check localhost:5173 or whatever 'npm run dev' output last.
            # Let's assume the user runs it on port 3000 via my setup.

            app_url = "http://localhost:5179/simmy-roes-app/" # Based on last successful check
            print(f"Navigating to {app_url}...")
            page.goto(app_url)

            # 1. Select Informatics
            print("Selecting Informatics...")
            page.locator("button:has-text('Πληροφορικής')").click()

            # 2. Test Case 1: Full Y + Full L + Half Other (D)
            # Cycle Y to Full (2 clicks: None->Half->Full)
            y_btn = page.locator("button:has-text('Υπολογιστές')")
            y_btn.click() # Half
            y_btn.click() # Full

            # Cycle L to Full
            l_btn = page.locator("button:has-text('Λογισμικό')")
            l_btn.click() # Half
            l_btn.click() # Full

            # Next button should still be disabled (need half other)
            next_btn = page.locator("button:has-text('Επόμενο Βήμα')")
            if not next_btn.is_disabled():
                 print("FAIL: Case 1 (Partial) - Should be disabled.")

            # Cycle D to Half (1 click)
            d_btn = page.locator("button:has-text('Δίκτυα')")
            d_btn.click() # Half

            if next_btn.is_disabled():
                 print("FAIL: Case 1 (Complete) - Should be enabled.")
            else:
                 print("PASS: Case 1 (Full Y, Full L, Half D) is Valid.")

            # Reset D to None (Half -> Full -> None)
            d_btn.click() # Full
            d_btn.click() # None

            # 3. Test Case 2: Full Y + Half L + Full D
            # Set L to Half (Full -> None -> Half)
            l_btn.click() # None
            l_btn.click() # Half

            # Set D to Full (None -> Half -> Full)
            d_btn.click()
            d_btn.click()

            if next_btn.is_disabled():
                 print("FAIL: Case 2 - Should be enabled.")
            else:
                 print("PASS: Case 2 (Full Y, Half L, Full D) is Valid.")

            # Take Screenshot of the Grid UI
            page.screenshot(path="verification/wizard_grid_ui.png")
            print("Screenshot saved.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/wizard_error_v2.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_wizard_v2()
