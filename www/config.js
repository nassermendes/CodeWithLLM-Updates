const siteUrl = 'https://aicode.danvoronov.com/';

const posts_source = {
    eng: [{year: 2024, path: 'eng_2024'}, {year: 2025, path: 'eng_2025'}],
    ukr: [{year: 2024, path: 'ukr_2024'}, {year: 2025, path: 'ukr_2025'}]   
};

const ALLOWED_EXTENSIONS = {
    markdown: ['.md'],
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    audio: ['.mp3', '.wav', '.ogg', '.m4a']
};

const menuItems = [
    { 
        id: 'index',
        text: '🆕 Updates',
        path: '/',
        showArchive: true,
        lang: 'en'
    },
    { 
        id: 'ukr',
        text: '🇺🇦  Українською',
        path: '/ua/',
        showArchive: true,
        lang: 'uk'
    },
    { 
        id: 'tools',
        text: '🛠️ Tools',
        path: '/tools/',
        showArchive: false
    },
    { 
        id: 'about',
        text: 'ℹ️ About',
        path: '/about/',
        showArchive: false
    }
];

const postsConfig = {
    recentPostsCount: 12,
    monthNames: {
        en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        uk: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень']
    }
};

module.exports = {
    posts_source,
    siteUrl,
    ALLOWED_EXTENSIONS,
    menuItems,
    postsConfig
}; 