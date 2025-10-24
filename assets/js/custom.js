// Theme toggle initializer for Just the Docs
(function () {
  var THEME_KEY = 'jtd-theme';

  function currentTheme() {
    try {
      return window.jtd && window.jtd.getTheme ? window.jtd.getTheme() : null;
    } catch (e) {
      return null;
    }
  }

  function applyTheme(theme) {
    if (!window.jtd || !window.jtd.setTheme) return;
    window.jtd.setTheme(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      var isDark = theme === 'dark';
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      btn.title = isDark ? 'Switch to light theme' : 'Switch to dark theme';
      btn.innerText = isDark ? '🌙' : '🌞';
    }
  }

  function init() {
    var stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (e) { stored = null; }
    var pref = stored || ((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light');
    if (window.jtd && window.jtd.setTheme) {
      applyTheme(pref);
    } else {
      var tries = 0;
      var id = setInterval(function () {
        tries++;
        if (window.jtd && window.jtd.setTheme) {
          applyTheme(pref);
          clearInterval(id);
        } else if (tries > 20) {
          clearInterval(id);
        }
      }, 100);
    }

    document.addEventListener('click', function (e) {
      var target = e.target;
      if (!target) return;
      if (target.id === 'theme-toggle') {
        e.preventDefault();
        var now = currentTheme() || pref || 'light';
        var next = now === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      }
    });

    var aux = document.querySelector('nav[aria-label="Auxiliary"], .aux-nav');
    var btn = document.getElementById('theme-toggle');
    if (aux && btn && aux.parentNode) {
      if (aux.nextSibling) aux.parentNode.insertBefore(btn, aux.nextSibling);
      else aux.parentNode.appendChild(btn);
    }
  }

  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
