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
        const targetDate = date.toLocaleDateString('zh-CN');
        return records.filter(r => new Date(r.datetime).toLocaleDateString('zh-CN') === targetDate);
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
