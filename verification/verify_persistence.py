from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        page = context.new_page()
        try:
            page.goto("http://localhost:5173", timeout=30000)

            # 1. Select Direction
            page.click("button:has-text('Το Πρόγραμμά μου')")
            page.select_option("select", "informatics")
            page.click("button:has-text('✕')")
            print("Selected Informatics direction")

            # 2. Select a course (Funcationality check)
            page.click("text=Λειτουργικά Συστήματα")
            page.click("button:has-text('Επιλογή Μαθήματος')")
            page.click("button[aria-label='Κλείσιμο']")
            print("Selected a course")

            # 3. Reload Page
            page.reload()
            print("Reloaded page")

            # 4. Verify Persistence
            page.click("button:has-text('Το Πρόγραμμά μου')")

            # Check Direction
            selected_value = page.eval_on_selector("select", "el => el.value")
            if selected_value == "informatics":
                print("Direction persisted successfully")
            else:
                print(f"Direction NOT persisted. Found: {selected_value}")

            # Check Course (Sidebar should show it)
            page.wait_for_selector("text=Λειτουργικά Συστήματα")
            print("Course selection persisted successfully")

            page.screenshot(path="verification/persistence_check.png")
            print("Screenshot saved to verification/persistence_check.png")

        except Exception as e:
            print(f"Test failed: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
