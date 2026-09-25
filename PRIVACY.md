# Privacy Policy — SOGo Dark Mode

**Last updated: 2026-09-25**

SOGo Dark Mode does not collect, store, transmit, or sell any user data,
personal information, or browsing activity — to the developer or to any
third party.

## What the extension does

- Reads the DOM of the pages you visit, purely locally in your browser,
  to check for markers that identify a SOGo webmail installation (a meta
  tag, `SOGo.woa` resource paths, its AngularJS app signature).
- If SOGo is detected, applies a CSS filter to switch the page to dark
  mode.
- Stores your preferences (dark mode on/off, selected theme, per-domain
  overrides) locally in your browser via `chrome.storage.local`.

## What the extension does not do

- It does not read the content of your emails, contacts, calendar, or
  any other SOGo data.
- It does not transmit any data to the developer or any external
  server — there is no backend, analytics, or tracking of any kind.
- It does not sell or share data with third parties, because none is
  collected in the first place.
- It does not use remote code; all JavaScript and CSS ship inside the
  extension package.

## Permissions

- **storage** — used only to save your local settings as described
  above.
- **Content script on all URLs** — required because SOGo is
  self-hosted and can run on any domain; the extension must inspect
  each page to detect it. It only activates on pages that match
  SOGo-specific markers.

## Contact

Questions about this policy: open an issue at
https://github.com/Daniel-Haurich/sogo-dark-mode/issues
