from playwright.sync_api import sync_playwright
import time

# 测试游戏加载情况
def test_game_loading():
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            # 导航到游戏URL
            print("导航到游戏URL...")
            page.goto('https://mw2wbyys6t-sudo.github.io/music-rpg-zombie-game/')
            
            # 等待网络空闲
            print("等待网络空闲...")
            page.wait_for_load_state('networkidle')
            
            # 截图页面
            page.screenshot(path='/workspace/screenshots/game_loading.png', full_page=True)
            print("页面截图已保存")
            
            # 检查页面内容
            print("检查页面内容...")
            content = page.content()
            print(f"页面内容长度: {len(content)}")
            
            # 检查是否有游戏标题
            if '音乐打僵尸' in content:
                print("✓ 游戏标题存在")
            else:
                print("✗ 游戏标题不存在")
            
            # 检查控制台错误
            print("检查控制台错误...")
            console_errors = []
            def capture_console(msg):
                if msg.type == 'error':
                    console_errors.append(msg.text)
            page.on('console', capture_console)
            
            # 等待几秒钟，确保所有脚本都执行完毕
            time.sleep(3)
            
            if console_errors:
                print("\n控制台错误:")
                for error in console_errors:
                    print(f"- {error}")
            else:
                print("\n没有控制台错误")
                
            # 检查是否有Canvas元素
            print("\n检查Canvas元素...")
            canvas_elements = page.locator('canvas').all()
            if canvas_elements:
                print(f"✓ 找到 {len(canvas_elements)} 个Canvas元素")
            else:
                print("✗ 没有找到Canvas元素")
                
            # 检查是否有按钮元素
            print("\n检查按钮元素...")
            button_elements = page.locator('button').all()
            if button_elements:
                print(f"✓ 找到 {len(button_elements)} 个按钮元素")
                for i, button in enumerate(button_elements):
                    text = button.text_content()
                    print(f"  按钮 {i+1}: {text}")
            else:
                print("✗ 没有找到按钮元素")
                
        finally:
            # 关闭浏览器
            browser.close()
            print("\n测试完成")

if __name__ == "__main__":
    # 创建截图目录
    import os
    os.makedirs('/workspace/screenshots', exist_ok=True)
    test_game_loading()
