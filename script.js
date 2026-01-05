// ========================================
// ⚠️ ٹائمر تبدیل کرنے کے لیے صرف یہ 2 نمبر بدلیں:
// ========================================
const GAME_START_HOUR = 20;  // شروع وقت (مثال: 20 = رات 8 بجے)
const GAME_END_HOUR = 23;     // ختم وقت (مثال: 23 = رات 11 بجے)
// ========================================

// ===== CONFIGURATION =====
const FOLDERS = {
    novelMain: '1PWDGvI9Pxkzma58-BDPZYAxq4Mhw1gdu',
    poetry: '1Bje7U53wmDHhuUrAvj-NaHDAXAfMiG_h',
    about: '1QHIFfbqFIcpzHKEwEzPlRovHrC4t7wkX'
};

const NOVELS = { 
    'بازگشت عشق': '1AnTGqNqtKQxRHKRXZaGxVy4H7EtlfQjI' 
};

const API_KEY = 'AIzaSyCMppjIJi2_xBi3oLVXN0XjdANMX10xmwE';
const WA_NUMBERS = ['923159226260', '923125540048'];
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwk4hNSimgU__x1PHwrjJZe_596-2Ay-y6uTHamx7zYlSZP1MGg_dQXNtw73_f2VIKh/exec";

// ===== GLOBAL VARIABLES =====
let unlocked = JSON.parse(localStorage.getItem('nov_unlocked')) || [];
let currentPkg = "", currentNovel = "", currentScreen = "home";
const cache = {};
let puzzles = [];
let currentIndex = 0;
let clock = null;
let secondsLeft = 60;
let userFullName = "";
let usedCode = "";

// ===== HELPER FUNCTIONS =====
function getDailyCode(pkgId) {
    const d = new Date();
    return (pkgId + d.getDate() + (d.getMonth() + 1) + "X").toUpperCase();
}

function getPkg(n) {
    if (n <= 10) return { id: "FREE", price: 0 };
    if (n <= 50) return { id: "P1_" + Math.ceil((n-10)/5), price: 50 };
    if (n <= 80) return { id: "P2_" + Math.ceil((n-50)/5), price: 100 };
    return { id: "P3_FINAL", price: 300 };
}

// ===== NAVIGATION FUNCTIONS =====
function openSection(mode) {
    document.getElementById('home-screen').style.display = 'none';
    
    if (mode === 'novel') {
        showNovelList();
    } else if (mode === 'puzzle') {
        showPuzzleSection();
    } else {
        currentScreen = mode;
        document.getElementById('content-screen').style.display = 'block';
        const titles = { 
            poetry: "📜 اردو شاعری", 
            about: "👤 مصنف" 
        };
        document.getElementById('section-title').innerText = titles[mode] || "";
        loadFiles(FOLDERS[mode]);
    }
}

function goBack() {
    if (currentScreen === "episodes") {
        openSection('novel');
    } else {
        location.reload();
    }
}

// ===== NOVEL FUNCTIONS =====
function showNovelList() {
    currentScreen = "novelList";
    document.getElementById('novel-list-screen').style.display = 'block';
    const container = document.getElementById('novels-container');
    container.innerHTML = Object.keys(NOVELS).map(name => `
        <div class="novel-list-card" onclick="openNovel('${name}')">
            <h3>📖 ${name}</h3>
            <p>تمام اقساط دستیاب ہیں</p>
        </div>
    `).join('');
}

function openNovel(novelName) {
    currentScreen = "episodes";
    currentNovel = novelName;
    document.getElementById('novel-list-screen').style.display = 'none';
    document.getElementById('content-screen').style.display = 'block';
    document.getElementById('section-title').innerText = `📚 ${novelName}`;
    renderNovel(NOVELS[novelName]);
}

function renderNovel(folderId) {
    const list = document.getElementById('items-list');
    let html = '';
    
    for (let i = 1; i <= 100; i++) {
        let pkg = getPkg(i);
        const isOpen = i <= 10 || unlocked.includes(pkg.id);
        html += `
            <div class="card ${isOpen ? '' : 'locked'}" onclick="${isOpen ? `fetchAndOpen(${i}, '${folderId}')` : `showLock(${i}, '${pkg.id}', ${pkg.price})`}">
                <span>قسط ${i}<br><small style="color:${isOpen?'#22c55e':'#ff0a54'}">${isOpen?'🔓 اوپن':'🔒 لاک'}</small></span>
            </div>`;
    }
    list.innerHTML = html;
}

