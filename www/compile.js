const fs = require('fs');
const path = require('path');
const mdToHtml = require('./md2html');
const { commonStyles } = require('./styles');
const { posts_source, ALLOWED_EXTENSIONS, menuItems, postsConfig, localization } = require('./config');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function removeDirectoryContentsWithRetry(dirPath, maxAttempts = 5) {
  if (!fs.existsSync(dirPath)) return;

  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const curPath = path.join(dirPath, file);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (fs.lstatSync(curPath).isDirectory()) {
          // Рекурсивно очищаем и удаляем поддиректории
          await removeDirectoryContentsWithRetry(curPath, maxAttempts);
          fs.rmdirSync(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
        break; // Если успешно, выходим из цикла попыток
      } catch (error) {
        if (attempt === maxAttempts) {
          console.error(`Не удалось удалить ${curPath} после ${maxAttempts} попыток`);
          throw error;
        }
        console.log(`Попытка ${attempt} удалить ${curPath} не удалась, ждем перед следующей попыткой...`);
        await sleep(1000);
      }
    }
  }
}

// Старая функция остается для обратной совместимости
function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(file => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        removeDirectory(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

function isAllowedFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return Object.values(ALLOWED_EXTENSIONS).flat().includes(ext);
}

function cleanUrl(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function processLinks(content) {
  // Сначала обработаем ссылки с текстом [Text](url)
  content = content.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (match, text, url) => {
    if (text === url || text === cleanUrl(url)) {
      // Это ссылка типа [url](url)
      return `<a href="${url}">${cleanUrl(url)}</a>`;
    }
    // Это ссылка с текстом [Text](url)
    return `<a href="${url}">${text}</a>`;
  });

  // Затем обработаем чистые URL в тексте
  content = content.replace(/(?<!\]\()(https?:\/\/[^\s<)]+)/g, (url) => {
    return `<a href="${url}">${cleanUrl(url)}</a>`;
  });

  return content;
}

function removeMetaTags(content) {
  if (content.trim().startsWith('<!--') && content.includes('-->')) {
    const endIndex = content.indexOf('-->');
    return content.slice(endIndex + 3);
  }
  return content;
}

function getPostDate(filename, year = new Date().getFullYear(), month = 1) {
  // Проверяем формат YYYY-MM-DD-HH-mm-ss.md
  const match = filename.match(/(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})(?:-(\d{2}))?.md/);
  if (match) {
    const [_, fileYear, fileMonth, day, hour, minute, second = '00'] = match;
    return `${fileYear}-${fileMonth}-${day}T${hour}:${minute}:${second}`;
  }
  
  // Старый формат DD.md
  const day = parseInt(filename.split('.')[0]);
  if (isNaN(day) || day < 1 || day > 31) {
    return new Date().toISOString().split('.')[0];
  }
  
  const date = new Date(Date.UTC(year, month - 1, day));
  if (isNaN(date.getTime())) {
    return new Date().toISOString().split('.')[0];
  }
  
  return date.toISOString().split('.')[0];
}

function formatPostTitle(filename) {
  const match = filename.match(/(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})/);
  if (match) {
    const [date, time] = match[0].split('-', 3).join('-').split(' ');
    return `${date} ${match[4]}:${match[5]}`;
  }
  return filename.replace('.md', '');
}

