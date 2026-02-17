import { elements, progressBar, currentTermSpan, nextTermSpan, updateProgress, updateTimerDisplay, setLoading } from './ui.js';
import { randomTerm, randomForm } from './utils.js';
import { cookies } from './cookies.js';

let timeouts = [];
let autoStopTimeout = null;
let countdownInterval = null;
let nextSearchTime = null;
let completeTime = null;
let currentSearches = [];
let currentIndex = 0;
let searchConfig = { limit: 100, interval: 10000 };

export function setSearchConfig(config) {
    searchConfig = config;
}

export function generateSearches() {
    const searches = [];
    let cumulativeDelay = 0;
    const usedTerms = new Set();
    while (searches.length < searchConfig.limit) {
        const term = randomTerm(usedTerms);
        usedTerms.add(term);
        const index = searches.length + 1;
        const url = `https://www.bing.com/search?q=${encodeURIComponent(term.toLowerCase())}&FORM=${randomForm()}`;

        let currentDelay;
        if (searchConfig.interval === 9999) {
            currentDelay = (Math.floor(Math.random() * 51) + 10) * 1000; // 10-60 giây
        } else {
            currentDelay = searchConfig.interval;
        }
        cumulativeDelay += currentDelay;

        searches.push({
            term, url, index,
            delay: cumulativeDelay,
            currentDelay
        });
    }
    return searches;
}

function clearAllTimeouts() {
    timeouts.forEach(id => clearTimeout(id));
    timeouts = [];
    if (autoStopTimeout) {
        clearTimeout(autoStopTimeout);
        autoStopTimeout = null;
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        updateTimerDisplay(nextSearchTime, completeTime);
    }, 200);
}

export function startSearch() {
    if (elements.stopBtn.style.display === 'inline-flex') return;

    elements.startBtn.style.display = 'none';
    elements.stopBtn.style.display = 'inline-flex';
    progressBar.style.width = '0%';
    currentTermSpan.innerText = '';
    nextTermSpan.querySelector('span').innerText = '—'; // ← sửa lỗi ở đây

    currentSearches = generateSearches();
    currentIndex = 0;

    const now = new Date();
    completeTime = new Date(now.getTime() + currentSearches[currentSearches.length-1].delay);

    currentSearches.forEach((s, idx) => {
        const timeoutId = setTimeout(() => {
            currentIndex = s.index;
            const nextSearch = currentSearches[idx + 1];
            const nextTerm = nextSearch ? nextSearch.term : '';
            updateProgress(currentIndex, searchConfig.limit, s.term, nextTerm);

            if (nextSearch) {
                nextSearchTime = new Date(now.getTime() + nextSearch.delay);
            } else {
                nextSearchTime = null;
            }

            // Hiển thị iframe
            setLoading(true);
            const iframe = document.createElement('iframe');
            iframe.src = s.url;
            iframe.title = s.term;
            iframe.onload = () => setLoading(false);
            iframe.onerror = () => {
                console.error('Iframe error:', s.url);
                setLoading(false);
            };
            while (elements.bingDiv.firstChild) elements.bingDiv.removeChild(elements.bingDiv.firstChild);
            elements.bingDiv.appendChild(iframe);

            // Tự động dừng sau lần cuối
            if (s.index === searchConfig.limit) {
                autoStopTimeout = setTimeout(() => {
                    if (elements.stopBtn.style.display === 'inline-flex') {
                        stopSearch(false);
                    }
                }, 3000);
                timeouts.push(autoStopTimeout);
            }
        }, s.delay);

        timeouts.push(timeoutId);
    });

    nextSearchTime = new Date(now.getTime() + currentSearches[0].currentDelay);
    startCountdown();
}

export function stopSearch(openPoints = true) {
    clearAllTimeouts();

    while (elements.bingDiv.firstChild) elements.bingDiv.removeChild(elements.bingDiv.firstChild);
    const placeholder = document.createElement('div');
    placeholder.className = 'iframe-placeholder';
    placeholder.innerHTML = '<i class="fas fa-search"></i><span>Kết quả tìm kiếm sẽ hiển thị ở đây</span>';
    elements.bingDiv.appendChild(placeholder);

    elements.startBtn.style.display = 'inline-flex';
    elements.stopBtn.style.display = 'none';
    progressBar.style.width = '0%';
    elements.progressBox.querySelector('.progress-value').innerText = '(00/00)';
    elements.timerDiv.querySelector('.info-value').innerText = 'Đã dừng';
    currentTermSpan.innerText = '';
    nextTermSpan.querySelector('span').innerText = '—';
    document.title = 'Bing Auto Search';

    if (openPoints) {
        window.open('https://rewards.bing.com/pointsbreakdown', '_blank');
    }
}