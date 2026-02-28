const defaultSubjects = {
    "محاسبة 2": { totalChapters: 4, completed: [false, false, false, false], notes: "" },
    "محاسبة انجلش": { totalChapters: 5, completed: [false, false, false, false, false], notes: "" },
    "اقتصاد كلي": { totalChapters: 6, completed: [false, false, false, false, false, false], notes: "" },
    "موارد اقتصادية": { totalChapters: 6, completed: [false, false, false, false, false, false], notes: "" },
    "إدارة عامة": { totalChapters: 5, completed: [false, false, false, false, false], notes: "" },
    "قانون": { totalChapters: 4, completed: [false, false, false, false], notes: "" }
};

const quotes = [
    "النجاح هو مجموع مجهودات صغيرة تتكرر يومياً. 💪",
    "لا تتوقف عندما تتعب، توقف عندما تنتهي. 🚀",
    "الاستثمار في المعرفة يدفع أفضل الفوائد. 📚",
    "الألم المؤقت للمذاكرة أفضل من ألم الندم. ✨",
    "أنت أقوى مما تتخيل، استمر! 🌟"
];

let userData = JSON.parse(localStorage.getItem('studyApp_Data')) || null;
let currentActiveSubject = null;
let wishlist = JSON.parse(localStorage.getItem('studyApp_Wishlist')) || [];

// --- تهيئة التطبيق والشاشة الافتتاحية ---
window.onload = () => {
    // تطبيق الوضع الليلي لو محفوظ
    if(localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark-mode');

    setTimeout(() => {
        const splashScreen = document.getElementById('splash-screen');
        if(splashScreen) {
            splashScreen.style.opacity = '0';
            setTimeout(() => {
                splashScreen.style.display = 'none';
                document.getElementById('app-container').style.display = 'block';
                if (userData) { showScreen('dashboard-screen'); renderDashboard(); } 
                else { showScreen('login-screen'); }
            }, 500);
        }
    }, 2000);
};

// --- التنقل ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(screenId).style.display = 'block';
    if(screenId === 'wishlist-screen') renderWishlist(); // تحديث قائمة الأمنيات عند فتحها
}

// --- تسجيل الدخول والخروج ---
function startApp() {
    const name = document.getElementById('studentName').value.trim();
    if (!name) return alert("من فضلك اكتب اسمك!");
    userData = { name: name, takesCourses: document.getElementById('takesCourses').value, subjects: JSON.parse(JSON.stringify(defaultSubjects)) };
    saveData(); 
    showScreen('dashboard-screen'); 
    renderDashboard();
}

function logout() {
    if(confirm("متأكد من الخروج ومسح البيانات؟")) {
        localStorage.clear(); 
        userData = null; 
        wishlist = []; // تصفير الأمنيات
        showScreen('login-screen');
    }
}

// --- الوضع الليلي ---
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// --- لوحة التحكم ---
function renderDashboard() {
    document.getElementById('welcomeName').innerText = `أهلاً يا ${userData.name}!`;
    document.getElementById('quoteText').innerText = quotes[Math.floor(Math.random() * quotes.length)];
    
    const grid = document.getElementById('subjectsGrid');
    grid.innerHTML = '';
    let totalAll = 0, totalDone = 0;

    for (let sub in userData.subjects) {
        let data = userData.subjects[sub];
        let done = data.completed.filter(ch => ch).length;
        totalAll += data.totalChapters; totalDone += done;

        let card = document.createElement('div');
        card.className = 'subject-card';
        card.onclick = () => openSubject(sub);
        card.innerHTML = `<h4>${sub}</h4><p>${data.totalChapters} فصول</p><p style="color: var(--success);">${Math.round((done/data.totalChapters)*100)}%</p>`;
        grid.appendChild(card);
    }
    let overAll = Math.round((totalDone / totalAll) * 100);
    document.getElementById('overallProgressBar').style.width = `${overAll}%`;
    document.getElementById('overallProgressText').innerText = `${overAll}%`;
    
    updateCoins();
}

// --- تفاصيل المادة ---
function openSubject(sub) {
    currentActiveSubject = sub;
    document.getElementById('subjectTitle').innerText = sub;
    document.getElementById('subjectNotes').value = userData.subjects[sub].notes;
    renderChapters(); 
    updateSubjectProgress(); 
    showScreen('subject-screen');
}

