// Общие стили для всего сайта
const commonStyles = `
  body { 
    font-family: BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    margin: 0;
    padding: 0;

    background: #FFBF56;
    background: radial-gradient(at right bottom, #FFBF56, #D27546);
 
    min-height: 100vh;
    color: #333;
  }

  @keyframes gradientAnimation {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  .wrapper {
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
    padding: 60px 20px 20px;
    box-sizing: border-box;
    margin-left: 200px;
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
    padding: 20px 40px 20px 60px;
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    max-width: 100%;
    backdrop-filter: blur(10px);
    position: relative;
  }
  .post::before {
    content: attr(data-title);
    position: absolute;
    left: 0;
    top: 0;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    background: #333;
    color: white;
    margin: 0;
    padding: 15px 5px;
    height: 120px;
    font-size: 0.8em;
    justify-content: center;
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
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    height: fit-content;
    backdrop-filter: blur(10px);
  }
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 190px;
    height: 100vh;
    z-index: 1000;
    background: #333333;
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    box-shadow: 2px 0 8px rgba(0,0,0,0.2);
  }
  .nav .site-title {
    font-weight: bold;
    font-size: 1.2em;
    margin: 10px 0;
    color: #ff8c42;
    white-space: nowrap;
    padding: 0 10px;
  }
  .nav .menu {
    display: flex;
    flex-direction: column;
    gap: 25px;
    margin-top: 30px;
    width: 100%;
    align-items: center;
  }
  .nav a {
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    padding: 6px 12px;
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
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: white;
    text-decoration: none;
    padding: 8px 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 0.9em;
    transition: 0.2s ease;
    background-color: rgba(51, 51, 51, 0.9);
    backdrop-filter: blur(10px);
    z-index: 1001;
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