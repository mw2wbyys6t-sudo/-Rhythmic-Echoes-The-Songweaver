from playwright.sync_api import sync_playwright
import time

# 测试游戏功能
def test_game():
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            # 导航到游戏URL
            print("导航到游戏URL...")
            page.goto('https://mw2wbyys6t-sudo.github.io/music-rpg-zombie-game/')
            page.wait_for_load_state('networkidle')
            
            # 截图主菜单
            page.screenshot(path='/workspace/screenshots/main_menu.png', full_page=True)
            print("主菜单截图已保存")
            
            # 检查控制台错误
            print("检查控制台错误...")
            console_errors = []
            def capture_console(msg):
                if msg.type == 'error':
                    console_errors.append(msg.text)
            page.on('console', capture_console)
            
            # 测试导入歌单功能
            print("测试导入歌单功能...")
            import_button = page.get_by_role('button', name='🎵 导入歌单')
            import_button.click()
            page.wait_for_load_state('networkidle')
            
            # 截图导入歌单界面
            page.screenshot(path='/workspace/screenshots/import_playlist.png', full_page=True)
            print("导入歌单界面截图已保存")
            
            # 返回主菜单
            back_button = page.get_by_role('button', name='返回')
            back_button.click()
            page.wait_for_load_state('networkidle')
            
            # 测试游戏流程
            print("测试游戏流程...")
            start_button = page.get_by_role('button', name='🎮 开始游戏')
            start_button.click()
            page.wait_for_load_state('networkidle')
            
            # 截图角色创建界面
            page.screenshot(path='/workspace/screenshots/character_creation.png', full_page=True)
            print("角色创建界面截图已保存")
            
            # 选择角色选项
            print("选择角色选项...")
            # 选择女性
            female_button = page.get_by_role('button', name='👩 女')
            female_button.click()
            # 选择发型
            hair_button = page.get_by_role('button', name='💇‍♀️ 飘逸长发')
            hair_button.click()
            # 选择服装
            clothes_button = page.get_by_role('button', name='🚀 未来科幻装')
            clothes_button.click()
            # 选择肤色
            skin_button = page.get_by_role('button', name='🧒 健康肤色')
            skin_button.click()
            # 选择声线
            voice_button = page.get_by_role('button', name='🎀 萝莉音')
            voice_button.click()
            # 选择语言
            lang_button = page.get_by_role('button', name='🇨🇳 中文')
            lang_button.click()
            
            # 保存并继续
            save_button = page.get_by_role('button', name='保存并继续')
            save_button.click()
            page.wait_for_load_state('networkidle')
            
            # 截图地图选择界面
            page.screenshot(path='/workspace/screenshots/map_selection.png', full_page=True)
            print("地图选择界面截图已保存")
            
            # 选择地图
            map_button = page.get_by_role('heading', name='城市废墟')
            map_button.click()
            
            # 开始战斗
            start_battle_button = page.get_by_role('button', name='开始战斗！')
            start_battle_button.click()
            page.wait_for_load_state('networkidle')
            
            # 等待游戏加载
            time.sleep(3)
            
            # 截图游戏界面
            page.screenshot(path='/workspace/screenshots/game_interface.png', full_page=True)
            print("游戏界面截图已保存")
            
            # 检查控制台错误
            if console_errors:
                print("\n控制台错误:")
                for error in console_errors:
                    print(f"- {error}")
            else:
                print("\n没有控制台错误")
                
        finally:
            # 关闭浏览器
            browser.close()
            print("\n测试完成，所有截图已保存到 /workspace/screenshots/ 目录")

if __name__ == "__main__":
    # 创建截图目录
    import os
    os.makedirs('/workspace/screenshots', exist_ok=True)
    test_game()
