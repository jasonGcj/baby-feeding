import { Storage } from './storage.js';
import { Notifications } from './notifications.js';
import { Stats } from './stats.js';

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
            setTimeout(() => Stats.renderChart(), 100);
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
        const datetime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        
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
