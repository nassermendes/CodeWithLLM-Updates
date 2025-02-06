/**
 * Основная функция для конвертации Markdown в HTML
 * @param {string} markdown - исходная строка с Markdown-разметкой
 * @returns {string} - результат в виде HTML
 */
function markdownToHtml(markdown) {

if (markdown.trim().startsWith('<!--') && markdown.includes('-->')) {
    const endIndex = markdown.indexOf('-->');
    markdown = markdown.slice(endIndex + 3);
    }

  const lines = markdown.split(/\r?\n/);
  const htmlLines = [];
  
  // Основной цикл обработки строк
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Пропускаем пустые строки (будем добавлять <br> там, где уместно)
    if (!line.trim()) {
      htmlLines.push('');
      continue;
    }

    // Обработка альтернативных заголовков (h1 и h2) в одном блоке
    if (i + 1 < lines.length && (/^=+$/.test(lines[i+1]) || /^-+$/.test(lines[i+1]))) {
      const tag = /^=+$/.test(lines[i+1]) ? 'h1' : 'h2';
      htmlLines.push(`<${tag}>${processInline(lines[i])}</${tag}>`);
      i++;
      continue;
    }
    
    // Добавляем обработку горизонтальных линий
    if (/^[-*_]{3,}$/.test(line)) {
      htmlLines.push('<hr>');
      continue;
    }

    // --- Обработка YouTube блока ---
    if (isYoutubeLink(line)) {
      const videoUrl = extractUrlFromLink(line);
      const videoId = videoUrl ? extractYoutubeId(videoUrl) : null;
      
      if (!videoId) continue;
      
      // Ищем превью в следующих строках, пропуская пустые
      let previewFound = false;
      let j = i + 1;
      while (j < lines.length && (!lines[j].trim() || isYoutubeImage(lines[j]))) {
        if (isYoutubeImage(lines[j])) {
          previewFound = true;
          break;
        }
        j++;
      }
      
      if (previewFound) {
        htmlLines.push(
          `<div style="text-align: center; margin: 20px 0;">` +
          `<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/${videoId}" ` +
          `title="YouTube video" frameborder="0" ` +
          `allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" ` +
          `allowfullscreen></iframe>` +
          `</div>`
        );
        i = j; // Пропускаем все строки до превью включительно
        continue;
      }
    }
    
    // --- Обработка таблиц ---
    if (isTableRow(line)) {
      // Собираем все последовательные строки таблицы
      const tableLines = [];
      while (i < lines.length && isTableRow(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      i--; // откатываем индекс, так как внешний цикл тоже увеличит i
      htmlLines.push(parseTableBlock(tableLines));
      continue;
    }

    // --- Обработка списков ---
    const listMatch = line.match(/^(\s*)([*\-+]|\d+\.)\s+/);
    if (listMatch) {
      const listType = listMatch[2] === '1.' ? 'ol' : 'ul';
      let listItems = [];
      
      // Собираем все элементы списка
      while (i < lines.length && lines[i].match(/^(\s*)([*\-+]|\d+\.)\s+/)) {
        const itemContent = lines[i].replace(/^(\s*)([*\-+]|\d+\.)\s+/, '');
        listItems.push(`<li>${processInline(itemContent)}</li>`);
        i++;
      }
      i--; // Возвращаемся на последнюю обработанную строку
      
      htmlLines.push(`<${listType}>${listItems.join('')}</${listType}>`);
      continue;
    }

    // --- Обработка заголовков ---
    if (/^#{1,6}\s/.test(line)) {
      const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const content = processInline(headerMatch[2]);
        htmlLines.push(`<h${level}>${content}</h${level}>`);
        continue;
      }
    }

    // --- Обработка обычного параграфа ---
    // Если строка начинается с markdown-ссылкой, изображением или содержит форматирование,
    // обрабатываем inline-разметку
    htmlLines.push(`<p>${processInline(line)}</p>`);
  }
  
  return htmlLines.join('\n');
}

/**
 * Обработка inline Markdown (жирный, курсив, ссылки, изображения, «сырые» ссылки)
 * @param {string} text
 * @returns {string}
 */
