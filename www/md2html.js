const marked = require('marked');

const youtubeExtension = {
  renderer: {
    image(href) {
      const url = href.href || href;
      if (typeof url !== 'string' || !url.includes('youtube.com')) return false;
      
      const videoId = url.match(/\/(vi?|embed)\/([^\/]+)/i)?.[2] || 
                     url.match(/(?:v=|\/v\/|^\/|embed\/)([^&\?\/]+)/i)?.[1];
      return videoId ? `
        <div class="youtube-wrapper">
          <iframe 
            width="100%" 
            height="400" 
            src="https://www.youtube-nocookie.com/embed/${videoId}" 
            frameborder="0" 
            allowfullscreen>
          </iframe>
        </div>
      ` : false;
    }
  }
};


/**
 * Конвертирует Markdown в HTML
 * @param {string} markdown - исходная строка с Markdown-разметкой
 * @returns {string} - результат в виде HTML
 */
function markdownToHtml(markdown) {
  // Удаляем HTML-комментарии
  markdown = markdown.replace(/<!--[\s\S]*?-->/g, '');
  
  marked.use(youtubeExtension);
  marked.use({ breaks: true, gfm: true }); // Поддержка переносов строк
  
  return marked.parse(markdown);
}

module.exports = markdownToHtml;
