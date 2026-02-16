(function() {
    // ---- Lấy các element ----
    const startBtn = document.getElementById('start');
    const stopBtn = document.getElementById('stop');
    const limitSelect = document.getElementById('limit');
    const intervalSelect = document.getElementById('interval');
    const settingsDiv = document.getElementById('settings');
    const timerDiv = document.getElementById('timer');
    const progressSpan = document.getElementById('progress');
    const bingDiv = document.getElementById('bing');

    // ---- Cấu hình mặc định (100 lần, 10 giây) ----
    let searchConfig = {
        limit: 100,
        interval: 10000
    };

    // ---- Cookie helpers ----
    const cookies = {
        set: (name, value, days) => {
            try {
                const d = new Date();
                d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
                document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
            } catch (e) {}
        },
        get: (name) => {
            try {
                const cookies = document.cookie.split(';');
                for (let c of cookies) {
                    const [key, val] = c.trim().split('=');
                    if (key === name) return { name, value: val };
                }
            } catch (e) {}
            return { name, value: null };
        }
    };

    // ---- Load từ cookie ----
    const loadCookies = () => {
        const limitCookie = cookies.get('_search_limit');
        const intervalCookie = cookies.get('_search_interval');
        if (limitCookie.value) {
            searchConfig.limit = parseInt(limitCookie.value);
            limitSelect.value = limitCookie.value;
        } else {
            cookies.set('_search_limit', searchConfig.limit, 365);
        }
        if (intervalCookie.value) {
            searchConfig.interval = parseInt(intervalCookie.value);
            intervalSelect.value = intervalCookie.value;
        } else {
            cookies.set('_search_interval', searchConfig.interval, 365);
        }
    };
    loadCookies();

    // ---- Hiển thị cài đặt ----
    const updateSettingsText = () => {
        const limitText = limitSelect.options[limitSelect.selectedIndex].text;
        const intervalText = intervalSelect.options[intervalSelect.selectedIndex].text;
        settingsDiv.querySelector('.info-value').innerText = `${limitText}, ${intervalText}`;
    };
    updateSettingsText();

    // ---- Danh sách từ khóa (giữ nguyên) ----
    const termLists = [
        ["game","play","fun","movie","music","song","dance","party","holiday","travel","adventure","quest","hero","battle","win"],
        ["computer","phone","tablet","laptop","screen","keyboard","mouse","internet","wifi","app","software","hardware","code","program","data"],
        ["dog","cat","fish","bird","horse","cow","pig","chicken","duck","rabbit","turtle","frog","lion","tiger","elephant"],
        ["sun","moon","star","sky","cloud","rain","snow","wind","storm","mountain","river","ocean","sea","forest","tree"],
        ["red","blue","green","yellow","black","white","purple","orange","pink","brown","gray","gold","silver","cyan","magenta"],
        ["happy","sad","angry","excited","bored","tired","calm","nervous","brave","scared","funny","serious","proud","shy","kind"],
        ["book","pen","paper","desk","chair","table","door","window","wall","light","lamp","bed","clock","watch","bag"],
        ["food","water","milk","bread","rice","noodle","soup","fruit","apple","banana","orange","grape","chocolate","cake","coffee"],
        ["sport","ball","football","soccer","basketball","tennis","golf","swim","run","jump","throw","catch","hit","kick","goal"],
        ["car","bus","train","plane","bike","boat","ship","truck","motor","drive","ride","fly","sail","road","bridge"]
    ];

    const formParams = [
        "QBLH","QBRE","HDRSC1","LGWQS1","LGWQS2","LGWQS3","R5FD","R5FD1","R5FD2","R5FD3",
        "R5FD4","R5FD5","R5FD6","R5FD7","QSRE1","QSRE2","QSRE3","QSRE4","QSRE5","QSRE6",
        "QSRE7","QSRE8"
    ];

    // ---- Hàm chọn từ ngẫu nhiên ----
    const randomTerm = () => {
        const list = termLists[Math.floor(Math.random() * termLists.length)];
        return list[Math.floor(Math.random() * list.length)];
    };

    const randomForm = () => formParams[Math.floor(Math.random() * formParams.length)];

    // ---- Tạo danh sách tìm kiếm ----
    const generateSearches = () => {
        const searches = [];
        let randomDelay = 0;
        while (searches.length < searchConfig.limit) {
            const term = randomTerm();
            if (!searches.some(s => s.term === term)) {
                const index = searches.length + 1;
                const url = `https://www.bing.com/search?q=${encodeURIComponent(term.toLowerCase())}&FORM=${randomForm()}`;
                let delay = searchConfig.interval * searches.length;
                if (searchConfig.interval === 9999 && searches.length > 0) {
                    delay = randomDelay = ((Math.floor(Math.random() * 51) + 10) * 1000) + randomDelay;
                }
                searches.push({ term, url, index, delay });
            }
        }
        return searches;
    };

    // ---- Timer helpers ----
    let timerNext = null, timerComplete = null;

    const toClockFormat = (ms, showHours = false) => {
        if (ms < 0) ms = 0;
        const hrs = Math.floor(ms / (1000*60*60)) % 24;
        const min = Math.floor(ms / (1000*60)) % 60;
        const sec = Math.floor(ms / 1000) % 60;
        return `${showHours ? String(hrs).padStart(2,'0')+':' : ''}${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    };

    const updateEstimatedTime = (search) => {
        const now = new Date();
        timerNext = new Date(now.getTime() + searchConfig.interval);
        timerComplete = new Date(now.getTime() + searchConfig.interval * (searchConfig.limit - search.index));
        if (search.index === searchConfig.limit) timerNext = now;
    };

    const runTimer = () => {
        const now = new Date();
        const next = timerNext - now;
        const complete = timerComplete - now;
        if (searchConfig.interval === 9999) {
            timerDiv.querySelector('.info-value').innerText = `10~60 giây (ngẫu nhiên)`;
        } else if (complete >= 0) {
            const nextStr = next >= 0 ? `Tìm tiếp trong ${toClockFormat(next)}` : "Đang kết thúc";
            timerDiv.querySelector('.info-value').innerText = `${nextStr}, xong sau ${toClockFormat(complete, true)}`;
            setTimeout(runTimer, 1000);
        } else {
            timerDiv.querySelector('.info-value').innerText = `Đang dừng...`;
        }
    };

    // ---- Xử lý tìm kiếm ----
    let currentSearches = [];

    const startSearch = () => {
        // Nếu đang chạy thì không start lại
        if (stopBtn.style.display === 'inline-flex') return;

        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-flex';
        currentSearches = generateSearches();

        currentSearches.forEach(s => {
            setTimeout(() => {
                // Cập nhật progress
                const progress = `(${String(s.index).padStart(2,'0')}/${String(searchConfig.limit).padStart(2,'0')})`;
                document.title = `${progress} - Bing Auto Search`;
                progressSpan.querySelector('.progress-value').innerText = progress;

                updateEstimatedTime(s);
                if (s.index === searchConfig.limit) {
                    setTimeout(() => stopSearch(), (searchConfig.interval <= 10000 && searchConfig.interval !== 9999 ? searchConfig.interval : 10000));
                }
                if (s.delay === 0) runTimer();

                // Load iframe
                const iframe = document.createElement('iframe');
                iframe.src = s.url;
                iframe.title = s.term;
                iframe.setAttribute('data-index', s.index);
                // Xóa placeholder cũ
                while (bingDiv.firstChild) bingDiv.removeChild(bingDiv.firstChild);
                bingDiv.appendChild(iframe);
            }, s.delay);
        });
    };

    const stopSearch = () => {
        window.open('https://rewards.bing.com/pointsbreakdown');
        location.reload(); // reload để reset
    };

    // ---- Gán sự kiện ----
    startBtn.addEventListener('click', startSearch);
    stopBtn.addEventListener('click', stopSearch);

    limitSelect.addEventListener('change', (e) => {
        searchConfig.limit = parseInt(e.target.value);
        cookies.set('_search_limit', searchConfig.limit, 365);
        location.reload();
    });

    intervalSelect.addEventListener('change', (e) => {
        searchConfig.interval = parseInt(e.target.value);
        cookies.set('_search_interval', searchConfig.interval, 365);
        location.reload();
    });

    // ---- Tự động bắt đầu khi trang load ----
    window.addEventListener('load', () => {
        // Đợi một chút để mọi thứ ổn định
        setTimeout(startSearch, 500);
    });

    // ---- WakeLock ----
    if ('wakeLock' in navigator) {
        let wakeLockSentinel = null;
        const requestWakeLock = () => {
            navigator.wakeLock.request('screen').then(sentinel => {
                wakeLockSentinel = sentinel;
                sentinel.addEventListener('release', () => {
                    wakeLockSentinel = null;
                });
            }).catch(() => {});
        };
        requestWakeLock();
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && !wakeLockSentinel) requestWakeLock();
        });
    }
})();
