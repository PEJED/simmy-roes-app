from playwright.sync_api import sync_playwright

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to app...")
            response = page.goto("http://localhost:3000")
            print(f"Status: {response.status if response else 'No response'}")

            # Wait for content to load
            print("Waiting for title...")
            page.wait_for_selector("h1", timeout=10000)

            # Take screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/app_preview.png")
            print("Screenshot saved to verification/app_preview.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_state.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app()
