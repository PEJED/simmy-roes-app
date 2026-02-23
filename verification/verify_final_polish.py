from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1280, 'height': 800})
    page = context.new_page()

    try:
        print("Navigating to app...")
        page.goto("http://localhost:3000")
        page.wait_for_load_state("networkidle")

        # Step 1: Select Direction (e.g. Informatics)
        print("Selecting Direction...")
        page.locator("text=Πληροφορικής").click()

        # Step 2: Select Combination
        print("Checking Step 2...")
        page.wait_for_selector("text=Επιλογή Συνδυασμού Ροών", timeout=5000)

        # Select first option (Y + L + Other)
        page.locator("text=Ολόκληρη Υ + Ολόκληρη Λ").first.click()

        # Select Other Flow (e.g. D Half)
        print("Selecting Other Flow...")
        # Now D should be cards too.
        # Find card for "Ροή Δ".
        # Locate the button "½".
        # Since we changed it to cards, the structure should be similar to Step2_Flows.tsx logic.
        # Button text "½".
        # Find div with "Ροή Δ" and click "½" button inside.
        card = page.locator("div").filter(has_text="Ροή Δ").filter(has_text="½").last
        card.locator("button", has_text="½").click()

        # Click Next
        print("Clicking Next...")
        page.locator("button", has_text="Συνέχεια").click()

        # Step 3
        print("Checking Step 3...")
        page.wait_for_selector("text=Επιλογή Μαθημάτων", timeout=5000)

        # Verify Sticky Header
        # This is visual, but we can check if header exists.
        if page.locator("header, div.sticky").count() > 0:
            print("Sticky Header detected (by class/tag)")

        # Verify Sidebar Stats
        # Should show "Remaining" logic.
        if page.locator("text=Απομενουν").count() > 0:
            print("'Remaining' text found in sidebar.")
        else:
            print("'Remaining' text NOT found.")

        # Verify >12 warning is NOT present initially
        if page.locator("text=>12 Μαθηματα").count() == 0:
            print(">12 Warning correctly absent.")
        else:
            print(">12 Warning present unexpectedly.")

        # Verify Footer Stats (Theory/Lab)
        if page.locator("text=Θεωρία:").count() > 0 and page.locator("text=Εργαστήριο:").count() > 0:
            print("Footer Theory/Lab Stats Found")
        else:
            print("Footer Theory/Lab Stats Missing")

        page.screenshot(path="verification/verify_final_polish.png", full_page=True)
        print("Screenshot saved to verification/verify_final_polish.png")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error_final.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