function showLock(i, pkgId, price) {
    currentPkg = pkgId;
    document.getElementById('pay-info').innerText = `📦 قسط ${i} پیکیج کا حصہ ہے\n💰 قیمت: ${price} روپے`;
    const msg = encodeURIComponent(`السلام علیکم! مجھے ${currentNovel} کا پیکیج ${pkgId} خریدنا ہے۔`);
    document.getElementById('wa-link-1').href = `https://wa.me/${WA_NUMBERS[0]}?text=${msg}`;
    document.getElementById('wa-link-2').href = `https://wa.me/${WA_NUMBERS[1]}?text=${msg}`;
    document.getElementById('pay-modal').classList.add('active');
}

function checkAccess() {
    if (document.getElementById('user-code').value.trim().toUpperCase() === getDailyCode(currentPkg)) {
        unlocked.push(currentPkg);
        localStorage.setItem('nov_unlocked', JSON.stringify(unlocked));
        alert("✅ ان لاک ہو گیا!");
        location.reload();
    } else {
        alert("❌ غلط کوڈ!");
    }
}

async function fetchAndOpen(name, fId) {
    try {
        const res = await fetch(`https://www.googleapis.com/drive/v3/files?q='${fId}'+in+parents+and+name+contains+'${name}'+and+trashed=false&key=${API_KEY}&fields=files(id,webViewLink)`);
        const data = await res.json();
        if (data.files.length) {
            window.open(data.files[0].webViewLink, '_blank');
        } else {
            alert("❌ فائل نہیں ملی!");
        }
    } catch (e) {
        alert("⚠️ ایرر!");
    }
}

// ===== FILES LOADING =====
async function loadFiles(fId) {
    const list = document.getElementById('items-list');
    
    if (cache[fId]) {
        return renderFiles(cache[fId]);
    }

    list.innerHTML = '<p style="grid-column:1/-1; text-align:center;">⏳ لوڈ ہو رہا ہے...</p>';
    
    try {
        const res = await fetch(`https://www.googleapis.com/drive/v3/files?q='${fId}'+in+parents+and+trashed=false&key=${API_KEY}&fields=files(id,name,webViewLink,mimeType)&pageSize=40`);
        const data = await res.json();
        cache[fId] = data.files;
        renderFiles(data.files);
    } catch (e) {
        list.innerHTML = '<p>⚠️ نیٹ ورک ایرر</p>';
    }
}

