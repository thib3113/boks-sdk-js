from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Get absolute path
        cwd = os.getcwd()

        # 1. Verify initialization-demo.html
        init_path = f"file://{cwd}/examples/initialization-demo.html"
        print(f"Navigating to {init_path}")
        page.goto(init_path)
        page.screenshot(path="verification/verification_init.png", full_page=True)
        print("Screenshot saved to verification/verification_init.png")

        # 2. Verify provisioning-demo.html
        prov_path = f"file://{cwd}/examples/provisioning-demo.html"
        print(f"Navigating to {prov_path}")
        page.goto(prov_path)
        page.screenshot(path="verification/verification_prov.png", full_page=True)
        print("Screenshot saved to verification/verification_prov.png")

        browser.close()

if __name__ == "__main__":
    run()
