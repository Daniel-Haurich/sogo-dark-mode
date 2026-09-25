/*
 * SOGo Dark Mode – detection & control
 * © Daniel Haurich – https://github.com/Daniel-Haurich/sogo-dark-mode
 *
 * Runs on every web page (all_urls) so the extension also works on
 * self-hosted SOGo servers on any domain. Nothing is tied to a specific
 * domain — instead the page's DOM is checked for typical SOGo markers.
 * Only when SOGo is detected (or the user has manually forced the page)
 * is the "sogo-dark-mode-on" class plus a "data-sogo-theme" attribute set,
 * which darkmode.css uses to activate the chosen theme.
 */

(function () {
  "use strict";

  const DARK_CLASS = "sogo-dark-mode-on";
  const DEFAULT_THEME = "standard";
  const VALID_THEMES = ["standard", "amoled", "blue", "warm", "green"];
  const host = location.hostname || "";

  let sogoDetected = false;
  let observer = null;

  function looksLikeSogo() {
    try {
      // 1) SOGo sets this author meta tag server-side
      if (document.querySelector('meta[name="author"][content="Inverse inc."]')) {
        return true;
      }

      // 2) SOGo always loads its assets from the "SOGo.woa" WebObjects path
      const resourceEls = document.querySelectorAll("link[href], script[src]");
      for (const el of resourceEls) {
        const url = el.getAttribute("href") || el.getAttribute("src") || "";
        if (url.indexOf("SOGo.woa") !== -1) return true;
      }

      // 3) SOGo's AngularJS app sets this ng-app attribute on <body>
      if (document.body && document.body.getAttribute("ng-app") === "SOGo.MailerUI") {
        return true;
      }

      // 4) Fallback: page title ends with "SOGo" (login page, inbox,
      //    calendar, address book, ...)
      if (document.title && /\bSOGo$/.test(document.title.trim())) {
        return true;
      }
    } catch (e) {
      /* ignore */
    }
    return false;
  }

  function getSettings(callback) {
    chrome.storage.local.get(
      { enabled: true, hostOverrides: {}, theme: DEFAULT_THEME },
      function (data) {
        if (VALID_THEMES.indexOf(data.theme) === -1) data.theme = DEFAULT_THEME;
        callback(data);
      }
    );
  }

  function shouldBeDark(settings) {
    if (!settings.enabled) return false;
    const override = settings.hostOverrides ? settings.hostOverrides[host] : undefined;
    if (override === "on") return true;
    if (override === "off") return false;
    return sogoDetected;
  }

  function applyState() {
    getSettings(function (settings) {
      const dark = shouldBeDark(settings);
      document.documentElement.classList.toggle(DARK_CLASS, dark);
      if (dark) {
        document.documentElement.setAttribute("data-sogo-theme", settings.theme);
      } else {
        document.documentElement.removeAttribute("data-sogo-theme");
      }
    });
  }

  function runDetection() {
    if (sogoDetected) return;
    if (looksLikeSogo()) {
      sogoDetected = true;
      applyState();
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }
  }

  // Check right away (in case this script runs later than document_start,
  // e.g. in an iframe that was already open).
  runDetection();

  // At document_start usually only <html> exists yet; <head>/<body> are
  // still being written. So we watch the document until we detect SOGo
  // or the page finishes loading.
  if (!sogoDetected && document.readyState !== "complete") {
    observer = new MutationObserver(runDetection);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    document.addEventListener("DOMContentLoaded", runDetection, { once: true });
    window.addEventListener(
      "load",
      function () {
        runDetection();
        if (observer) {
          observer.disconnect();
          observer = null;
        }
      },
      { once: true }
    );
  }

  // React to settings changes (e.g. toggled in the popup)
  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area === "local" && (changes.enabled || changes.hostOverrides || changes.theme)) {
      applyState();
    }
  });

  // Answer requests from the popup (status for the current page)
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message && message.type === "sogo-dark-mode:get-status") {
      getSettings(function (settings) {
        sendResponse({
          host: host,
          detected: sogoDetected,
          active: document.documentElement.classList.contains(DARK_CLASS),
          override: settings.hostOverrides ? settings.hostOverrides[host] || null : null,
          theme: settings.theme,
        });
      });
      return true; // asynchronous response
    }
  });
})();
