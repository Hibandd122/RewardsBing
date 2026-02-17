(function() {
    // ---- Lấy các element ----
    const startBtn = document.getElementById('start');
    const stopBtn = document.getElementById('stop');
    const limitSelect = document.getElementById('limit');
    const intervalSelect = document.getElementById('interval');
    const settingsDiv = document.getElementById('settings');
    const timerDiv = document.getElementById('timer');
    const progressBox = document.getElementById('progress');
    const bingDiv = document.getElementById('bing');

    // ---- Thêm thanh tiến trình và vùng hiển thị từ khoá ----
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBox.appendChild(progressBar);

    // Thêm dòng hiển thị từ khoá hiện tại (sẽ cập nhật sau)
    const currentTermSpan = document.createElement('span');
    currentTermSpan.className = 'current-term';
    currentTermSpan.style.marginLeft = '8px';
    currentTermSpan.style.fontWeight = '600';
    currentTermSpan.style.color = 'var(--accent)';
    timerDiv.querySelector('.info-content').appendChild(currentTermSpan);

    // ---- Cấu hình mặc định ----
    let searchConfig = {
        limit: 100,
        interval: 10000
    };

    // ---- Cookie helpers nâng cấp ----
    const cookies = {
        set: (name, value, days) => {
            try {
                const d = new Date();
                d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
                document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`;
            } catch (e) { console.warn('Cookie set failed:', e); }
        },
        get: (name, defaultValue = null) => {
            try {
                const cookies = document.cookie.split(';');
                for (let c of cookies) {
                    const [key, val] = c.trim().split('=');
                    if (key === name) return val;
                }
            } catch (e) { console.warn('Cookie get failed:', e); }
            return defaultValue;
        }
    };

    // ---- Load từ cookie với kiểm tra ----
    const loadCookies = () => {
        const limitCookie = cookies.get('_search_limit');
        const intervalCookie = cookies.get('_search_interval');
        if (limitCookie && !isNaN(parseInt(limitCookie))) {
            searchConfig.limit = parseInt(limitCookie);
            limitSelect.value = limitCookie;
        } else {
            cookies.set('_search_limit', searchConfig.limit, 365);
        }
        if (intervalCookie && !isNaN(parseInt(intervalCookie))) {
            searchConfig.interval = parseInt(intervalCookie);
            intervalSelect.value = intervalCookie;
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

    // ---- DANH SÁCH TỪ KHÓA MỞ RỘNG (bổ sung thêm) ----
    const termLists = [
        // Cơ bản
        ["game", "play", "fun", "movie", "music", "song", "dance", "party", "holiday", "travel", "adventure", "quest", "hero", "battle", "win"],
        ["computer", "phone", "tablet", "laptop", "screen", "keyboard", "mouse", "internet", "wifi", "app", "software", "hardware", "code", "program", "data"],
        ["dog", "cat", "fish", "bird", "horse", "cow", "pig", "chicken", "duck", "rabbit", "turtle", "frog", "lion", "tiger", "elephant"],
        ["sun", "moon", "star", "sky", "cloud", "rain", "snow", "wind", "storm", "mountain", "river", "ocean", "sea", "forest", "tree"],
        ["red", "blue", "green", "yellow", "black", "white", "purple", "orange", "pink", "brown", "gray", "gold", "silver", "cyan", "magenta"],
        ["happy", "sad", "angry", "excited", "bored", "tired", "calm", "nervous", "brave", "scared", "funny", "serious", "proud", "shy", "kind"],
        ["book", "pen", "paper", "desk", "chair", "table", "door", "window", "wall", "light", "lamp", "bed", "clock", "watch", "bag"],
        ["food", "water", "milk", "bread", "rice", "noodle", "soup", "fruit", "apple", "banana", "orange", "grape", "chocolate", "cake", "coffee"],
        ["sport", "ball", "football", "soccer", "basketball", "tennis", "golf", "swim", "run", "jump", "throw", "catch", "hit", "kick", "goal"],
        ["car", "bus", "train", "plane", "bike", "boat", "ship", "truck", "motor", "drive", "ride", "fly", "sail", "road", "bridge"],
        ["AI", "machine learning", "neural network", "deep learning", "algorithm", "data science"],
        ["covid", "vaccine", "health", "pandemic", "virus", "immunity", "hospital"],
        ["crypto", "bitcoin", "ethereum", "blockchain", "NFT", "mining", "wallet"],
        ["spacex", "nasa", "rocket", "satellite", "ISS", "mars", "moon"],
        ["iphone", "samsung", "xiaomi", "smartphone", "android", "ios", "app"],
        ["science", "physics", "chemistry", "biology", "experiment", "lab", "microscope", "atom", "cell", "gravity", "energy", "force", "motion", "quantum", "theory"],
        ["history", "war", "king", "queen", "empire", "revolution", "ancient", "medieval", "civilization", "archaeology", "pyramid", "castle", "temple", "artifact", "museum"],
        ["art", "painting", "drawing", "sculpture", "gallery", "artist", "canvas", "brush", "color", "sketch", "portrait", "landscape", "abstract", "modern", "classic"],
        ["music", "guitar", "piano", "drums", "violin", "flute", "orchestra", "band", "concert", "melody", "rhythm", "jazz", "rock", "pop", "classical"],
        ["health", "fitness", "exercise", "yoga", "meditation", "vitamin", "protein", "diet", "nutrition", "workout", "gym", "muscle", "heart", "brain", "wellness"],
        ["nature", "flower", "grass", "leaf", "plant", "garden", "insect", "butterfly", "bee", "ant", "spider", "snake", "bear", "wolf", "deer"],
        ["space", "planet", "earth", "mars", "jupiter", "saturn", "rocket", "astronaut", "galaxy", "universe", "telescope", "comet", "asteroid", "orbit", "alien"],
        ["technology", "ai", "robot", "drone", "virtual", "reality", "gadget", "smartwatch", "camera", "printer", "scanner", "cloud", "blockchain", "crypto", "nft"],
        ["sports", "olympic", "champion", "tournament", "stadium", "coach", "team", "player", "fan", "trophy", "medal", "race", "match", "score", "victory"],
        ["travel", "beach", "island", "desert", "jungle", "waterfall", "cave", "volcano", "camping", "hiking", "backpack", "suitcase", "passport", "tourist", "destination"],
        ["food", "pizza", "burger", "sushi", "pasta", "steak", "salad", "sandwich", "breakfast", "lunch", "dinner", "dessert", "icecream", "candy", "bakery"],
        ["movie", "film", "cinema", "actor", "actress", "director", "hollywood", "bollywood", "drama", "comedy", "horror", "thriller", "action", "romance", "sci-fi"],
        ["animals", "pets", "zoo", "wildlife", "safari", "aquarium", "dolphin", "whale", "shark", "octopus", "crab", "lobster", "seal", "penguin", "polar"],
        ["fashion", "clothes", "shirt", "pants", "dress", "skirt", "jacket", "shoes", "boots", "hat", "glasses", "jewelry", "necklace", "ring", "bracelet"],
        ["business", "money", "finance", "bank", "investment", "stock", "market", "economy", "startup", "company", "CEO", "manager", "employee", "salary", "profit"]
    ];

    // ---- Tham số FORM mở rộng ----
    const formParams = [
        "QBLH","QBRE","HDRSC1","LGWQS1","LGWQS2","LGWQS3","R5FD","R5FD1","R5FD2","R5FD3",
        "R5FD4","R5FD5","R5FD6","R5FD7","QSRE1","QSRE2","QSRE3","QSRE4","QSRE5","QSRE6",
        "QSRE7","QSRE8", "QSR9", "QSR10", "QSR11", "QSR12" // thêm mới
    ];

    // ---- Hàm chọn từ ngẫu nhiên (có kiểm soát lặp) ----
    const randomTerm = (usedTerms = new Set()) => {
        // Nếu đã dùng quá nhiều, cho phép lặp lại (tránh infinite loop)
        if (usedTerms.size > termLists.flat().length * 0.8) {
            const list = termLists[Math.floor(Math.random() * termLists.length)];
            return list[Math.floor(Math.random() * list.length)];
        }
        let term;
        do {
            const list = termLists[Math.floor(Math.random() * termLists.length)];
            term = list[Math.floor(Math.random() * list.length)];
        } while (usedTerms.has(term));
        return term;
    };

    const randomForm = () => formParams[Math.floor(Math.random() * formParams.length)];

    // ---- Tạo danh sách tìm kiếm với delay chính xác ----
    const generateSearches = () => {
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
                term,
                url,
                index,
                delay: cumulativeDelay,
                currentDelay
            });
        }
        return searches;
    };

    // ---- Timer helpers với độ chính xác cao ----
    let timeouts = [];
    let nextSearchTime = null;
    let completeTime = null;
    let countdownInterval = null;
    let autoStopTimeout = null; // riêng cho timeout tự động kết thúc

    const toClockFormat = (ms, showHours = false) => {
        if (ms < 0) ms = 0;
        const hrs = Math.floor(ms / (1000*60*60));
        const min = Math.floor(ms / (1000*60)) % 60;
        const sec = Math.floor(ms / 1000) % 60;
        if (showHours || hrs > 0) {
            return `${String(hrs).padStart(2,'0')}:${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
        }
        return `${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    };

    const updateTimerDisplay = () => {
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
        timerDiv.querySelector('.info-value').innerText = timerText;
    };

    const startCountdown = () => {
        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = setInterval(updateTimerDisplay, 200); // cập nhật nhanh hơn
    };

    const clearAllTimeouts = () => {
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
    };

    // Format số thứ tự động theo tổng số
    const formatIndex = (current, total) => {
        const padLen = String(total).length;
        return String(current).padStart(padLen, '0');
    };

    const updateProgress = (current, total, term = '') => {
        const percent = (current / total) * 100;
        progressBar.style.width = `${percent}%`;
        progressBar.setAttribute('aria-valuenow', percent);
        const text = `(${formatIndex(current, total)}/${total})`;
        progressBox.querySelector('.progress-value').innerText = text;
        document.title = `${text} - Bing Auto Search`;

        // Cập nhật từ khoá hiện tại nếu có
        if (term) {
            currentTermSpan.innerText = `🔍 ${term}`;
        }
    };

    // ---- Xử lý tìm kiếm ----
    let currentSearches = [];
    let currentIndex = 0;

    const startSearch = () => {
        if (stopBtn.style.display === 'inline-flex') return;

        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-flex';
        progressBar.style.width = '0%';
        currentTermSpan.innerText = ''; // xóa từ cũ

        currentSearches = generateSearches();
        currentIndex = 0;

        const now = new Date();
        completeTime = new Date(now.getTime() + currentSearches[currentSearches.length-1].delay);

        currentSearches.forEach(s => {
            const timeoutId = setTimeout(() => {
                currentIndex = s.index;
                updateProgress(currentIndex, searchConfig.limit, s.term);

                const nextSearch = currentSearches.find(se => se.index === s.index + 1);
                if (nextSearch) {
                    nextSearchTime = new Date(now.getTime() + nextSearch.delay);
                } else {
                    nextSearchTime = null;
                }

                // Nếu là lần cuối, lên lịch tự động dừng sau 3 giây
                if (s.index === searchConfig.limit) {
                    autoStopTimeout = setTimeout(() => {
                        if (stopBtn.style.display === 'inline-flex') {
                            stopSearch(false);
                        }
                    }, 3000);
                    timeouts.push(autoStopTimeout); // lưu để có thể huỷ nếu cần
                }

                // Tạo iframe với kiểm tra lỗi
                const iframe = document.createElement('iframe');
                iframe.src = s.url;
                iframe.title = s.term;
                iframe.setAttribute('data-index', s.index);
                iframe.onerror = () => {
                    console.error('Iframe failed to load:', s.url);
                    // Có thể thử lại hoặc bỏ qua
                };
                while (bingDiv.firstChild) bingDiv.removeChild(bingDiv.firstChild);
                bingDiv.appendChild(iframe);
            }, s.delay);

            timeouts.push(timeoutId);
        });

        nextSearchTime = new Date(now.getTime() + currentSearches[0].currentDelay);
        startCountdown();
    };

    const stopSearch = (openPoints = true) => {
        clearAllTimeouts();

        while (bingDiv.firstChild) bingDiv.removeChild(bingDiv.firstChild);
        const placeholder = document.createElement('div');
        placeholder.className = 'iframe-placeholder';
        placeholder.innerHTML = '<i class="fas fa-search"></i><span>Kết quả tìm kiếm sẽ hiển thị ở đây</span>';
        bingDiv.appendChild(placeholder);

        startBtn.style.display = 'inline-flex';
        stopBtn.style.display = 'none';
        progressBar.style.width = '0%';
        progressBox.querySelector('.progress-value').innerText = '(00/00)';
        timerDiv.querySelector('.info-value').innerText = 'Đã dừng';
        currentTermSpan.innerText = '';
        document.title = 'Bing Auto Search';

        if (openPoints) {
            window.open('https://rewards.bing.com/pointsbreakdown', '_blank');
        }
    };

    // ---- Gán sự kiện ----
    startBtn.addEventListener('click', startSearch);
    stopBtn.addEventListener('click', () => stopSearch(true));

    limitSelect.addEventListener('change', (e) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val > 0) {
            searchConfig.limit = val;
            cookies.set('_search_limit', val, 365);
            location.reload();
        }
    });

    intervalSelect.addEventListener('change', (e) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val > 0) {
            searchConfig.interval = val;
            cookies.set('_search_interval', val, 365);
            location.reload();
        }
    });

    // ---- WakeLock với xử lý lỗi ----
    if ('wakeLock' in navigator) {
        let wakeLockSentinel = null;
        const requestWakeLock = async () => {
            try {
                wakeLockSentinel = await navigator.wakeLock.request('screen');
                wakeLockSentinel.addEventListener('release', () => {
                    wakeLockSentinel = null;
                });
            } catch (err) {
                console.warn('WakeLock error:', err);
            }
        };
        requestWakeLock();
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && !wakeLockSentinel) {
                requestWakeLock();
            }
        });
    }

    // ---- TỰ ĐỘNG CHẠY KHI TRANG LOAD (có thể delay để DOM sẵn sàng) ----
    // Lắng nghe lệnh từ extension (thông qua content script)
// ---- TỰ ĐỘNG CHẠY KHI TRANG LOAD ----
    // Lắng nghe lệnh từ extension
    window.addEventListener('message', (event) => {
        // Kiểm tra data hợp lệ
        const dataPayload = event.data;
        if (!dataPayload || !dataPayload.action) return;

        const { action, data } = dataPayload;

        switch (action) {
            case 'START_SEARCH':
                // Cập nhật cấu hình từ dữ liệu gửi xuống
                if (data) {
                    if (data.limit) {
                        searchConfig.limit = data.limit;
                        limitSelect.value = data.limit;
                    }
                    if (data.interval !== undefined) {
                        searchConfig.interval = data.interval;
                        intervalSelect.value = data.interval;
                    }
                }
                // Cập nhật hiển thị cài đặt
                updateSettingsText();
                
                // Bắt đầu tìm kiếm
                startSearch();
                break; // Kết thúc case START_SEARCH

            case 'STOP_SEARCH':
                stopSearch(false); // false để không mở trang pointsbreakdown
                break;

            default:
                break;
        }
    });

})(); // Kết thúc IIFE bắt đầu từ dòng 1