function renderFiles(files) {
    const list = document.getElementById('items-list');
    list.innerHTML = files.map(f => `
        <div class="card" onclick="window.open('${f.mimeType.includes('image') ? `https://drive.google.com/uc?export=view&id=${f.id}` : f.webViewLink}', '_blank')">
            <span>${f.name.split('.')[0]}</span>
        </div>
    `).join('');
}

// ===== MODAL FUNCTIONS =====
function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

function showCodeInput() {
    closeModals();
    document.getElementById('code-modal').classList.add('active');
}

// ===== PUZZLE GAME FUNCTIONS =====
function showPuzzleSection() {
    const now = new Date();
    const hour = now.getHours();
    const isGameTime = (hour >= GAME_START_HOUR && hour < GAME_END_HOUR);
    
    if (!isGameTime) {
        alert(`⏰ گیم کا وقت:\n${GAME_START_HOUR}:00 سے ${GAME_END_HOUR}:00 تک\n\nابھی وقت: ${now.toLocaleTimeString('ur-PK', {hour: '2-digit', minute: '2-digit'})}`);
        return;
    }
    
    currentScreen = "puzzle";
    document.getElementById('puzzle-screen').style.display = 'block';
    document.getElementById('puzzle-info').style.display = 'block';
    document.getElementById('puzzle-game').style.display = 'none';
    document.getElementById('puzzle-success').style.display = 'none';
}

function contactForPuzzle() {
    const message = encodeURIComponent(
        `السلام علیکم! 🎮\n\n` +
        `میں پزل گیم کھیلنا چاہتا/چاہتی ہوں۔\n\n` +
        `💰 فیس: 50 روپے\n` +
        `🏆 انعام: 1000 روپے\n` +
        `📲 Easypaisa: 03359079528\n\n` +
        `براہ کرم کوڈ بھیجیں۔`
    );
    
    const choice = confirm(
        `کس نمبر پر رابطہ کریں؟\n\n` +
        `OK = ${WA_NUMBERS[0]}\n` +
        `Cancel = ${WA_NUMBERS[1]}`
    );
    
    const selectedNumber = choice ? WA_NUMBERS[0] : WA_NUMBERS[1];
    window.open(`https://wa.me/${selectedNumber}?text=${message}`, '_blank');
}

async function showPuzzleCodeInput() {
    const code = prompt("🔑 اپنا Puzzle Game کوڈ درج کریں:");
    
    if (!code || code.trim() === "") {
        alert("❌ کوڈ درج کریں!");
        return;
    }

    const enteredCode = code.trim().toUpperCase();

    try {
        const response = await fetch(`${SCRIPT_URL}?action=verifyCode&code=${encodeURIComponent(enteredCode)}`);
        const result = await response.text();

        if (result === "SUCCESS") {
            usedCode = enteredCode;
            userFullName = prompt("اپنا مکمل نام درج کریں:");
            
            if (!userFullName || userFullName.trim() === "") {
                alert("نام درج کرنا ضروری ہے!");
                return;
            }

            userFullName = userFullName.trim();
            document.getElementById('puzzle-info').style.display = 'none';
            document.getElementById('puzzle-game').style.display = 'block';
            await getPuzzlesFromServer();
        } else {
            alert("❌ یہ کوڈ غلط ہے یا پہلے ہی استعمال ہو چکا ہے!");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("⚠️ کنکشن میں مسئلہ ہے! دوبارہ کوشش کریں۔");
    }
}

async function getPuzzlesFromServer() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getPuzzles`);
        puzzles = await response.json();
        
        if (!puzzles || puzzles.length === 0) {
            alert("سوالات لوڈ نہیں ہو سکے!");
            return;
        }
        
        displayQuestion();
    } catch (error) {
        console.error('Error:', error);
        alert("سوالات لوڈ کرنے میں مسئلہ ہے!");
    }
}

function displayQuestion() {
    if (currentIndex >= 5) {
        finishGame();
        return;
    }

    if (clock) clearInterval(clock);

    secondsLeft = 60;
    const timerElement = document.getElementById('timer');
    timerElement.innerText = secondsLeft;
    timerElement.classList.remove('warning');

    const puzzle = puzzles[currentIndex];
    document.getElementById('q-number').innerText = `سوال ${currentIndex + 1} / 5`;
    document.getElementById('q-content').innerText = puzzle.q;

    let optionsHtml = "";
    puzzle.opts.forEach((opt, index) => {
        const safeOpt = opt.replace(/'/g, "\\'");
        optionsHtml += `<button class="btn-opt" onclick="checkAnswer('${safeOpt}')">
            ${String.fromCharCode(65 + index)}. ${opt}
        </button>`;
    });
    document.getElementById('options-box').innerHTML = optionsHtml;

    clock = setInterval(() => {
        secondsLeft--;
        timerElement.innerText = secondsLeft;

        if (secondsLeft <= 10) {
            timerElement.classList.add('warning');
        }

        if (secondsLeft <= 0) {
            clearInterval(clock);
            alert("⏰ وقت ختم! اگلے سوال پر جا رہے ہیں۔");
            currentIndex++;
            displayQuestion();
        }
    }, 1000);
}

function checkAnswer(selected) {
    const correctAnswer = puzzles[currentIndex].ans;
    
    if (selected === correctAnswer) {
        clearInterval(clock);
        currentIndex++;
        
        if (currentIndex < 5) {
            setTimeout(() => displayQuestion(), 500);
        } else {
            displayQuestion();
        }
    } else {
        clearInterval(clock);
        alert("❌ غلط جواب! آپ گیم سے باہر ہو گئے ہیں۔\n\nنیا کوڈ حاصل کر کے دوبارہ کوشش کریں۔");
        location.reload();
    }
}

async function finishGame() {
    clearInterval(clock);
    
    document.getElementById('puzzle-game').style.display = 'none';
    document.getElementById('puzzle-success').style.display = 'block';
    document.getElementById('tracking-id').innerText = '⏳ محفوظ ہو رہا ہے...';

    try {
        const response = await fetch(
            `${SCRIPT_URL}?action=saveWinner&name=${encodeURIComponent(userFullName)}&code=${encodeURIComponent(usedCode)}`
        );
        const trackingId = await response.text();
        document.getElementById('tracking-id').innerText = trackingId;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('tracking-id').innerText = `ERROR_${Date.now()}`;
        alert("ڈیٹا محفوظ کرنے میں مسئلہ ہے! اسکرین شاٹ لیں اور ہم سے رابطہ کریں۔");
    }
}