function processLanguagePosts(langConfig) {
  const posts = [];
  
  langConfig.forEach(({year, path: yearDir}) => {
    const yearPath = path.join('..', yearDir);
    if (!fs.existsSync(yearPath)) return;
    
    const months = fs.readdirSync(yearPath)
      .filter(item => {
        const fullPath = path.join(yearPath, item);
        return fs.statSync(fullPath).isDirectory() && !isNaN(parseInt(item));
      });
    
    months.forEach(month => {
      const monthNum = parseInt(month);
      const monthPath = path.join(yearPath, month);
      const files = fs.readdirSync(monthPath)
        .filter(item => {
          const fullPath = path.join(monthPath, item);
          return fs.statSync(fullPath).isFile();
        });
      
      files.forEach(file => {
        if (!isAllowedFile(file) || file.startsWith('Untitled')) return;
        
        const ext = path.extname(file).toLowerCase();
        if (!ALLOWED_EXTENSIONS.markdown.includes(ext)) return;
        
        const rawContent = fs.readFileSync(path.join(monthPath, file), 'utf8');
        const content = mdToHtml(removeMetaTags(rawContent));
        const date = getPostDate(file, year, monthNum);
        
        posts.push({
          title: file.match(/^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}/) ? formatPostTitle(file) : file.replace('.md', ''),
          content,
          date,
          month: monthNum
        });
      });
    });
  });
  
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function savePostsToJson(posts, language) {
  const jsonDir = path.join(__dirname, 'public', 'data');
  if (!fs.existsSync(jsonDir)) {
    fs.mkdirSync(jsonDir, { recursive: true });
  }
  
  // Разбиваем посты на чанки по 30
  const chunks = [];
  for (let i = 30; i < posts.length; i += 30) {
    chunks.push(posts.slice(i, i + 30));
  }
  
  // Сохраняем каждый чанк в отдельный файл
  chunks.forEach((chunk, index) => {
    fs.writeFileSync(
      path.join(jsonDir, `${language}_posts_${index + 1}.json`),
      JSON.stringify(chunk)
    );
  });
  
  // Создаем мета-файл с информацией о чанках
  const meta = {
    totalPosts: posts.length,
    chunks: chunks.length,
    postsPerChunk: 30
  };
  
  fs.writeFileSync(
    path.join(jsonDir, `${language}_meta.json`),
    JSON.stringify(meta)
  );
  
  // Возвращаем первые 30 постов для встраивания в HTML
  return posts.slice(0, 30);
}

function copyImages(sourcePath, targetPath) {
  if (!fs.existsSync(sourcePath)) return;
  
  const files = fs.readdirSync(sourcePath);
  files.forEach(file => {
    const curPath = path.join(sourcePath, file);
    const stat = fs.statSync(curPath);
    
    if (stat.isDirectory()) {
      copyImages(curPath, targetPath);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (ALLOWED_EXTENSIONS.images.includes(ext)) {
        const targetFile = path.join(targetPath, file);
        fs.copyFileSync(curPath, targetFile);
      }
    }
  });
}

