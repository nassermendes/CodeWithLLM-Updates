const marked = require('marked');
const { ALLOWED_EXTENSIONS } = require('../config');
marked.use({ breaks: true, gfm: true });

marked.use({
  renderer: {
    link(token) {
      const url = (token.href?.trim() || '');
      const ext = url.split('.').pop()?.toLowerCase();
      
      if (ALLOWED_EXTENSIONS.audio.includes(`.${ext}`)) {
        return `
          <audio controls>
            <source src="/audio/${url}" type="audio/${ext}">
            ${token.text} (аудио не поддерживается вашим браузером)
          </audio>
        `;
      }
      
      return `<a target="_blank" href="${url}"${token.title ? ` title="${token.title}"` : ''}>${token.text}</a>`;
    },
    
    image(href, title, text) {
      const url = (href?.href || href)?.trim() || '';
      
      if (url.includes('youtube.com')) {
        const videoId = url.match(/\/(vi?|embed)\/([^\/]+)/i)?.[2] || 
                       url.match(/(?:v=|\/v\/|^\/|embed\/)([^&\?\/]+)/i)?.[1];
        if (videoId) {
          return `
            <lite-youtube videoid="${videoId}" playlabel="Play Video"></lite-youtube>
          `;
        }
      }
      
      const isExternal = /^(https?:|\.\.?\/|\/)/.test(url);
      if (isExternal) {
        return `<img src="${url}"${text ? ` alt="${text}"` : ''}${title ? ` title="${title}"` : ''} />`;
      }
      return `<img src="/img/${url}"${text ? ` alt="${text}"` : ''}${title ? ` title="${title}"` : ''} />`;
    },
  }
});

function mdToHtml(content) {
  // Заменяем теги на красивые спаны перед обработкой markdown
  content = content.replace(/#([a-zA-Zа-яА-ЯёЁіІїЇєЄ]+)/g, '<span class="post-tag">#$1</span>');
  
  return marked.parse(content.replace(/<!--[\s\S]*?-->/g, ''));
}

module.exports = mdToHtml;
