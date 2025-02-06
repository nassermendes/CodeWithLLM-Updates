const marked = require('marked');
marked.use({ breaks: true, gfm: true }); // Поддержка переносов строк

marked.use({
  renderer: {
    image(href, title, text) {
      const url = (href?.href || href)?.trim() || '';
      
      // Обработка YouTube
      if (url.includes('youtube.com')) {
        const videoId = url.match(/\/(vi?|embed)\/([^\/]+)/i)?.[2] || 
                       url.match(/(?:v=|\/v\/|^\/|embed\/)([^&\?\/]+)/i)?.[1];
        if (videoId) {
          return `
            <div class="youtube-wrapper">
              <iframe 
                width="100%" 
                height="400" 
                src="https://www.youtube-nocookie.com/embed/${videoId}" 
                frameborder="0" 
                allowfullscreen>
              </iframe>
            </div>
          `;
        }
      }
      
      // Обработка остальных изображений
      const isExternal = /^(https?:|\.\.?\/|\/)/.test(url);
      if (!isExternal) {
        return `<img src="/img/${url}"${text ? ` alt="${text}"` : ''}${title ? ` title="${title}"` : ''} />`;
      }
    }
  }
});


/**
 * Конвертирует Markdown в HTML
 * @param {string} markdown - исходная строка с Markdown-разметкой
 * @returns {string} - результат в виде HTML
 */
function markdownToHtml(markdown) {
  
  return marked.parse(markdown.replace(/<!--[\s\S]*?-->/g, ''));
}

module.exports = markdownToHtml;
