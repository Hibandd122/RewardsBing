import { toClockFormat, formatIndex } from './utils.js';

// Các phần tử DOM
export const elements = {
    startBtn: document.getElementById('start'),
    stopBtn: document.getElementById('stop'),
    limitSelect: document.getElementById('limit'),
    intervalSelect: document.getElementById('interval'),
    settingsDiv: document.getElementById('settings'),
    timerDiv: document.getElementById('timer'),
    progressBox: document.getElementById('progress'),
    bingDiv: document.getElementById('bing')
};

// Thêm progress bar và current/next term
export const progressBar = document.createElement('div');
progressBar.className = 'progress-bar';
elements.progressBox.appendChild(progressBar);

export const currentTermSpan = document.createElement('span');
currentTermSpan.className = 'current-term';
elements.timerDiv.querySelector('.info-content').appendChild(currentTermSpan);

export const nextTermSpan = document.createElement('div');
nextTermSpan.className = 'next-term';
nextTermSpan.innerHTML = 'Tiếp theo: <span>—</span>';
elements.progressBox.querySelector('.info-content').appendChild(nextTermSpan);

// Hàm cập nhật
export function updateSettingsText(limitText, intervalText) {
    elements.settingsDiv.querySelector('.info-value').innerText = `${limitText}, ${intervalText}`;
}

export function updateTimerDisplay(nextSearchTime, completeTime) {
    if (!nextSearchTime || !completeTime) return;
    const now = new Date();
    const nextMs = nextSearchTime - now;
    const completeMs = completeTime - now;
    let timerText = '';
    if (nextMs > 0) {
        timerText = `⏳ Tìm tiếp trong ${toClockFormat(nextMs)}`;
    } else {
        timerText = `⚡ Đang tìm...`;
    }
    timerText += `, xong sau ${toClockFormat(completeMs, true)}`;
    elements.timerDiv.querySelector('.info-value').innerText = timerText;
}

export function updateProgress(current, total, term = '', nextTerm = '') {
    const percent = (current / total) * 100;
    progressBar.style.width = `${percent}%`;
    progressBar.setAttribute('aria-valuenow', percent);
    const text = `(${formatIndex(current, total)}/${total})`;
    elements.progressBox.querySelector('.progress-value').innerText = text;
    document.title = `${text} - Bing Auto Search`;
    if (term) currentTermSpan.innerText = `🔍 ${term}`;
    if (nextTerm) nextTermSpan.querySelector('span').innerText = nextTerm;
}

export function setLoading(isLoading) {
    if (isLoading) {
        elements.bingDiv.classList.add('loading');
    } else {
        elements.bingDiv.classList.remove('loading');
    }
}