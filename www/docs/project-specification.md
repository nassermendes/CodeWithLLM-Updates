# CodeWithLLM 🤖

A project for publishing notes about effectively using LLM for code development 📝

## Key Features 🎯

- Bilingual blog (English and Ukrainian) 🌍
- Tag support for easy navigation 🏷️
- Comments via Giscus 💬
- Responsive design 📱
- Monthly post archives 📅

## Technologies 🛠️

- Node.js for static site generation
- Markdown for content writing
- Minimalist CSS without frameworks
- Giscus for GitHub-based comments
- GitHub Pages for hosting

## Project Structure 📁

```
|.
├── public/            # Статичні файли для деплою
│   ├── ua/           🇺🇦 Україномовний контент
│   │   └── 2024-*/  📅 Архіви за місяцями
│   ├── tools/        🛠️ Сторінка інструментів
│   └── about/        ℹ️ Інформація про проект
├── docs/             📄 Документація та специфікації
└── scripts/          🐚 Node.js скрипти для генерації
```

## Додаткові деталі 🌈

### UI/UX
- Адаптивне меню з бургер-іконкою (див. код мобільного меню)
- Анімації ховер-ефектів для посилань та кнопок
- Градієнтний фон з плавними переходами

### Оптимізації
- Кешування GitHub Stars через API
- Ліниве завантаження YouTube-відей
- Мініфіковані CSS/JS для швидкодії

### Інтеграції
- Giscus для коментарів 💬
- GitHub API для відображення зірок ⭐
- OpenGraph мітки для соцмереж