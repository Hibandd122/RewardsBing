import { elements, updateSettingsText } from './ui.js';
import { cookies } from './cookies.js';
import { setSearchConfig, startSearch, stopSearch } from './search.js';
import { initWakeLock } from './wakelock.js';

// Cấu hình mặc định
let searchConfig = {
    limit: 100,
    interval: 10000
};

// Load từ cookie
const loadCookies = () => {
    const limitCookie = cookies.get('_search_limit');
    const intervalCookie = cookies.get('_search_interval');
    if (limitCookie && !isNaN(parseInt(limitCookie))) {
        searchConfig.limit = parseInt(limitCookie);
        elements.limitSelect.value = limitCookie;
    } else {
        cookies.set('_search_limit', searchConfig.limit, 365);
    }
    if (intervalCookie && !isNaN(parseInt(intervalCookie))) {
        searchConfig.interval = parseInt(intervalCookie);
        elements.intervalSelect.value = intervalCookie;
    } else {
        cookies.set('_search_interval', searchConfig.interval, 365);
    }
    setSearchConfig(searchConfig);
};

loadCookies();

// Cập nhật text cài đặt
const limitText = elements.limitSelect.options[elements.limitSelect.selectedIndex].text;
const intervalText = elements.intervalSelect.options[elements.intervalSelect.selectedIndex].text;
updateSettingsText(limitText, intervalText);

// Gán sự kiện
elements.startBtn.addEventListener('click', startSearch);
elements.stopBtn.addEventListener('click', () => stopSearch(true));

elements.limitSelect.addEventListener('change', (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
        searchConfig.limit = val;
        cookies.set('_search_limit', val, 365);
        location.reload();
    }
});

elements.intervalSelect.addEventListener('change', (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
        searchConfig.interval = val;
        cookies.set('_search_interval', val, 365);
        location.reload();
    }
});

// WakeLock
initWakeLock();

// Tự động chạy khi load trang
setTimeout(startSearch, 600);