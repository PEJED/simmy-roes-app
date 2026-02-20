import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # 1. Go to homepage
        await page.goto("http://localhost:5173")
        await page.wait_for_selector("text=Επιλογή Κατεύθυνσης")

        # 2. Select Electronics
        await page.click("text=Ηλεκτρονικής")

        # 3. Wait for Step 2 to appear
        await page.wait_for_selector("text=Επιλογή Συνδυασμού Ροών")
        await page.wait_for_timeout(500) # Wait for animation

        # Screenshot of Step 2 Initial
        await page.screenshot(path="verification/step2_initial_compact.png")
        print("Captured initial Step 2 screenshot.")

        # 4. Select the first combination (should be H + Y/S ...)
        # We look for the first element that looks like a combination card
        # The new structure has text-sm font-medium
        await page.click(".grid > div:first-child")

        # 5. Wait for Configuration Panel
        await page.wait_for_selector("text=Διαμόρφωση")
        await page.wait_for_timeout(500) # Wait for animation

        # Screenshot of Step 2 with Config
        await page.screenshot(path="verification/step2_config_compact.png")
        print("Captured Step 2 config screenshot.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
