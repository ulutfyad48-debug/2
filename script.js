const FOLDERS = {
    novelMain: '1PWDGvI9Pxkzma58-BDPZYAxq4Mhw1gdu',
    poetry: '1Bje7U53wmDHhuUrAvj-NaHDAXAfMiG_h',
    codewords: '1n8MuNqMaOe6eAntLDf-zTHXaNji3NEkn',
    about: '1QHIFfbqFIcpzHKEwEzPlRovHrC4t7wkX'
};

const NOVELS = { 'بازگشت عشق': '1AnTGqNqtKQxRHKRXZaGxVy4H7EtlfQjI' };
const API_KEY = 'AIzaSyCMppjIJi2_xBi3oLVXN0XjdANMX10xmwE';
const WA_NUMBERS = ['923159226260', '923359079528'];

// 🎮 PUZZLE GAME SETTINGS
const PUZZLE_GAME_URL = 'https://ulutfyad48-debug.github.io/Novelistan/puzzle-game.html';
const PUZZLE_PRICE = 50;
const PUZZLE_REWARD = 1000;
const EASYPAISA_NUMBER = '03359079528';

let unlocked = JSON.parse(localStorage.getItem('nov_unlocked')) || [];
let currentPkg = "", currentNovel = "", currentScreen = "home";
const cache = {};

function getDailyCode(pkgId) {
    const d = new Date();
    return (pkgId + d.getDate() + (d.getMonth() + 1) + "X").toUpperCase();
}

function openSection(mode) {
    document.getElementById('home-screen').style.display = 'none';
    if (mode === 'novel') {
        showNovelList();
    } else if (mode === 'codewords') {
        // 🎮 Codewords section - Puzzle Game
        showPuzzleGameSection();
    } else {
        currentScreen = mode;
        document.getElementById('content-screen').style.display = 'block';
        const titles = { poetry: "📜 اردو شاعری", about: "👤 مصنف" };
        document.getElementById('section-title').innerText = titles[mode] || "";
        loadFiles(FOLDERS[mode]);
    }
}

// 🎮 PUZZLE GAME SECTION
function showPuzzleGameSection() {
    currentScreen = "puzzleGame";
    
    // Timer check - شام 8 سے 10 بجے تک
    const now = new Date();
    const hour = now.getHours();
    const isGameTime = (hour >= 20 && hour < 22); // 8 PM to 10 PM
    
    if (!isGameTime) {
        alert(`⏰ گیم کا وقت:\nشام 8 بجے سے رات 10 بجے تک\n\nابھی وقت: ${now.toLocaleTimeString('ur-PK', {hour: '2-digit', minute: '2-digit'})}`);
        location.reload();
        return;
    }
    
    document.getElementById('content-screen').style.display = 'block';
    document.getElementById('section-title').innerText = "🎮 پزل گیم چیلنج";
    
    const list = document.getElementById('items-list');
    list.style.gridTemplateColumns = '1fr';
    list.innerHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <h2 style="font-size: 2rem; margin-bottom: 15px;">🎮 پزل گیم</h2>
            <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 15px; margin: 20px 0;">
                <p style="font-size: 1.2rem; margin: 10px 0;">💰 فیس: <strong>${PUZZLE_PRICE} روپے</strong></p>
                <p style="font-size: 1.2rem; margin: 10px 0;">🏆 انعام: <strong>${PUZZLE_REWARD} روپے</strong></p>
                <p style="font-size: 1rem; margin: 10px 0; color: #ffd700;">⏱️ 5 سوالات - ہر سوال 60 سیکنڈ</p>
                <p style="font-size: 1rem; margin: 10px 0; color: #ff6b6b;">❌ غلط جواب = گیم ختم</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin: 20px 0;">
                <p style="font-size: 0.9rem; margin-bottom: 10px;">💡 کیسے کھیلیں؟</p>
                <p style="font-size: 0.85rem; line-height: 1.6;">
                    1️⃣ واٹس ایپ پر رابطہ کریں<br>
                    2️⃣ ${PUZZLE_PRICE} روپے Easypaisa کریں<br>
                    3️⃣ Code حاصل کریں<br>
                    4️⃣ گیم کھیلیں اور جیتیں!
                </p>
            </div>
            
            <button onclick="contactForPuzzleGame()" style="background: #16a34a; color: white; border: none; padding: 15px 30px; border-radius: 12px; font-size: 1.2rem; font-weight: bold; cursor: pointer; width: 100%; margin: 10px 0; box-shadow: 0 5px 15px rgba(22,163,74,0.3);">
                📱 واٹس ایپ پر رابطہ کریں
            </button>
            
            <button onclick="showPuzzleCodeInput()" style="background: var(--accent2); color: #000; border: none; padding: 15px 30px; border-radius: 12px; font-size: 1.2rem; font-weight: bold; cursor: pointer; width: 100%; margin: 10px 0; box-shadow: 0 5px 15px rgba(0,217,255,0.3);">
                🔑 میرے پاس کوڈ ہے
            </button>
            
            <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px; margin-top: 20px;">
                <p style="font-size: 0.9rem; color: #ffd700;">📲 Easypaisa نمبر:</p>
                <p style="font-size: 1.3rem; font-weight: bold; letter-spacing: 2px;">${EASYPAISA_NUMBER}</p>
            </div>
        </div>
    `;
}

// WhatsApp message for Puzzle Game
function contactForPuzzleGame() {
    const message = encodeURIComponent(
        `السلام علیکم! 🎮\n\n` +
        `میں پزل گیم کھیلنا چاہتا/چاہتی ہوں۔\n\n` +
        `💰 فیس: ${PUZZLE_PRICE} روپے\n` +
        `🏆 انعام: ${PUZZLE_REWARD} روپے\n` +
        `📲 Easypaisa: ${EASYPAISA_NUMBER}\n\n` +
        `براہ کرم کوڈ بھیجیں۔`
    );
    
    // دونوں WhatsApp numbers پر option دیں
    const choice = confirm(
        `کس نمبر پر رابطہ کریں؟\n\n` +
        `OK = ${WA_NUMBERS[0]}\n` +
        `Cancel = ${WA_NUMBERS[1]}`
    );
    
    const selectedNumber = choice ? WA_NUMBERS[0] : WA_NUMBERS[1];
    window.open(`https://wa.me/${selectedNumber}?text=${message}`, '_blank');
}

