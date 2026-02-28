const defaultSubjects = {
    "محاسبة 2": { totalChapters: 4, completed: [false, false, false, false] },
    "محاسبة انجلش": { totalChapters: 5, completed: [false, false, false, false, false] },
    "اقتصاد كلي": { totalChapters: 6, completed: [false, false, false, false, false, false] },
    "موارد اقتصادية": { totalChapters: 6, completed: [false, false, false, false, false, false] },
    "إدارة عامة": { totalChapters: 5, completed: [false, false, false, false, false] },
    "قانون": { totalChapters: 4, completed: [false, false, false, false] }
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
let tasksList = JSON.parse(localStorage.getItem('studyApp_Tasks')) || [];
let globalNotes = localStorage.getItem('studyApp_GlobalNotes') || "";

// --- تهيئة التطبيق ---
window.onload = () => {
    if(localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark-mode');

    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if(splash) {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
                document.getElementById('app-container').style.display = 'block';
                if (userData) { showScreen('dashboard-screen'); renderDashboard(); } 
                else { showScreen('login-screen'); }
            }, 500);
        }
    }, 2000);
};

// --- التنقل الذكي (إظهار وإخفاء البارات) ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(screenId).style.display = 'block';

    // إخفاء البارات في شاشة تسجيل الدخول
    if(screenId === 'login-screen') {
        document.getElementById('top-bar').style.display = 'none';
        document.getElementById('bottom-bar').style.display = 'none';
    } else {
        document.getElementById('top-bar').style.display = 'flex';
        document.getElementById('bottom-bar').style.display = 'flex';
        updateCoins();
    }

    // تحديث البيانات بناءً على الشاشة
    if(screenId === 'wishlist-screen') renderWishlist();
    if(screenId === 'tasks-screen') renderTasks();
    if(screenId === 'notebook-screen') document.getElementById('globalNotesInput').value = globalNotes;
}

// --- تسجيل الدخول والخروج ---
function startApp() {
    const name = document.getElementById('studentName').value.trim();
    if (!name) return alert("اكتب اسمك الأول يا بطل!");
    userData = { name: name, subjects: JSON.parse(JSON.stringify(defaultSubjects)) };
    saveData(); 
    showScreen('dashboard-screen'); 
    renderDashboard();
}

function logout() {
    if(confirm("متأكد من الخروج ومسح بياناتك؟")) {
        localStorage.clear(); 
        userData = null; wishlist = []; tasksList = []; globalNotes = "";
        showScreen('login-screen');
    }
}

// --- الوضع الليلي ---
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// --- لوحة التحكم (الرئيسية) ---
function renderDashboard() {
    document.getElementById('welcomeName').innerText = `أهلاً، ${userData.name}`;
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
        card.innerHTML = `<h4>${sub}</h4><p>${data.totalChapters} فصول</p><p style="color: var(--text-color);">${Math.round((done/data.totalChapters)*100)}%</p>`;
        grid.appendChild(card);
    }
    let overAll = totalAll === 0 ? 0 : Math.round((totalDone / totalAll) * 100);
    document.getElementById('overallProgressBar').style.width = `${overAll}%`;
    document.getElementById('overallProgressText').innerText = `${overAll}%`;
}

// --- تفاصيل المادة ---
function openSubject(sub) {
    currentActiveSubject = sub;
    document.getElementById('subjectTitle').innerText = sub;
    renderChapters(); updateSubjectProgress(); showScreen('subject-screen');
}

function renderChapters() {
    const list = document.getElementById('chaptersList'); list.innerHTML = '';
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
    saveData(); renderChapters(); updateSubjectProgress(); updateCoins();
}

function updateSubjectProgress() {
    let data = userData.subjects[currentActiveSubject];
    let done = data.completed.filter(ch => ch).length;
    let pct = Math.round((done / data.totalChapters) * 100);
    document.getElementById('subjectProgressBar').style.width = `${pct}%`;
    document.getElementById('subjectProgressText').innerText = `${pct}%`;
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
        else { clearInterval(timerInterval); isRunning = false; alert("انتهى الوقت! خد استراحة ☕"); resetTimer(); }
    }, 1000);
}
function pauseTimer() { clearInterval(timerInterval); isRunning = false; }
function resetTimer() { clearInterval(timerInterval); isRunning = false; timeLeft = 25 * 60; updateTimerDisplay(); }

// --- المهام اليومية (Tasks) ---
function addTask() {
    let input = document.getElementById('taskInput');
    let text = input.value.trim();
    if (!text) return alert("اكتب المهمة!");
    tasksList.push({ text: text, done: false });
    input.value = '';
    saveData(); renderTasks();
}

function renderTasks() {
    let list = document.getElementById('tasksList'); list.innerHTML = '';
    tasksList.forEach((task, index) => {
        let li = document.createElement('li'); 
        li.className = `chapter-item ${task.done ? 'completed' : ''}`;
        li.innerHTML = `
            <input type="checkbox" onchange="toggleTask(${index})" ${task.done ? 'checked' : ''}>
            <span style="font-size: 16px; flex: 1;">${task.text}</span> 
            <button class="btn-danger" style="padding: 5px 10px; font-size: 14px;" onclick="removeTask(${index})">حذف</button>
        `;
        list.appendChild(li);
    });
}

function toggleTask(index) { tasksList[index].done = !tasksList[index].done; saveData(); renderTasks(); }
function removeTask(index) { tasksList.splice(index, 1); saveData(); renderTasks(); }

// --- قائمة الأمنيات (Wishlist) ---
function addWish() {
    let input = document.getElementById('wishInput');
    let text = input.value.trim();
    if (!text) return alert("اكتب أمنيتك!");
    wishlist.push(text);
    input.value = '';
    saveData(); renderWishlist();
}

function renderWishlist() {
    let list = document.getElementById('wishList'); list.innerHTML = '';
    wishlist.forEach((wish, index) => {
        let li = document.createElement('li'); li.className = 'chapter-item';
        li.innerHTML = `
            <span style="font-size: 18px; flex: 1;">🎯 ${wish}</span> 
            <button class="btn-danger" style="padding: 5px 10px; font-size: 14px;" onclick="removeWish(${index})">حذف</button>
        `;
        list.appendChild(li);
    });
}

function removeWish(index) { wishlist.splice(index, 1); saveData(); renderWishlist(); }

// --- الملاحظات (Notebook) ---
function saveGlobalNotes() {
    globalNotes = document.getElementById('globalNotesInput').value;
    saveData();
}

// --- العملات (Coins) والحفظ ---
function updateCoins() {
    if (!userData) return;
    let totalDone = 0;
    for (let sub in userData.subjects) {
        totalDone += userData.subjects[sub].completed.filter(ch => ch === true).length;
    }
    let globalCoin = document.getElementById('globalCoinCount');
    if(globalCoin) globalCoin.innerText = totalDone * 10;
}

function saveData() { 
    localStorage.setItem('studyApp_Data', JSON.stringify(userData)); 
    localStorage.setItem('studyApp_Wishlist', JSON.stringify(wishlist)); 
    localStorage.setItem('studyApp_Tasks', JSON.stringify(tasksList)); 
    localStorage.setItem('studyApp_GlobalNotes', globalNotes); 
}
