// Общие стили для всего сайта
const commonStyles = `
  body { 
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #ff8c42, #ff5f6d, #ff4088);
    min-height: 100vh;
    color: #333;
  }
  .wrapper {
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
    padding: 60px 20px 20px;
    box-sizing: border-box;
  }
  .container {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    gap: 2rem;
    width: 100%;
    box-sizing: border-box;
    padding-top: 1rem;
  }
  .post {
    background: rgba(255, 255, 255, 0.98);
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    max-width: 100%;
    backdrop-filter: blur(10px);
  }
  .post img {
    max-width: 100%;
    height: auto;
  }
  .post pre {
    max-width: 100%;
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  .post code {
    max-width: 100%;
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  .sidebar {
    position: sticky;
    top: 20px;
    background: rgba(255, 255, 255, 0.98);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    height: fit-content;
    backdrop-filter: blur(10px);
  }
  .nav {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 1200px;
    z-index: 1000;
    margin-bottom: 0;
    text-align: center;
    background: rgba(33, 33, 33, 0.95);
    padding: 15px 20px;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    backdrop-filter: blur(10px);
    box-sizing: border-box;
  }
  .nav .site-title {
    font-weight: bold;
    font-size: 1.2em;
    margin-left: 15px;
    color: white;
  }
  .nav .menu {
    display: flex;
    gap: 15px;
    margin-right: 15px;
  }
  .nav a {
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    padding: 6px 12px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }
  .nav a:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
  .nav a.active {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
  }
  .github-stars {
    margin-left: 15px;
    margin-right: 15px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: white;
    text-decoration: none;
    padding: 5px 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    font-size: 0.9em;
    transition: 0.2s ease;
    background-color: rgba(255, 255, 255, 0.1);
  }
  .github-stars:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }
  .github-stars svg {
    fill: white;
    width: 16px;
    height: 16px;
  }
  .github-stars .divider {
    width: 1px;
    height: 14px;
    background-color: rgba(255, 255, 255, 0.2);
    margin: 0 8px;
  }
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
  @media (max-width: 768px) {
    .container {
      grid-template-columns: 1fr;
    }
    .sidebar {
      position: static;
      margin-bottom: 20px;
    }
  }
`;

module.exports = { commonStyles }; 