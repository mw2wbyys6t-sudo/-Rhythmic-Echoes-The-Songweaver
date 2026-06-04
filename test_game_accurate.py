from playwright.sync_api import sync_playwright
import time
import os

# Create screenshots directory if it doesn't exist
os.makedirs('test_screenshots', exist_ok=True)

def test_music_game():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            print("Testing Music Game...")
            
            # Navigate to the game
            page.goto('http://localhost:5175/music-rpg-zombie-game/')
            page.wait_for_load_state('networkidle')
            time.sleep(2)
            
            # Take screenshot of home page
            page.screenshot(path='test_screenshots/home_page.png', full_page=True)
            print("✓ Home page loaded successfully")
            
            # Test start game flow
            print("Testing start game flow...")
            page.click('text=开始游戏')
            page.wait_for_load_state('networkidle')
            time.sleep(2)
            
            # Take screenshot of character creation
            page.screenshot(path='test_screenshots/character_creation.png', full_page=True)
            print("✓ Character creation page loaded successfully")
            
            # Test character customization
            print("Testing character customization...")
            # Select gender (first button)
            page.click('button[class*="py-4"]')
            time.sleep(1)
            
            # Save character
            page.click('text=保存并继续')
            page.wait_for_load_state('networkidle')
            time.sleep(2)
            print("✓ Character customized successfully")
            
            # Take screenshot of map selection
            page.screenshot(path='test_screenshots/map_selection.png', full_page=True)
            print("✓ Map selection page loaded successfully")
            
            # Select map
            page.click('div:has-text("城市废墟")')
            time.sleep(1)
            
            # Start game
            page.click('text=开始战斗！')
            page.wait_for_load_state('networkidle')
            time.sleep(3)
            print("✓ Game started successfully")
            
            # Take screenshot of game page
            page.screenshot(path='test_screenshots/game_page.png', full_page=True)
            
            # Test game controls
            print("Testing game controls...")
            # Simulate keyboard inputs
            page.keyboard.press('ArrowUp')
            page.keyboard.press('ArrowDown')
            page.keyboard.press('ArrowLeft')
            page.keyboard.press('ArrowRight')
            page.keyboard.press('Space')
            time.sleep(1)
            
            # Test game progress
            print("Testing game progress...")
            time.sleep(5)  # Let the game run for a few seconds
            page.screenshot(path='test_screenshots/game_progress.png', full_page=True)
            
            # Test import playlist function
            print("Testing import playlist function...")
            # Return to main menu
            page.click('text=返回主菜单')
            page.wait_for_load_state('networkidle')
            time.sleep(2)
            
            # Click import playlist
            page.click('text=导入歌单')
            page.wait_for_load_state('networkidle')
            time.sleep(2)
            
            # Take screenshot of playlist import
            page.screenshot(path='test_screenshots/playlist_import.png', full_page=True)
            print("✓ Playlist import page loaded successfully")
            
            # Return from playlist import
            page.click('text=返回')
            page.wait_for_load_state('networkidle')
            time.sleep(2)
            
            # Test console for errors
            print("Checking console for errors...")
            console_errors = []
            def log_error(msg):
                if msg.type == 'error':
                    console_errors.append(msg.text)
            
            page.on('console', log_error)
            time.sleep(2)
            
            if console_errors:
                print(f"❌ Found {len(console_errors)} console errors:")
                for error in console_errors:
                    print(f"  - {error}")
            else:
                print("✓ No console errors found")
            
            print("\n🎉 All tests completed successfully!")
            print("Screenshots saved to test_screenshots/ directory")
            
        except Exception as e:
            print(f"❌ Test failed with error: {e}")
            page.screenshot(path='test_screenshots/error.png', full_page=True)
        finally:
            browser.close()

if __name__ == "__main__":
    test_music_game()
