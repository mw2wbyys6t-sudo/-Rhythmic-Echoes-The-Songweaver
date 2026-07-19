# 音乐文件目录

## 如何添加音乐

### 步骤1：从QQ音乐获取音乐

1. 在QQ音乐中下载您喜欢的歌曲
2. 确保格式为MP3（如果不是，可以使用格式转换工具）
3. 重命名文件为简短的名字，如 `theme.mp3`

### 步骤2：添加到项目

将音乐文件复制到本目录 (`/public/music/`)

### 步骤3：更新播放列表

修改 `src/utils/soundManager.ts` 中的默认播放列表，添加您的音乐：

```typescript
private defaultPlaylist: Song[] = [
  {
    id: 'theme-1',
    title: '您的歌曲名',
    artist: '艺术家名',
    url: '/music/您的文件名.mp3',
    cover: 'https://via.placeholder.com/150',
    genre: 'genre',
    tempo: 120,
    energy: 0.8
  }
];
```

## 注意事项

⚠️ **版权声明**：请确保您使用的音乐文件有合法的使用权

📂 **文件格式**：推荐使用MP3格式，兼容性最好

📏 **文件大小**：建议单个文件不超过10MB，以保证加载速度

## 示例文件

如果您暂时没有音乐文件，可以从以下免费资源获取：

- https://freemusicarchive.org/
- https://www.bensound.com/
- https://freepd.com/
