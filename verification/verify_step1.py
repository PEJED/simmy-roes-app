from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        try:
            print("Navigating to home...")
            page.goto("http://localhost:5180/simmy-roes-app/")
            page.wait_for_load_state("networkidle")

            # Wait for content
            page.wait_for_selector("text=Επιλογή Κατεύθυνσης", timeout=5000)

            # Take screenshot of Step 1
            print("Taking screenshot of Step 1...")
            page.screenshot(path="verification/step1_optimized.png", full_page=True)

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
