// Конфигурация источников постов
const posts_source = {
    eng: [{year: 2024, path: 'eng_2024'}, {year: 2025, path: 'eng_2025'}],
    ukr: [{year: 2024, path: 'ukr_2024'}, {year: 2025, path: 'ukr_2025'}]   
};

// Допустимые расширения файлов
const ALLOWED_EXTENSIONS = {
    markdown: ['.md'],
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    audio: ['.mp3', '.wav', '.ogg', '.m4a']
};

// Конфигурация меню
const menuItems = [
    { href: '/', text: '🆕 Updates', id: 'index' },
    { href: 'ua/', text: '🇺🇦 Українською', id: 'ukr' },
    { href: 'tools/', text: '🛠️ Tools', id: 'tools' },
    { href: 'about/', text: 'ℹ️ About', id: 'about' }
];

// Настройки постов
const postsConfig = {
    postsPerChunk: 30,
    recentPostsCount: 9,
    visiblePostsInitial: 10
};

// Настройки локализации
const localization = {
    sidebarTitle: {
        en: 'Recent Posts',
        uk: 'Останні дописи'
    },
    loading: 'Загрузка... 🔄',
    errors: {
        metaLoad: 'Не удалось загрузить мета-данные',
        chunkLoad: 'Ошибка загрузки чанка',
        allLoaded: 'Все посты загружены'
    }
};

module.exports = {
    posts_source,
    ALLOWED_EXTENSIONS,
    menuItems,
    postsConfig,
    localization
}; 