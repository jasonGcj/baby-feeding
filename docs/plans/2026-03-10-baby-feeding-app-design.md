# 宝宝吃奶记录 App 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 开发一个 PWA 网页应用，记录宝宝吃奶情况，支持本地存储、数据统计、喂奶提醒、导出导入

**Architecture:** 单页面应用，使用原生 HTML/CSS/JS，localStorage 存储，PWA 可安装到手机主屏幕

**Tech Stack:** HTML5, CSS3, JavaScript (ES6+), Chart.js (图表), PWA (manifest + service worker)

---

### Task 1: 创建项目基础结构

**Files:**
- Create: `index.html`
- Create: `css/styles.css`
- Create: `js/app.js`
- Create: `js/storage.js`
- Create: `js/stats.js`
- Create: `js/notifications.js`
- Create: `manifest.json`
- Create: `sw.js` (service worker)
- Create: `icons/icon-192.png`
- Create: `icons/icon-512.png`

**Step 1: 创建 index.html 主页面结构**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#4A90D9">
    <title>宝宝吃奶记录</title>
    <link rel="manifest" href="manifest.json">
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js">
</head>
<body>
    <div id="app">
        <nav class="tab-bar">
            <button class="tab active" data-tab="home">首页</button>
            <button class="tab" data-tab="stats">统计</button>
            <button class="tab" data-tab="settings">设置</button>
        </nav>
        
        <main id="content">
            <!-- 页面内容通过 JS 动态渲染 -->
        </main>
        
        <button id="add-btn" class="fab">+</button>
    </div>
    
    <div id="modal" class="modal hidden">
        <div class="modal-content">
            <!-- 表单内容通过 JS 动态渲染 -->
        </div>
    </div>
    
    <script src="js/storage.js"></script>
    <script src="js/notifications.js"></script>
    <script src="js/stats.js"></script>
    <script src="js/app.js"></script>
    <script>
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js');
        }
    </script>
