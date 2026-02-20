import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # 1. Step 1: Directions (Larger Cards)
        await page.goto("http://localhost:5173")
        await page.wait_for_selector("text=Επιλογή Κατεύθυνσης")
        await page.wait_for_timeout(500)
        await page.screenshot(path="verification/step1_large.png")
        print("Captured Step 1 (Large Cards)")

        # 2. Step 2: Combinations (Flow Codes)
        await page.click("text=Ηλεκτρονικής")
        await page.wait_for_selector("text=Επιλογή Συνδυασμού Ροών")
        await page.wait_for_timeout(500)

        # Select first comb to see details
        await page.click(".grid > div:first-child")
        await page.wait_for_selector("text=Διαμόρφωση")
        await page.wait_for_timeout(500)

        # Select "Other" flow to enable continue button
        # The first combination for Electronics is "H + Y + 1/2 Other"
        # Wait for the select to appear
        await page.wait_for_selector("select")

        # Select the first available option (index 1 because 0 is disabled prompt)
        # We can select by value or label. Let's select by value using JS handle or select_option
        # Let's just pick 'T:half' or 'T:full' if available. Or just select index 1.

        # Find the select element
        select_handle = await page.query_selector("select")
        # Get options
        options = await select_handle.query_selector_all("option")
        # Select the second option (first valid one)
        value = await options[1].get_attribute("value")
        await page.select_option("select", value)

        await page.wait_for_timeout(500)

        await page.screenshot(path="verification/step2_flow_codes.png")
        print("Captured Step 2 (Flow Codes)")

        # 3. Step 3: Courses (Flow Codes on Cards)
        # Now button should be enabled
        await page.click("text=Συνέχεια")
        await page.wait_for_selector("text=Επιλογή Μαθημάτων")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="verification/step3_flow_codes.png")
        print("Captured Step 3 (Flow Codes)")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
