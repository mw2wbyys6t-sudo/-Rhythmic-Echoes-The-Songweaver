from playwright.sync_api import sync_playwright
import time
import os

# 测试游戏功能并自动截图
def test_game_improved():
    # 创建截图目录
    os.makedirs('/workspace/screenshots', exist_ok=True)
    
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=True)  # 无头模式，适合服务器环境
        page = browser.new_page()
        
        try:
            # 导航到游戏URL
            print("导航到游戏URL...")
            page.goto('http://localhost:5174/music-rpg-zombie-game/')  # 本地开发服务器
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
            
            # 自动游戏测试 - 模拟按键
            print("开始自动游戏测试...")
            
            # 模拟移动和射击
            for i in range(10):
                # 移动
                page.keyboard.down('w')
                time.sleep(0.5)
                page.keyboard.up('w')
                
                # 射击
                page.keyboard.down(' ')
                time.sleep(1)
                page.keyboard.up(' ')
                
                # 截图游戏过程
                page.screenshot(path=f'/workspace/screenshots/game_progress_{i}.png', full_page=True)
                print(f"游戏过程截图 {i} 已保存")
                
                # 等待
                time.sleep(1)
            
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
    test_game_improved()