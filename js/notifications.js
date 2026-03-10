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
            new Notification(title, { body, icon: 'icons/icon.svg' });
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
