const marked = require('marked');
marked.use({ breaks: true, gfm: true });

marked.use({
  renderer: {
    image(href, title, text) {
      const url = (href?.href || href)?.trim() || '';
      
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
      
      const isExternal = /^(https?:|\.\.?\/|\/)/.test(url);
      if (isExternal) {
        return `<img src="${url}"${text ? ` alt="${text}"` : ''}${title ? ` title="${title}"` : ''} />`;
      }
      return `<img src="/img/${url}"${text ? ` alt="${text}"` : ''}${title ? ` title="${title}"` : ''} />`;
    },
    // link(href, title, text) {
    //   if (text) {
    //     return text.startsWith('<img') ? 
    //     `<a href="${href}"${title ? ` title="${title}"` : ''}>${text}</a>` :    
    //    `<a href="${href}"${title ? ` title="${title}"` : ''}>${text}</a>`;
    // }
  }
});

function markdownToHtml(markdown) {
  return marked.parse(markdown.replace(/<!--[\s\S]*?-->/g, ''));
}

module.exports = markdownToHtml;
