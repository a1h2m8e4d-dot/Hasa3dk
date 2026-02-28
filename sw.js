const CACHE_NAME = 'study-app-v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './icon.png' // تأكد إن صورة اللوجو بتاعتك اسمها كده وموجودة
];

// تحميل الملفات وتخزينها في الموبايل أول مرة تفتح التطبيق
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// تشغيل التطبيق من الذاكرة لو مفيش إنترنت
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