function processInline(text) {
  // Экранируем HTML-спецсимволы (это базовый уровень защиты)
  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Добавляем зачеркивание и альтернативные синтаксисы
  text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');
  text = text.replace(/(`{3})([\s\S]*?)\1/g, '<pre><code>$2</code></pre>');
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Обработка жирного текста: **text**
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Обработка курсива: *text* или _text_
  text = text.replace(/(\*|_)(.+?)\1/g, '<em>$2</em>');

  // Обработка изображений: ![alt](url)
  text = text.replace(/!\[([^\]]*?)\]\((https?:\/\/[^\s)]+)\)/g, '<img src="$2" alt="$1" />');

  // Обработка ссылок: [text](url)
  text = text.replace(/\[([^\]]+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');

  // Обработка «сырых» ссылок, которые не были обёрнуты в разметку:
  // Если встречается http(s)://... и оно не внутри уже созданного тэга, оборачиваем его
  text = text.replace(/(^|\s)(https?:\/\/[^\s<]+)/g, '$1<a href="$2">$2</a>');

  return text;
}

/**
 * Проверяет, является ли строка строкой таблицы (начинается с | или содержит разделители)
 * @param {string} line 
 * @returns {boolean}
 */
function isTableRow(line) {
  return /^\s*\|/.test(line) || /\|/.test(line);
}

/**
 * Обработка блока таблицы
 * @param {string[]} tableLines - массив строк таблицы
 * @returns {string} - HTML таблица
 */
function parseTableBlock(tableLines) {
  const rows = tableLines.map(line => {
    return line.trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map(cell => {
        // Обрабатываем HTML-сущности и переносы
        const cellContent = cell.trim()
          .replace(/&lt;/g, '<').replace(/&gt;/g, '>') // Декодируем HTML
          .split(/\n|<br>|&lt;br&gt;/)
          .map(line => processInline(line.trim()))
          .filter(line => line)
          .join('<br>');
        return cellContent;
      });
  });

  let html = '<table>\n';
  
  // Если вторая строка состоит из дефисов, считаем первую строку заголовком
  if (rows.length > 1 && rows[1].every(cell => /^-+$/.test(cell))) {
    html += '  <thead>\n    <tr>\n';
    rows[0].forEach(cell => {
      html += `      <th>${cell}</th>\n`;
    });
    html += '    </tr>\n  </thead>\n';
    rows.splice(0, 2); // Удаляем заголовок и разделитель
  }

  html += '  <tbody>\n';
  rows.forEach(row => {
    html += '    <tr>\n';
    row.forEach(cell => {
      html += `      <td>${cell}</td>\n`;
    });
    html += '    </tr>\n';
  });
  html += '  </tbody>\n</table>';
  
  return html;
}

/**
 * Проверяет, является ли строка markdown-ссылкой на YouTube видео
 * @param {string} line 
 * @returns {boolean}
 */
function isYoutubeLink(line) {
  const ytLinkRegex = /^\[(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^\]]+)\]\((https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^)]+)\)$/;
  return ytLinkRegex.test(line.trim());
}

/**
 * Извлекает URL из markdown-ссылки
 * @param {string} line 
 * @returns {string|null}
 */
function extractUrlFromLink(line) {
  const match = line.trim().match(/^\[([^\]]+?)\]\((https?:\/\/[^\s)]+)\)$/);
  return match ? match[1] : null; // Возвращаем URL из текста ссылки, а не из href
}

/**
 * Извлекает ID видео из YouTube URL
 * @param {string} url 
 * @returns {string|null}
 */
function extractYoutubeId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})(?:&|$|[?]si=)/);
  return match ? match[1] : null;
}

/**
 * Проверяет, является ли строка markdown-изображением превью YouTube
 * Ожидаемый формат: ![YouTube Preview](https://img.youtube.com/vi/...)
 * @param {string} line 
 * @returns {boolean}
 */
function isYoutubeImage(line) {
  const ytImgRegex = /^!\[YouTube Preview\]\(https?:\/\/img\.youtube\.com\/vi\/[^\s)]+\)/;
  return ytImgRegex.test(line.trim());
}

/**
 * Извлекает URL изображения из markdown-разметки изображения
 * @param {string} line 
 * @returns {string|null}
 */
function extractUrlFromImage(line) {
  const match = line.trim().match(/^!\[[^\]]*?\]\((https?:\/\/[^\s)]+)\)/);
  return match ? match[1] : null;
}

module.exports = markdownToHtml;
