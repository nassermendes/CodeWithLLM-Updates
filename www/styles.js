const commonStyles = `
  body { 
    font-family: BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    margin: 0;
    padding: 0;

    background: #FFBF56;
    background: radial-gradient(at right bottom, #FFBF56, #D27546);
 
    min-height: 100vh;
    color: #333;
    transition: margin-left 0.3s ease;
  }

  body.menu-open {
    overflow: hidden;
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
    transition: margin-left 0.3s ease;
  }
  .container {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    gap: 2rem;
    width: 100%;
    box-sizing: border-box;
    padding: 1rem;
  }
  .post-wrapper {
    position: relative;
    padding: 4px;
    margin-bottom: 20px;
    border-radius: 0 0.75rem 0.75rem 0.75rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: linear-gradient(to bottom right, hsla(0, 0%, 100%, 0.1), hsla(0, 0%, 100%, 0.1));
  }
  .post-wrapper:hover {
    border: 1px solid rgba(255, 255, 255, 0.5);
    animation: borderOpacity 0.3s ease;
    @keyframes borderOpacity {
      0% { border-opacity: 0.3; }
      100% { border-opacity: 0.5; }
    }
    background: linear-gradient(to bottom right, hsla(0, 0%, 100%, 0.1), hsla(0, 0%, 100%, 0.1));
  }
  .post {
    background: rgba(255, 255, 255, 0.98);
    padding: 20px 40px 20px 60px;
    border-radius: 0 0.75rem 0.75rem 0.75rem;
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
    box-shadow: 2px 0 8px rgba(0,0,0,0.2);
  }
  .nav .site-title a {
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
    padding-top: 30px;    
    width: 100%;
    align-items: center;
    flex: 1;
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
    background-color: rgba(255, 167, 90, 0.2);
    color: white;
  }
  .github-stars {
    position: fixed;
    top: 15px;
    right: 15px;
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
  .github-stars:hover {
    border: 1px solid rgba(255, 255, 255, 0.5);
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
    .wrapper {
      margin-left: 0;
      padding-top: 80px;
    }

    .burger-menu {
      display: block;
    }

    .nav {
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      width: 250px;
    }

    .nav-open {
      transform: translateX(0);
    }

    .container {
      grid-template-columns: 1fr;
    }

    .sidebar {
      position: static;
      margin-bottom: 20px;
    }

    .github-stars {
      top: 20px;
      right: 20px;
      font-size: 0.8em;
      padding: 6px 12px;
    }

    .github-stars span:not(#github-star-count) {
      display: none;
    }

    .post {
      padding: 15px 25px 15px 45px;
    }

    .post::before {
      font-size: 0.7em;
      padding: 10px 3px;
      height: 100px;
    }
  }

  @media (max-width: 480px) {
    .wrapper {
      padding: 70px 10px 10px;
    }

    .post {
      padding: 12px 20px 12px 35px;
    }

    .post::before {
      font-size: 0.6em;
      padding: 8px 2px;
      height: 80px;
    }

    .github-stars {
      padding: 4px 8px;
    }

    .github-stars .divider {
      margin: 0 4px;
    }
  }

  .archive-links {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
  }

  .archive-link {
    color: #333;
    text-decoration: none;
    padding: 8px 12px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
  }

  .archive-link:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  .archive-header {
    background: rgba(255, 255, 255, 0.98);
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }

  .archive-header h1 {
    margin: 0;
    font-size: 1.8em;
    color: #333;
  }

  .archive-nav {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 20px;
  }

  .nav-prev {
    text-align: right;
  }

  .nav-next {
    text-align: left;
  }

  .nav-current {
    font-weight: 500;
    color: #333;
    padding: 0 100px;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }

  .archive-nav a {
    color: #333;
    text-decoration: none;
    padding: 12px 24px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    transition: all 0.2s ease;
    font-weight: 500;
    display: inline-block;
  }

  .archive-nav a:hover {
    background: #f0f8ff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }

  .archive-nav-bottom {
    text-align: center;
    margin: 40px 0;
  }

  .archive-nav-bottom .archive-link {
    display: inline-block;
    padding: 12px 24px;
    font-size: 1.1em;
  }

  .archive-year {
    margin: 20px 0;
    background: rgba(255, 255, 255, 0.8);
    padding: 15px;
    border-radius: 8px;
  }

  .archive-year h4 {
    color: #333;
    margin: 0 0 12px 0;
    font-size: 1.2em;
    font-weight: 500;
    border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    padding-bottom: 8px;
  }

  .archive-months {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .archive-month-link {
    color: #333;
    text-decoration: none;
    padding: 3px 6px;
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    font-size: 0.9em;
    min-width: 24px;
    text-align: center;
  }

  .archive-month-link:hover {
    background: rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  .menu-archive {
    width: 60%;
    padding: 0 15px;
    border-left: 2px solid rgba(255, 255, 255, 0.1);
  }

  .menu-archive-year {
    margin: 15px 0;
  }

  .menu-archive-year h4 {
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 8px 0;
    font-size: 1em;
    font-weight: 500;
  }

  .menu-archive-months {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding-left: 1em;
  }

  .menu-archive-month {
    color: rgba(255, 255, 255, 0.6) !important;
    text-decoration: none;
    padding: 2px 4px !important;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.05);
    transition: all 0.2s ease;
    font-size: 0.85em;
    min-width: 20px;
    text-align: center;
  }

  .menu-archive-month:hover {
    color: white !important;
    background: rgba(255, 255, 255, 0.1) !important;
    transform: translateY(-1px);
  }

  .burger-menu {
    display: none;
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 1002;
    width: 30px;
    height: 25px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .burger-menu span {
    display: block;
    width: 100%;
    height: 3px;
    background-color: white;
    position: absolute;
    left: 0;
    transition: all 0.3s ease;
  }

  .burger-menu span:nth-child(1) { top: 0; }
  .burger-menu span:nth-child(2) { top: 50%; transform: translateY(-50%); }
  .burger-menu span:nth-child(3) { bottom: 0; }

  .burger-menu.open span:nth-child(1) {
    transform: rotate(45deg);
    top: 11px;
  }

  .burger-menu.open span:nth-child(2) {
    opacity: 0;
  }

  .burger-menu.open span:nth-child(3) {
    transform: rotate(-45deg);
    bottom: 11px;
  }

  .copyright {
    padding: 30px;
    color: #666;
    font-size: 0.8em;
    text-align: center;
    width: 100%;
    box-sizing: border-box;
    margin-top: auto;
  }
`;

module.exports = { commonStyles }; 