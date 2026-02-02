# 🌐 飞书网页应用配置指南

网页版已经完成！现在教你如何配置到飞书。

## 📁 项目文件说明

网页版位于 `web` 目录：
```
web/
├── index.html       # 主页面
├── css/
│   └── style.css    # 样式文件
└── js/
    └── app.js       # JavaScript逻辑
```

## 🚀 快速开始（两种方式）

### 方式一：本地测试（最简单）

#### 1. 启动后端服务

```bash
cd backend
python run.py
```

#### 2. 直接打开网页

用浏览器打开：
```
d:\xujinhui\Desktop\薪资进度\web\index.html
```

**就这么简单！** 可以直接使用了！💰

---

### 方式二：配置到飞书工作台

如果要在飞书中使用，需要部署到服务器。

#### 步骤1：部署到服务器

**选项A：使用免费托管（推荐新手）**

推荐使用 [Vercel](https://vercel.com/) 或 [Netlify](https://www.netlify.com/)：

1. 注册账号（可以用GitHub登录）
2. 创建新项目
3. 上传 `web` 目录中的所有文件
4. 获得一个免费的 HTTPS 网址，如：`https://your-app.vercel.app`

**选项B：自己的服务器**

如果你有服务器：

```bash
# 1. 上传 web 目录到服务器
scp -r web/ user@your-server:/var/www/salary/

# 2. 配置 Nginx（示例）
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/salary;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# 3. 配置HTTPS（飞书要求）
# 使用 Let's Encrypt 免费证书
```

#### 步骤2：配置后端跨域

修改后端允许你的网页域名访问：

编辑 `backend/app/__init__.py`，修改CORS配置：

```python
from flask_cors import CORS

# 允许你的网页域名
CORS(app, origins=["https://your-app.vercel.app"])
```

#### 步骤3：修改前端API地址

编辑 `web/js/app.js` 第2行：

```javascript
const API_BASE = 'https://your-backend-server.com/api';  // 改成你的后端地址
```

#### 步骤4：在飞书创建网页应用

1. 进入 [飞书开放平台](https://open.feishu.cn/)
2. 创建应用 → 选择"网页应用"
3. 填写信息：
   ```
   应用名称：薪资进度管理
   应用描述：实习生薪资进度追踪
   桌面端主页：https://your-app.vercel.app
   移动端主页：https://your-app.vercel.app
   ```
4. 保存并发布

#### 步骤5：使用应用

发布后：
- 在飞书工作台搜索"薪资进度管理"
- 或在飞书侧边栏找到应用图标
- 点击打开即可使用！

---

## 🎯 推荐方案：本地测试

**对于个人使用，最简单的方式：**

### 一键启动脚本

创建 `start.bat`（Windows）：

```batch
@echo off
echo 正在启动薪资进度管理系统...
echo.

cd backend
start /b python run.py

echo 后端已启动！
echo.
echo 请用浏览器打开：
echo file:///d:/xujinhui/Desktop/薪资进度/web/index.html
echo.
echo 或者直接双击 web\index.html 文件
echo.
pause
```

使用方法：
1. 双击 `start.bat`
2. 自动打开浏览器访问网页
3. 开始使用！

---

## 📱 功能特色

### 1. 首页
- 显示所有实习生列表
- 点击卡片进入个人页面
- 添加新实习生

### 2. 实时薪资页面
- **每秒刷新** - 看着钱涨涨涨！💰
- 今日收益实时显示
- 工作进度条动画
- 有趣的动态提示

### 3. 请假管理
- 快速添加请假记录
- 查看本月所有请假
- 删除错误记录

### 4. 薪资统计
- 本月收入汇总
- 全年统计数据
- 有趣的总结文案

---

## 🐛 常见问题

### Q1: 打开网页后无法加载数据？

**解决**：
1. 确认后端服务是否启动（访问 http://localhost:5000/api/health）
2. 按F12打开开发者工具，查看Console中的错误
3. 检查 `web/js/app.js` 中的 `API_BASE` 地址是否正确

### Q2: 数字不更新？

**解决**：
- 检查浏览器Console是否有报错
- 确认已选择实习生并进入实时薪资页面
- 刷新页面重试

### Q3: 想在手机上使用？

**解决**：
1. 确保电脑和手机在同一WiFi
2. 查看电脑IP地址（`ipconfig` 或 `ifconfig`）
3. 手机浏览器访问：`http://你的电脑IP:5000`
4. 但是需要修改 `web/js/app.js` 中的 `API_BASE`

### Q4: 想让同事也能用？

**解决**：需要部署到服务器，参考"方式二"

---

## 💡 使用技巧

### 技巧1：添加到浏览器收藏夹

右键书签栏 → 添加页面 → 方便快速访问

### 技巧2：创建桌面快捷方式

右键 `web\index.html` → 发送到 → 桌面快捷方式

### 技巧3：全屏使用

按 `F11` 进入全屏模式，沉浸式体验！

### 技巧4：多开浏览器标签

可以同时打开多个实习生的薪资页面，实时对比！

---

## 🎨 自定义配置

### 修改颜色主题

编辑 `web/css/style.css`，搜索并修改渐变色：

```css
/* 首页背景 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 薪资卡片背景 */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
```

### 修改更新频率

编辑 `web/js/app.js` 第196行：

```javascript
salaryTimer = setInterval(updateSalary, 1000);  // 1000 = 1秒，可以改成其他值
```

---

## ✅ 验证功能

测试清单：

- [ ] 后端服务正常启动
- [ ] 能打开网页并看到界面
- [ ] 能添加实习生
- [ ] 能查看实时薪资（数字每秒变化）
- [ ] 能添加请假记录
- [ ] 能查看薪资统计

全部勾选 = 完美运行！🎉

---

## 📞 需要帮助？

如果遇到问题：
1. 查看浏览器开发者工具（F12）的Console
2. 查看后端服务器的日志输出
3. 确认文件路径和配置是否正确

---

**现在就试试吧！直接双击 `web/index.html` 开始使用！** 💰✨
