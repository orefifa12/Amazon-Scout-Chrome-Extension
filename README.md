# Amazon Scout

Version: 1.0.0

## Description

Track, color-code, and annotate Amazon product listings across different categories while shooping.

## How to run it

To run the program do the following steps:

1. Extract this ZIP file to a folder on your computer
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top right
4. Click "Load unpacked" button
5. Select the extracted folder
6. The extension should now be installed and active!

## ------------DEVELOPERS ONLY BELOW ------------

## Development Setup (How to Change Code)

This is a React TypeScript extension. I coded some of this with Chrome Extension Builder (AI) as a fun project that happen to also be useful. To modify and rebuild, you can find the source code in the `source/` directory:

### Prerequisites (for developers)

- Node.js 18+ installed
- npm or yarn

### Steps to modify:

1. Copy all contents from the `source/` folder to a new root directory
2. Run `npm install`
3. Run `npm run build` to update the extension files in the root

## Current Project Structure

```
├── manifest.json        # Extension manifest
├── popup.html           # Popup HTML template
├── popup.js             # Bundled popup code
├── popup.css            # Popup styles
├── content.js           # Bundled content script
├── background.js        # Bundled service worker
├── icons/               # Extension icons
└── src/                 # Source files
```

## Support

Documentation that may help:

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [React Documentation](https://react.dev/)

Email Me For Feedback: DavidBoham.O@gmail.com

---
