# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.1.0] – 2026-09-25

### Added
- 5 color themes to choose from in the popup: Standard, AMOLED, Midnight
  Blue, Warm Amber, Terminal Green.
- Copyright and credits line in the popup (GitHub link, donate link).
- `author` and `homepage_url` in the manifest.

### Fixed
- Removed `default_locale` without a matching `_locales` folder (caused
  the extension to fail loading with "Default locale was specified, but
  _locales subtree is missing").

## [1.0.0] – 2026-09-25

### Added
- Initial release: automatic SOGo detection on any domain.
- Dark mode via a CSS invert filter, including a counter-filter for
  images/attachments.
- Popup with a global on/off switch plus per-domain force-on/force-off
  for edge cases.