function goBack() { 
    currentActiveSubject = null; 
    saveData(); 
    renderDashboard(); 
    showScreen('dashboard-screen'); 
    resetTimer(); 
}

function renderChapters() {
    const list = document.getElementById('chaptersList'); 
    list.innerHTML = '';
    let data = userData.subjects[currentActiveSubject];
    for (let i = 0; i < data.totalChapters; i++) {
        let isDone = data.completed[i];
        let item = document.createElement('div');
        item.className = `chapter-item ${isDone ? 'completed' : ''}`;
        item.innerHTML = `<input type="checkbox" onchange="toggleChapter(${i})" ${isDone ? 'checked' : ''}><span>الفصل ${i + 1}</span>`;
        list.appendChild(item);
    }
}

function toggleChapter(i) {
    userData.subjects[currentActiveSubject].completed[i] = !userData.subjects[currentActiveSubject].completed[i];
    saveData(); 
    renderChapters(); 
    updateSubjectProgress();
    updateCoins(); // تحديث النقاط فوراً
}

function updateSubjectProgress() {
    let data = userData.subjects[currentActiveSubject];
    let done = data.completed.filter(ch => ch).length;
    let pct = Math.round((done / data.totalChapters) * 100);
    document.getElementById('subjectProgressBar').style.width = `${pct}%`;
    document.getElementById('subjectProgressText').innerText = `${pct}%`;
}

// --- الحفظ في المتصفح ---
function saveNotes() { 
    userData.subjects[currentActiveSubject].notes = document.getElementById('subjectNotes').value; 
    saveData(); 
}

function saveData() { 
    localStorage.setItem('studyApp_Data', JSON.stringify(userData)); 
    localStorage.setItem('studyApp_Wishlist', JSON.stringify(wishlist)); // تم التعديل لحفظ الأمنيات
}

// --- مؤقت بومودورو ---
let timerInterval; let timeLeft = 25 * 60; let isRunning = false;
function updateTimerDisplay() {
    let m = Math.floor(timeLeft / 60); let s = timeLeft % 60;
    document.getElementById('timerDisplay').innerText = `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
}
function startTimer() {
    if(isRunning) return; isRunning = true;
    timerInterval = setInterval(() => {
        if(timeLeft > 0) { timeLeft--; updateTimerDisplay(); }
        else { clearInterval(timerInterval); isRunning = false; alert("انتهى وقت التركيز! خد استراحة 5 دقايق ☕"); resetTimer(); }
    }, 1000);
}
function pauseTimer() { clearInterval(timerInterval); isRunning = false; }
function resetTimer() { clearInterval(timerInterval); isRunning = false; timeLeft = 25 * 60; updateTimerDisplay(); }

// --- حساب وتحديث النقاط (العملات) ---
function updateCoins() {
    if (!userData) return;
    let totalDone = 0;
    for (let sub in userData.subjects) {
        totalDone += userData.subjects[sub].completed.filter(ch => ch === true).length;
    }
    let coins = totalDone * 10; // 10 عملات لكل فصل
    
    let dashCoin = document.getElementById('dashCoinCount');
    let subCoin = document.getElementById('subCoinCount');
    let wishCoin = document.getElementById('wishCoinCount'); // حصالة صفحة الأمنيات
    
    if(dashCoin) dashCoin.innerText = coins;
    if(subCoin) subCoin.innerText = coins;
    if(wishCoin) wishCoin.innerText = coins;
}

// --- قائمة الأمنيات (Wishlist) ---
function addWish() {
    let input = document.getElementById('wishInput');
    let wishText = input.value.trim();
    if (!wishText) return alert("اكتب أمنيتك الأول يا بطل!");
    
    wishlist.push(wishText);
    input.value = '';
    saveData();
    renderWishlist();
}

function renderWishlist() {
    let list = document.getElementById('wishList'); 
    if(!list) return;
    list.innerHTML = '';
    
    wishlist.forEach((wish, index) => {
        let li = document.createElement('li'); 
        li.className = 'chapter-item';
        li.innerHTML = `
            <span style="font-size: 18px;">🎯 ${wish}</span> 
            <button class="btn-danger" style="margin-right:auto; padding: 5px 10px; font-size: 14px;" onclick="removeWish(${index})">حذف</button>
        `;
        list.appendChild(li);
    });
    updateCoins();
}

function removeWish(index) { 
    wishlist.splice(index, 1); 
    saveData(); 
    renderWishlist(); 
}