// Code input for Puzzle Game
function showPuzzleCodeInput() {
    const code = prompt("🔑 اپنا Puzzle Game کوڈ درج کریں:");
    
    if (!code || code.trim() === "") {
        alert("❌ کوڈ درج کریں!");
        return;
    }
    
    // Code کو uppercase میں convert کریں
    const enteredCode = code.trim().toUpperCase();
    
    // یہاں آپ code verification کر سکتے ہیں
    // ابھی کے لیے direct game کھول دیتے ہیں
    
    alert(`✅ کوڈ قبول ہوا: ${enteredCode}\n\n🎮 گیم شروع ہو رہی ہے...`);
    
    // Puzzle game page کھولیں
    window.open(PUZZLE_GAME_URL, '_blank');
}

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
    list.style.gridTemplateColumns = '1fr 1fr';
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

async function loadFiles(fId) {
    const list = document.getElementById('items-list');
    list.style.gridTemplateColumns = '1fr 1fr';
    if (cache[fId]) return renderFiles(cache[fId]);

    list.innerHTML = '<p style="grid-column:1/-1; text-align:center;">⏳ لوڈ ہو رہا ہے...</p>';
    try {
        const res = await fetch(`https://www.googleapis.com/drive/v3/files?q='${fId}'+in+parents+and+trashed=false&key=${API_KEY}&fields=files(id,name,webViewLink,mimeType)&pageSize=40`);
        const data = await res.json();
        cache[fId] = data.files;
        renderFiles(data.files);
    } catch (e) { list.innerHTML = '<p>⚠️ نیٹ ورک ایرر</p>'; }
}

function renderFiles(files) {
    const list = document.getElementById('items-list');
    list.innerHTML = files.map(f => `
        <div class="card" onclick="window.open('${f.mimeType.includes('image') ? `https://drive.google.com/uc?export=view&id=${f.id}` : f.webViewLink}', '_blank')">
            <span>${f.name.split('.')[0]}</span>
        </div>
    `).join('');
}

function getPkg(n) {
    if (n <= 10) return { id: "FREE", price: 0 };
    if (n <= 50) return { id: "P1_" + Math.ceil((n-10)/5), price: 50 };
    if (n <= 80) return { id: "P2_" + Math.ceil((n-50)/5), price: 100 };
    return { id: "P3_FINAL", price: 300 };
}

async function fetchAndOpen(name, fId) {
    try {
        const res = await fetch(`https://www.googleapis.com/drive/v3/files?q='${fId}'+in+parents+and+name+contains+'${name}'+and+trashed=false&key=${API_KEY}&fields=files(id,webViewLink)`);
        const data = await res.json();
        if (data.files.length) window.open(data.files[0].webViewLink, '_blank');
        else alert("❌ فائل نہیں ملی!");
    } catch (e) { alert("⚠️ ایرر!"); }
}

function goBack() {
    if (currentScreen === "episodes") openSection('novel');
    else location.reload();
}

function checkAccess() {
    if (document.getElementById('user-code').value.trim().toUpperCase() === getDailyCode(currentPkg)) {
        unlocked.push(currentPkg);
        localStorage.setItem('nov_unlocked', JSON.stringify(unlocked));
        alert("✅ ان لاک ہو گیا!"); location.reload();
    } else alert("❌ غلط کوڈ!");
}

function closeModals() { document.querySelectorAll('.modal').forEach(m => m.classList.remove('active')); }
function showCodeInput() { closeModals(); document.getElementById('code-modal').classList.add('active'); }