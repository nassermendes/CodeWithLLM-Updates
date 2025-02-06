const fs = require('fs');
const path = require('path');
const mdToHtml = require('./md2html');
const { commonStyles } = require('./styles');
const { posts_source, siteUrl, ALLOWED_EXTENSIONS, menuItems, postsConfig } = require('./config');

const publicDir = path.join(__dirname, 'public');

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
          await removeDirectoryContentsWithRetry(curPath, maxAttempts);
          fs.rmdirSync(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
        break; 
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

function isAllowedFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return Object.values(ALLOWED_EXTENSIONS).flat().includes(ext);
}

function cleanUrl(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function processLinks(content) {
  
  content = content.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (match, text, url) => {
    if (text === url || text === cleanUrl(url)) {
      
      return `<a href="${url}">${cleanUrl(url)}</a>`;
    }

    return `<a href="${url}">${text}</a>`;
  });

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

  const match = filename.match(/(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})(?:-(\d{2}))?.md/);
  if (match) {
    const [_, fileYear, fileMonth, day, hour, minute, second = '00'] = match;
    return `${fileYear}-${fileMonth}-${day}T${hour}:${minute}:${second}`;
  }
  
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

function groupPostsByYearAndMonth(posts) {
  const grouped = {};
  posts.forEach(post => {
    const date = new Date(post.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${month}`;
    
    if (!grouped[year]) {
      grouped[year] = {};
    }
    if (!grouped[year][month]) {
      grouped[year][month] = [];
    }
    grouped[year][month].push(post);
  });
  return grouped;
}

function getMonthTitle(params, language) {
  const { year, month } = params;
  const monthName = postsConfig.monthNames[language === 'uk' ? 'uk' : 'en'][month - 1];
  return `${monthName} ${year}`;
}

function createMonthArchivePage(posts, month, year, language, monthsData, currentMonth, allPosts) {
  const title = `${getMonthTitle({year: parseInt(year), month: parseInt(month)}, language)} - Code With LLM`;
  return createPage(title, `
    <div class="container" style="grid-template-columns: 1fr">
      ${createArchiveNavigation(monthsData, currentMonth, language)}
      ${posts.map(post => `
        <div class="post-wrapper">
          <div class="post" data-title="${post.title}" data-date="${post.date}">
            ${post.content}
          </div>
        </div>
      `).join('\n')}
      ${createArchiveNavigation(monthsData, currentMonth, language)}
    </div>
  `, language === 'uk' ? 'ukr' : 'index', allPosts, currentMonth);
}

function createArchiveNavigation(monthsData, currentMonth, language) {

  const allMonths = [];
  Object.entries(monthsData).forEach(([year, months]) => {
    Object.keys(months).forEach(month => {
      allMonths.push({
        year: parseInt(year),
        month: parseInt(month),
        key: `${year}-${month}`
      });
    });
  });


  allMonths.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  const [currentYear, currentMonthStr] = currentMonth.split('-');
  const currentIndex = allMonths.findIndex(m => 
    m.year === parseInt(currentYear) && 
    m.month === parseInt(currentMonthStr)
  );

  if (currentIndex === -1) return '';

  const prevMonth = currentIndex < allMonths.length - 1 ? allMonths[currentIndex + 1] : null;
  const nextMonth = currentIndex > 0 ? allMonths[currentIndex - 1] : null;

  const getMonthTitle = (item) => {
    const monthName = postsConfig.monthNames[language === 'uk' ? 'uk' : 'en'][item.month - 1];
    return `${monthName} ${item.year}`;
  };

  const basePath = language === 'uk' ? '/ua/' : '/';

  return `
    <div class="archive-nav">
      <div class="nav-prev">
        ${prevMonth ? 
          `<a href="${basePath}${prevMonth.key}/" class="prev" title="${getMonthTitle(prevMonth)}">
            ← ${language === 'uk' ? 'Попередній' : 'Previous'}
          </a>` : 
          ''
        }
      </div>
      <div class="nav-current">
        <h1>${getMonthTitle({year: parseInt(currentYear), month: parseInt(currentMonthStr)})}</h1>
      </div>
      <div class="nav-next">
        ${nextMonth ? 
          `<a href="${basePath}${nextMonth.key}/" class="next" title="${getMonthTitle(nextMonth)}">
            ${language === 'uk' ? 'Наступний' : 'Next'} →
          </a>` : 
          ''
        }
      </div>
    </div>
  `;
}

function getMonthName(month, language) {
  const monthIndex = parseInt(month) - 1;
  return postsConfig.monthNames[language === 'uk' ? 'uk' : 'en'][monthIndex];
}

function createBlogContent(posts, language = 'en') {
  const recentPosts = posts.slice(0, 12);
  
  return `
    <div class="container" style="grid-template-columns: 1fr">
      <div class="posts">
        ${recentPosts.map(post => `
          <div class="post-wrapper">
            <div class="post" data-title="${post.title}" data-date="${post.date}">
              ${post.content}
            </div>
          </div>
        `).join('\n')}
      </div>
    </div>
  `;
}

function generateArchiveMenu(posts, language, currentMonth = '') {
  const groupedByYear = groupPostsByYearAndMonth(posts);
  const years = Object.keys(groupedByYear).sort().reverse();
  const basePath = language === 'uk' ? '/ua/' : '/';

  return `
    <div class="menu-archive">
      ${years.map(year => `
        <div class="menu-archive-year">
          <h4>${year}</h4>
          <div class="menu-archive-months">
            ${Object.keys(groupedByYear[year])
              .sort().reverse()
              .map(month => {
                const monthKey = `${year}-${month}`;
                const isActive = monthKey === currentMonth;
                return `
                  <a href="${basePath}${monthKey}/" 
                     class="menu-archive-month${isActive ? ' active' : ''}" 
                     title="${getMonthName(month, language)}">
                    ${month}
                  </a>
                `;
              }).join('')}
          </div>

        </div>
      `).join('\n')}
    </div>
  `;
}

function generateMenu(activeMenu, posts = [], currentMonth = '') {

  const activeItem = menuItems.find(item => item.id === activeMenu) || menuItems[0];
  const language = activeItem.lang || 'en';


  return `
    <div class="nav">
      <button class="burger-menu" aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div class="site-title">
        <a href="/">Code With LLM</a>
      </div>
      <div class="menu">
        ${menuItems.map(item => {
          const isActive = activeMenu === item.id;
          const itemHtml = `
            <a href="${item.path}" 
               class="${isActive ? 'active' : ''}">
              ${item.text}
            </a>
          `;

          if (isActive && item.showArchive && posts.length > 0) {
            return itemHtml + generateArchiveMenu(posts, language, currentMonth);
          }
          return itemHtml;
        }).join('\n')}
      </div>
      <div class="copyright">© Dan Voronov</div>
    </div>
    <div>    
      <a href="https://github.com/danvoronov/CodeWithLLM-Updates" 
         class="github-stars" 
         target="_blank">
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

      // Мобильное меню
      document.addEventListener('DOMContentLoaded', function() {
        const burger = document.querySelector('.burger-menu');
        const nav = document.querySelector('.nav');
        const body = document.body;
        
        burger.addEventListener('click', function() {
          nav.classList.toggle('nav-open');
          burger.classList.toggle('open');
          body.classList.toggle('menu-open');
        });
      });
    </script>`;
}

function createPage(title, content, activeMenu, posts = [], currentMonth = '') {
  const description = activeMenu === 'index' ? 
    'Updates and tips about using Large Language Models (LLM) for programming and development' :
    activeMenu === 'ukr' ?
    'Поради та оновлення щодо використання великих мовних моделей (LLM) для програмування' :
    'CodeWithLLM - Learn how to better create code using AI and LLM';

  return `
  <!DOCTYPE html>
<html lang="${activeMenu === 'ukr' ? 'uk' : 'en'}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${description}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${siteUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${siteUrl}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">

    <title>${title}</title>
    <style>${commonStyles}</style>
  
    <!-- Добавляем favicon -->
    <link rel="icon" type="image/png" href="/img/favicon.png">
  </head>
  <body>
    <div class="wrapper">
    ${generateMenu(activeMenu, posts, currentMonth)}
      ${content}
    </div>
  </body>
  </html>`;
}


function createSimpleContent(content) {
  return `
    <div class="container" style="grid-template-columns: 1fr">
      <div class="post-wrapper">
        <div class="post">
          ${content}
        </div>
      </div>
    </div>`;
}

async function compile() {
  try {

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }
    

    await removeDirectoryContentsWithRetry(publicDir);


    const imgDir = path.join(publicDir, 'img');
    if (!fs.existsSync(imgDir)) {
      fs.mkdirSync(imgDir);
    }

    const faviconPngPath = path.join('.', 'favicon', 'favicon.png');
    const faviconIcoPath = path.join('.', 'favicon', 'favicon.ico');
    
    if (fs.existsSync(faviconPngPath)) {
      fs.copyFileSync(faviconPngPath, path.join(imgDir, 'favicon.png'));
    } else {
      console.warn('⚠️ favicon.png не найден в папке favicon');
    }

    if (fs.existsSync(faviconIcoPath)) {
      fs.copyFileSync(faviconIcoPath, path.join(imgDir, 'favicon.ico')); 
    } else {
      console.warn('⚠️ favicon.ico не найден в папке favicon');
    }

    for (const lang of Object.values(posts_source)) {
      lang.forEach(({path: yearDir}) => {
        const yearPath = path.join('..', yearDir);
        copyImages(yearPath, imgDir);
      });
    }

    const engPosts = processLanguagePosts(posts_source.eng);
    const ukrPosts = processLanguagePosts(posts_source.ukr);

    const engGrouped = groupPostsByYearAndMonth(engPosts);
    Object.entries(engGrouped).forEach(([year, months]) => {
      // Проверяем, что год существует в конфигурации
      if (posts_source.eng.some(y => y.year === parseInt(year))) {
        Object.entries(months).forEach(([month, posts]) => {
          if (posts.length > 0) {
            const monthKey = `${year}-${month}`;
            const monthDir = path.join(publicDir, monthKey);
            
            if (!fs.existsSync(monthDir)) {
              fs.mkdirSync(monthDir, { recursive: true });
            }

            fs.writeFileSync(
              path.join(monthDir, 'index.html'),
              createMonthArchivePage(
                posts,
                parseInt(month),
                parseInt(year),
                'en',
                engGrouped,
                monthKey,
                engPosts
              )
            );
          }
        });
      }
    });

    // Создаем архивные страницы для украинской версии
    const ukrGrouped = groupPostsByYearAndMonth(ukrPosts);
    Object.entries(ukrGrouped).forEach(([year, months]) => {
      // Проверяем, что год существует в конфигурации
      if (posts_source.ukr.some(y => y.year === parseInt(year))) {
        Object.entries(months).forEach(([month, posts]) => {
          if (posts.length > 0) {
            const monthKey = `${year}-${month}`;
            const monthDir = path.join(publicDir, 'ua', monthKey);
            
            if (!fs.existsSync(monthDir)) {
              fs.mkdirSync(monthDir, { recursive: true });
            }

            fs.writeFileSync(
              path.join(monthDir, 'index.html'),
              createMonthArchivePage(
                posts,
                parseInt(month),
                parseInt(year),
                'uk',
                ukrGrouped,
                monthKey,
                ukrPosts
              )
            );
          }
        });
      }
    });

    // Читаем Tools.md и README
    const tools = fs.existsSync('../Tools.md') 
      ? mdToHtml(fs.readFileSync('../Tools.md', 'utf8'))
      : '';
    const about = mdToHtml(fs.readFileSync('../README.md', 'utf8'));

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
      createPage('Updates - CodeWithLLM', createBlogContent(engPosts, 'en'), 'index', engPosts)
    );
    
    fs.writeFileSync(
      path.join(publicDir, 'ua/index.html'), 
      createPage('Як краще створювати код за допомогою LLM', createBlogContent(ukrPosts, 'uk'), 'ukr', ukrPosts)
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