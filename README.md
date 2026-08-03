# 🚗 智能车载语音助手

> 一键启动的车载 AI 语音助手，支持语音/文字控制空调、车窗、导航、音乐、灯光等。

## ⚡ 快速开始

### 前提条件

- **Python 3.x**（任何版本都行）
- **Edge 浏览器**（推荐，语音识别基于 Edge 的 Azure 语音服务）
- Windows / Mac / Linux 都支持

### 启动

```bash
# 克隆仓库
git clone https://github.com/Chitoge-Zin/car-voice-assistant.git
cd car-voice-assistant

# Windows: 双击 start.bat
# Mac/Linux: 运行
python tts_proxy.py
```

浏览器会自动打开 `http://localhost:8766`

### 使用

- 说 **"小本"** 唤醒语音助手
- 或直接输入文字指令
- 常用指令：
  - `打开空调` / `空调26度`
  - `播放音乐` / `下一首`
  - `导航到公司`
  - `打开车窗` / `关闭天窗`
  - `氛围灯红色`
  - `运动模式` / `舒适模式`

## 🎵 音乐文件

音乐文件未包含在仓库中（太大）。如需音乐功能：

1. 下载音乐包（链接见 Releases 页面）
2. 解压到 `music/` 目录
3. 重启服务器

## 🛠️ 技术栈

- 纯前端 HTML/CSS/JS（单文件应用）
- Web Speech API（语音识别 + 语音合成）
- Web Bluetooth API（蓝牙设备连接）
- Screen Capture API（录屏）
- 高德地图 SDK
- Three.js 3D 车模
- GLM-4 AI 智能对话

## 📁 项目结构

```
car-voice-assistant/
├── index.html          # 主页面（所有功能都在这里）
├── tts_proxy.py        # 本地静态服务器（支持音频 Range 请求）
├── start.bat           # Windows 一键启动
├── music-list.json     # 歌单索引
└── music/              # MP3 文件（需自行下载）
```

## 🌐 在线演示

GitHub Pages: https://chitoge-zin.github.io/car-voice-assistant/

（在线版不含音乐播放 + 部分功能需 HTTPS/localhost）
