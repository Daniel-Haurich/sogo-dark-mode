(function () {
  "use strict";

  const GITHUB_URL = "https://github.com/Daniel-Haurich/sogo-dark-mode";
  const DONATE_URL = "https://www.buymeacoffee.com/danielhaurich";

  const DEFAULT_THEME = "standard";

  const globalToggle = document.getElementById("globalToggle");
  const siteOverrideToggle = document.getElementById("siteOverrideToggle");
  const overrideRow = document.getElementById("overrideRow");
  const overrideLabel = document.getElementById("overrideLabel");
  const overrideHint = document.getElementById("overrideHint");
  const statusIcon = document.getElementById("statusIcon");
  const statusText = document.getElementById("statusText");
  const hostLabel = document.getElementById("hostLabel");
  const themeGrid = document.getElementById("themeGrid");
  const githubLink = document.getElementById("githubLink");
  const donateLink = document.getElementById("donateLink");

  githubLink.href = GITHUB_URL;
  donateLink.href = DONATE_URL;

  let currentHost = null;
  let currentTabId = null;

  function getSettings(callback) {
    chrome.storage.local.get(
      { enabled: true, hostOverrides: {}, theme: DEFAULT_THEME },
      callback
    );
  }

  function highlightTheme(theme) {
    const buttons = themeGrid.querySelectorAll(".theme-swatch");
    buttons.forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-theme") === theme);
    });
  }

  themeGrid.addEventListener("click", function (event) {
    const btn = event.target.closest(".theme-swatch");
    if (!btn) return;
    const theme = btn.getAttribute("data-theme");
    highlightTheme(theme);
    chrome.storage.local.set({ theme: theme });
  });

  function setStatus(kind, text) {
    statusIcon.className = "dot " + kind;
    statusText.textContent = text;
  }

  function refreshFromTabStatus(status, settings) {
    currentHost = status ? status.host : null;
    hostLabel.textContent = currentHost ? currentHost : "";

    if (!status) {
      overrideRow.style.display = "none";
      setStatus("unknown", "No response from this page (might be a built-in browser page).");
      return;
    }

    const override = settings.hostOverrides[currentHost];

    if (status.detected) {
      setStatus("on", "SOGo detected on this page.");
    } else if (override === "on") {
      setStatus("on", "SOGo not auto-detected, but manually forced on.");
    } else {
      setStatus("off", "No SOGo detected on this page.");
    }

    overrideRow.style.display = "flex";
    if (status.detected) {
      overrideLabel.textContent = "Disable on this site";
      overrideHint.textContent = "Turn dark mode off here anyway";
      siteOverrideToggle.checked = override !== "off";
    } else {
      overrideLabel.textContent = "Force on this site";
      overrideHint.textContent = "In case SOGo isn't detected automatically here";
      siteOverrideToggle.checked = override === "on";
    }
  }

  function loadAndRender() {
    getSettings(function (settings) {
      globalToggle.checked = !!settings.enabled;
      siteOverrideToggle.disabled = !settings.enabled;
      highlightTheme(settings.theme || DEFAULT_THEME);

      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs && tabs[0];
        if (!tab || !tab.id) {
          refreshFromTabStatus(null, settings);
          return;
        }
        currentTabId = tab.id;
        chrome.tabs.sendMessage(
          tab.id,
          { type: "sogo-dark-mode:get-status" },
          { frameId: 0 },
          function (response) {
            if (chrome.runtime.lastError) {
              refreshFromTabStatus(null, settings);
              return;
            }
            refreshFromTabStatus(response, settings);
          }
        );
      });
    });
  }

  globalToggle.addEventListener("change", function () {
    chrome.storage.local.set({ enabled: globalToggle.checked }, function () {
      siteOverrideToggle.disabled = !globalToggle.checked;
      loadAndRender();
    });
  });

  siteOverrideToggle.addEventListener("change", function () {
    if (!currentHost) return;
    getSettings(function (settings) {
      const overrides = Object.assign({}, settings.hostOverrides);

      // Two meanings depending on detection state: either "force on" or
      // "disable here" — see refreshFromTabStatus() above.
      chrome.tabs.sendMessage(
        currentTabId,
        { type: "sogo-dark-mode:get-status" },
        { frameId: 0 },
        function (status) {
          const detected = status && !chrome.runtime.lastError && status.detected;
          if (detected) {
            overrides[currentHost] = siteOverrideToggle.checked ? undefined : "off";
          } else {
            overrides[currentHost] = siteOverrideToggle.checked ? "on" : undefined;
          }
          if (overrides[currentHost] === undefined) {
            delete overrides[currentHost];
          }
          chrome.storage.local.set({ hostOverrides: overrides }, loadAndRender);
        }
      );
    });
  });

  loadAndRender();
})();