</body>
</html>
```

**Step 2: 创建 manifest.json**

```json
{
    "name": "宝宝吃奶记录",
    "short_name": "吃奶记录",
    "description": "记录宝宝吃奶情况",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#4A90D9",
    "icons": [
        {
            "src": "icons/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "icons/icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
```

**Step 3: 创建 css/styles.css**

```css
:root {
    --primary: #4A90D9;
    --primary-light: #E8F4FD;
    --text: #333;
    --text-light: #666;
    --bg: #f5f5f5;
    --white: #white;
    --danger: #e74c3c;
    --success: #2ecc71;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg);
    color: var(--text);
    padding-bottom: 70px;
}

.tab-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    background: var(--white);
    border-top: 1px solid #eee;
    z-index: 100;
}

.tab {
    flex: 1;
    padding: 15px;
    border: none;
    background: none;
    font-size: 14px;
    color: var(--text-light);
    cursor: pointer;
}

.tab.active { color: var(--primary); font-weight: 600; }

.fab {
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 28px;
    background: var(--primary);
    color: white;
    font-size: 32px;
    border: none;
    box-shadow: 0 4px 12px rgba(74, 144, 217, 0.4);
    cursor: pointer;
}

.card {
    background: var(--white);
    margin: 10px;
    padding: 15px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-size: 14px; color: var(--text-light); }
.form-group input, .form-group select, .form-group textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #eee;
    border-radius: 8px;
    font-size: 16px;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
}
.btn-primary { background: var(--primary); color: white; }
.btn-danger { background: var(--danger); color: white; }

.modal {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
}
.modal.hidden { display: none; }
.modal-content {
    background: var(--white);
    width: 90%;
    max-width: 400px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 20px;
    border-radius: 12px;
}
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: 创建 PWA 项目基础结构"
```

---

### Task 2: 实现本地存储模块

**Files:**
- Modify: `js/storage.js`

**Step 1: 实现 storage.js**

```javascript
const STORAGE_KEY = 'baby_feeding_records';

export const Storage = {
    getAll() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },
    
    add(record) {
        const records = this.getAll();
        record.id = crypto.randomUUID();
        record.createdAt = new Date().toISOString();
        records.push(record);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        return record;
    },
    
    delete(id) {
        const records = this.getAll().filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    },
    
    getByDate(date) {
        const records = this.getAll();
        const targetDate = date.toISOString().split('T')[0];
        return records.filter(r => r.datetime.split('T')[0] === targetDate);
    },
    
    export() {
        const data = this.getAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `baby-feeding-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },
    
    import(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (Array.isArray(data)) {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                        resolve(data.length);
                    } else {
                        reject(new Error('Invalid format'));
                    }
                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsText(file);
        });
    }
};
```

**Step 2: Commit**

```bash
git add js/storage.js
git commit -m "feat: 实现本地存储模块"
```

---

### Task 3: 实现应用主逻辑

**Files:**
- Modify: `js/app.js`

**Step 1: 实现 app.js 主逻辑**

```javascript
import { Storage } from './storage.js';
import { Notifications } from './notifications.js';

const App = {
    currentTab: 'home',
    
    init() {
        this.render();
        this.bindEvents();
    },
    
    render() {
        const content = document.getElementById('content');
        if (this.currentTab === 'home') {
            content.innerHTML = this.renderHome();
        } else if (this.currentTab === 'stats') {
            content.innerHTML = this.renderStats();
        } else if (this.currentTab === 'settings') {
            content.innerHTML = this.renderSettings();
        }
        this.bindListEvents();
    },
    
    renderHome() {
        const today = new Date();
        const records = Storage.getByDate(today);
        const total = records.reduce((sum, r) => sum + (r.amount || 0), 0);
        
        let html = `
            <div class="card">
                <h2>今日总结</h2>
                <p>总奶量: <strong>${total}ml</strong></p>
                <p>次数: <strong>${records.length}</strong> 次</p>
            </div>
            <h3 style="margin: 15px 10px 10px;">今日记录</h3>
        `;
        
        if (records.length === 0) {
            html += '<p style="text-align:center;color:#999;padding:20px;">暂无记录</p>';
        } else {
            records.sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
                .forEach(r => {
                    const time = new Date(r.datetime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
                    const sourceLabel = { 'breast': '母乳亲喂', 'bottle': '母乳瓶喂', 'formula': '配方奶' }[r.source] || r.source;
                    html += `
                        <div class="card record-item" data-id="${r.id}">
                            <div style="display:flex;justify-content:space-between;">
                                <strong>${time}</strong>
                                <span>${r.amount}ml</span>
                            </div>
                            <div style="color:#666;font-size:14px;">
                                ${sourceLabel} · ${r.duration || '-'}分钟
                            </div>
                            ${r.note ? `<div style="color:#999;font-size:14px;margin-top:5px;">${r.note}</div>` : ''}
                            <button class="btn-delete" data-id="${r.id}">删除</button>
                        </div>
                    `;
                });
        }
        return html;
    },
    
    renderStats() {
        return `
            <div class="card">
                <h3>近7天奶量趋势</h3>
                <canvas id="chart"></canvas>
            </div>
        `;
    },
    
    renderSettings() {
        const settings = Notifications.getSettings();
        return `
            <div class="card">
                <h3>喂奶提醒</h3>
                <div class="form-group">
                    <label><input type="checkbox" id="reminder-enabled" ${settings.enabled ? 'checked' : ''}> 启用提醒</label>
                </div>
                <div class="form-group">
                    <label>提醒间隔（小时）</label>
                    <input type="number" id="reminder-interval" value="${settings.interval || 3}" min="1" max="12">
                </div>
            </div>
            <div class="card">
                <h3>数据管理</h3>
                <button class="btn btn-primary" id="export-btn">导出数据</button>
                <button class="btn btn-primary" id="import-btn">导入数据</button>
                <input type="file" id="import-file" accept=".json" style="display:none">
            </div>
        `;
    },
    
    bindEvents() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTab = e.target.dataset.tab;
                this.render();
            });
        });
        
        document.getElementById('add-btn').addEventListener('click', () => this.showAddModal());
        
        document.getElementById('export-btn')?.addEventListener('click', () => Storage.export());
        
        document.getElementById('import-btn')?.addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        
        document.getElementById('import-file')?.addEventListener('change', async (e) => {
            if (e.target.files[0]) {
                try {
                    const count = await Storage.import(e.target.files[0]);
                    alert(`导入成功，共${count}条记录`);
                    this.render();
                } catch (err) {
                    alert('导入失败: ' + err.message);
                }
            }
        });
        
        document.getElementById('reminder-enabled')?.addEventListener('change', (e) => {
            Notifications.setSettings({ enabled: e.target.checked });
        });
        
        document.getElementById('reminder-interval')?.addEventListener('change', (e) => {
            Notifications.setSettings({ interval: parseInt(e.target.value) });
        });
    },
    
    bindListEvents() {
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('确定删除这条记录？')) {
                    Storage.delete(btn.dataset.id);
                    this.render();
                }
            });
        });
    },
    
    showAddModal() {
        const modal = document.getElementById('modal');
        const now = new Date();
        const datetime = now.toISOString().slice(0, 16);
        
        modal.querySelector('.modal-content').innerHTML = `
            <h3>记录吃奶</h3>
            <form id="add-form">
                <div class="form-group">
                    <label>时间</label>
                    <input type="datetime-local" name="datetime" value="${datetime}" required>
                </div>
                <div class="form-group">
                    <label>奶量 (ml)</label>
                    <input type="number" name="amount" placeholder="0" required>
                </div>
                <div class="form-group">
                    <label>奶源</label>
                    <select name="source">
                        <option value="breast">母乳亲喂</option>
                        <option value="bottle">母乳瓶喂</option>
                        <option value="formula">配方奶</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>时长（分钟）</label>
                    <input type="number" name="duration" placeholder="0">
                </div>
                <div class="form-group">
                    <label>备注</label>
                    <textarea name="note" placeholder="可选"></textarea>
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%">保存</button>
                <button type="button" class="btn" onclick="document.getElementById('modal').classList.add('hidden')" style="width:100%;margin-top:10px">取消</button>
            </form>
        `;
        
        modal.classList.remove('hidden');
        
        document.getElementById('add-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const record = {
                datetime: new Date(formData.get('datetime')).toISOString(),
                amount: parseInt(formData.get('amount')) || 0,
                source: formData.get('source'),
                duration: parseInt(formData.get('duration')) || 0,
                note: formData.get('note')
            };
            Storage.add(record);
            modal.classList.add('hidden');
            this.render();
        });
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
```

**Step 2: Commit**

```bash
git add js/app.js
git commit -m "feat: 实现应用主逻辑"
```

---

### Task 4: 实现通知提醒模块

**Files:**
- Modify: `js/notifications.js`

**Step 1: 实现 notifications.js**

```javascript
const NOTIFICATION_KEY = 'baby_feeding_notification_settings';

export const Notifications = {
    getSettings() {
        const data = localStorage.getItem(NOTIFICATION_KEY);
        return data ? JSON.parse(data) : { enabled: false, interval: 3 };
    },
    
    setSettings(settings) {
        const current = this.getSettings();
        const updated = { ...current, ...settings };
        localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updated));
        
        if (updated.enabled) {
            this.requestPermission();
        }
    },
    
    async requestPermission() {
        if (!('Notification' in window)) {
            alert('当前浏览器不支持通知');
            return false;
        }
        
        if (Notification.permission === 'granted') {
            return true;
        }
        
        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        
        return false;
    },
    
    send(title, body) {
        if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: 'icons/icon-192.png' });
        }
    },
    
    scheduleReminder() {
        const settings = this.getSettings();
        if (!settings.enabled) return;
        
        const lastRecord = this.getLastRecord();
        if (!lastRecord) return;
        
        const lastTime = new Date(lastRecord.datetime);
        const nextTime = new Date(lastTime.getTime() + settings.interval * 60 * 60 * 1000);
        const now = new Date();
        
        if (nextTime > now) {
            const delay = nextTime - now;
            setTimeout(() => {
                this.send('喂奶提醒', '宝宝该吃奶了！');
                this.scheduleReminder();
            }, delay);
        }
    },
    
    getLastRecord() {
        const records = JSON.parse(localStorage.getItem('baby_feeding_records') || '[]');
        if (records.length === 0) return null;
        return records.sort((a, b) => new Date(b.datetime) - new Date(a.datetime))[0];
    }
};
```

**Step 2: Commit**

```bash
git add js/notifications.js
git commit -m "feat: 实现通知提醒模块"
```

---

### Task 5: 实现统计图表

**Files:**
- Modify: `js/stats.js`

**Step 1: 实现 stats.js**

```javascript
import { Storage } from './storage.js';
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';

export const Stats = {
    renderChart() {
        const ctx = document.getElementById('chart');
        if (!ctx) return;
        
        const labels = [];
        const data = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
            
            const records = Storage.getByDate(date);
            const total = records.reduce((sum, r) => sum + (r.amount || 0), 0);
            data.push(total);
        }
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: '奶量 (ml)',
                    data,
                    backgroundColor: '#4A90D9'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
};
```

**Step 2: 修改 app.js 在统计页面渲染图表**

在 renderStats 方法中添加:
```javascript
setTimeout(() => Stats.renderChart(), 100);
```

**Step 3: Commit**

```bash
git add js/stats.js js/app.js
git commit -m "feat: 实现统计图表"
```

---

### Task 6: 创建应用图标

**Files:**
- Create: `icons/icon-192.png`
- Create: `icons/icon-512.png`

**Step 1: 创建简单的 SVG 图标并导出为 PNG**

创建一个简单的奶瓶图标 SVG:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect x="180" y="100" width="152" height="280" rx="20" fill="#4A90D9"/>
  <rect x="200" y="60" width="112" height="60" rx="10" fill="#4A90D9"/>
  <rect x="220" y="20" width="72" height="50" rx="5" fill="#E8F4FD"/>
  <rect x="190" y="200" width="132" height="80" rx="5" fill="#E8F4FD"/>
</svg>
```

使用在线工具或 Python 转换为 PNG

**Step 2: Commit**

```bash
git add icons/
git commit -m "feat: 添加应用图标"
```

---

### Task 7: 部署到 GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: 创建部署配置**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

**Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: 添加 GitHub Pages 部署配置"
```

---

## 执行选项

**Plan complete and saved to `docs/plans/2026-03-10-baby-feeding-app-design.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