async function compile() {
  const publicDir = path.join(__dirname, 'public');
  
  try {
    // Создаем папку public если её нет
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }
    
    // Очищаем содержимое папки public
    await removeDirectoryContentsWithRetry(publicDir);

    // Создаем папку для изображений
    const imgDir = path.join(publicDir, 'img');
    if (!fs.existsSync(imgDir)) {
      fs.mkdirSync(imgDir);
    }

    // Копируем изображения из всех языковых директорий
    for (const lang of Object.values(posts_source)) {
      lang.forEach(({path: yearDir}) => {
        const yearPath = path.join('..', yearDir);
        copyImages(yearPath, imgDir);
      });
    }

    const engPosts = processLanguagePosts(posts_source.eng);
    const ukrPosts = processLanguagePosts(posts_source.ukr);

    // Читаем Tools.md и README
    const tools = fs.existsSync('../Tools.md') 
      ? mdToHtml(fs.readFileSync('../Tools.md', 'utf8'))
      : '';
    const about = mdToHtml(fs.readFileSync('../README.md', 'utf8'));

    // Функция для генерации меню
    function generateMenu(activeMenu) {
      const prefix = activeMenu === 'index' ? '' : '../';
      return `
    <div class="nav">
      <div class="site-title">Code With LLM</div>
      <div class="menu">
        ${menuItems.map(item => 
          `<a href="${prefix}${item.href}" ${activeMenu === item.id ? 'class="active"' : ''}>${item.text}</a>`
        ).join('\n        ')}
      </div>
      <a href="https://github.com/danvoronov/CodeWithLLM-Updates" class="github-stars" target="_blank">
        <svg height="16" viewBox="0 0 16 16" width="16">
          <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        <span>CodeWithLLM-Updates</span>
        <div class="divider"></div>
        <svg aria-hidden="true" viewBox="0 0 16 16">
          <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
        </svg>
        <span id="github-star-count">-</span>
      </a>
    </div>
    <script>
      fetch('https://api.github.com/repos/danvoronov/CodeWithLLM-Updates')
        .then(response => response.json())
        .then(data => {
          document.getElementById('github-star-count').textContent = data.stargazers_count;
        })
        .catch(console.error);
    </script>`;
    }

    // Функция для создания HTML страницы
    function createPage(title, content, activeMenu) {
      return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>${commonStyles}</style>
  </head>
  <body>
    <div class="wrapper">
      ${generateMenu(activeMenu)}
      ${content}
    </div>
  </body>
  </html>`;
    }

    // Создаем контент для страниц с постами
    function createBlogContent(posts, language = 'en') {
      const initialPosts = savePostsToJson(posts, language);

      return `
    <div class="container">
      <div class="sidebar">
        <h3>${localization.sidebarTitle[language]}</h3>
        <div id="recent-posts"></div>
      </div>
      <div id="posts"></div>
      <div id="loading" style="display: none; text-align: center; padding: 20px;">
        ${localization.loading}
      </div>
    </div>
    <script>
      let posts = ${JSON.stringify(initialPosts)};
      let visiblePosts = ${postsConfig.visiblePostsInitial};
      let activePostDate = null;
      let currentChunk = 1;
      let isLoading = false;
      let meta = null;
      let allPostsLoaded = false;

      function showError(message) {
        const loading = document.getElementById('loading');
        loading.style.display = 'block';
        loading.innerHTML = \`❌ \${message}\`;
        setTimeout(() => {
          loading.style.display = 'none';
        }, 3000);
      }

      async function loadMeta() {
        try {
          const response = await fetch(\`data/${language}_meta.json\`);
          if (!response.ok) throw new Error('${localization.errors.metaLoad}');
          meta = await response.json();
          console.log('Загружены мета-данные:', meta);
        } catch (error) {
          console.error('Ошибка загрузки мета-данных:', error);
          showError('${localization.errors.metaLoad}');
        }
      }

      async function loadMorePosts() {
        if (isLoading || allPostsLoaded) return;
        
        try {
          isLoading = true;
          document.getElementById('loading').style.display = 'block';

          if (visiblePosts < posts.length) {
            visiblePosts += ${postsConfig.visiblePostsInitial};
            renderPosts();
            return;
          }

          if (meta && currentChunk < meta.chunks) {
            const nextChunk = currentChunk + 1;
            console.log('Загрузка чанка:', nextChunk);
            
            const response = await fetch(\`data/${language}_posts_\${nextChunk}.json\`);
            if (!response.ok) throw new Error(\`${localization.errors.chunkLoad} \${nextChunk}\`);
            
            const newPosts = await response.json();
            posts = [...posts, ...newPosts];
            currentChunk = nextChunk;
            visiblePosts += ${postsConfig.visiblePostsInitial};
            
            renderPosts();
            console.log('Загружен чанк:', nextChunk, 'Всего постов:', posts.length);
          } else {
            allPostsLoaded = true;
            showError('${localization.errors.allLoaded}');
          }
        } catch (error) {
          console.error('Ошибка загрузки постов:', error);
          showError(error.message);
        } finally {
          isLoading = false;
          document.getElementById('loading').style.display = 'none';
        }
      }

      function updateActivePost() {
        const posts = document.querySelectorAll('.post');
        const recentPosts = document.querySelectorAll('.recent-post');
        let bestPost = null;
        let bestVisibility = 0;
        
        posts.forEach(post => {
          const rect = post.getBoundingClientRect();
          const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
          const visibility = visibleHeight / post.offsetHeight;
          
          if (visibility > bestVisibility) {
            bestVisibility = visibility;
            bestPost = post;
          }
        });

        if (bestPost) {
          const date = bestPost.getAttribute('data-date');
          if (activePostDate !== date) {
            activePostDate = date;
            recentPosts.forEach(recentPost => {
              recentPost.classList.toggle('active', recentPost.getAttribute('data-date') === date);
            });
          }
        }
      }

      function scrollToPost(date) {
        const targetPost = document.querySelector(\`[data-date="\${date}"]\`);
        if (targetPost) {
          targetPost.scrollIntoView({ behavior: 'smooth' });
        }
      }

      function renderRecentPosts() {
        const recentPosts = posts.slice(0, ${postsConfig.recentPostsCount});
        document.getElementById('recent-posts').innerHTML = recentPosts
          .map(post => \`
            <div class="recent-post" data-date="\${post.date}" onclick="scrollToPost('\${post.date}')">
              <div class="recent-post-title">\${post.title}</div>
            </div>
          \`)
          .join('');
      }

      function renderPosts() {
        const postsContainer = document.getElementById('posts');
        const visiblePostsData = posts.slice(0, Math.min(visiblePosts, posts.length));
        
        postsContainer.innerHTML = visiblePostsData
          .map(post => \`
            <div class="post" data-date="\${post.date}">
              <h2>\${post.title}</h2>
              \${post.content}
            </div>
          \`)
          .join('');
        
        updateActivePost();
      }

      // Оптимизированный обработчик прокрутки
      let scrollTimeout;
      window.onscroll = () => {
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
        
        scrollTimeout = setTimeout(() => {
          const scrollPosition = window.innerHeight + window.scrollY;
          const totalHeight = document.body.offsetHeight;
          const threshold = totalHeight - 1000;

          if (scrollPosition >= threshold && !isLoading) {
            loadMorePosts();
          }
          updateActivePost();
        }, 100);
      };

      // Инициализация с обработкой ошибок
      async function init() {
        try {
          await loadMeta();
          renderPosts();
          renderRecentPosts();
        } catch (error) {
          console.error('Ошибка инициализации:', error);
          showError('Ошибка инициализации');
        }
      }

      init();
    </script>
    <style>
      .recent-post {
        padding: 10px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .recent-post:hover {
        background-color: #f0f8ff;
      }
      .recent-post.active {
        background-color: #f0f8ff;
        border-left: 3px solid #007bff;
        padding-left: 7px;
      }
      .recent-post:last-child {
        border-bottom: none;
      }
      .recent-post-title {
        font-weight: 500;
        margin-bottom: 4px;
      }
      .recent-post-date {
        font-size: 0.9em;
        color: #666;
      }
    </style>`;
    }

    // Создаем контент для простых страниц
    function createSimpleContent(content) {
      return `
    <div class="container" style="grid-template-columns: 1fr">
      <div class="post">
        ${content}
      </div>
    </div>`;
    }

    // Создаем необходимые директории
    const dirs = ['ua', 'tools', 'about'].map(dir => path.join(publicDir, dir));
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Сохраняем все страницы
    fs.writeFileSync(
      path.join(publicDir, 'index.html'), 
      createPage('Updates - CodeWithLLM', createBlogContent(engPosts, 'en'), 'index')
    );
    
    fs.writeFileSync(
      path.join(publicDir, 'ua/index.html'), 
      createPage('Як краще створювати код за допомогою LLM', createBlogContent(ukrPosts, 'uk'), 'ukr')
    );
    
    fs.writeFileSync(
      path.join(publicDir, 'tools/index.html'), 
      createPage('Tools - CodeWithLLM', createSimpleContent(tools), 'tools')
    );
    
    fs.writeFileSync(
      path.join(publicDir, 'about/index.html'), 
      createPage('About - CodeWithLLM', createSimpleContent(about), 'about')
    );
  } catch (error) {
    console.error('Ошибка при компиляции:', error);
    process.exit(1);
  }
}

// Запускаем компиляцию
compile().catch(error => {
  console.error('Критическая ошибка:', error);
  process.exit(1);
});