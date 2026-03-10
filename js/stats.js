import { Storage } from './storage.js';

export const Stats = {
    renderChart() {
        const ctx = document.getElementById('chart');
        if (!ctx) return;
        
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded');
            return;
        }
        
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
