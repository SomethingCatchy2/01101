# 🎲 Tower of Gable — Changelog

All the glitter, bells & whistles added since v14 (ht2.html → ht3.html).

---

## 🚀 [v15.2] — New Features
- **Tabbed Interface**: Split view into **Gable**, **Upgrades**, **Status & Actions**, **Shop**, **Gableisms**.  
- **Upgrades System**: Interactive grid, category sections, affordability indicators, purchase logic.  
- **Manual Save**: “Save Game” button with flash confirmation.  
- **Developer Mode**: Cheat panel to grant upgrades, set age/money.  

## ✨ Enhancements
- **Layout**: 
  - Removed left sidebar—quotes moved into **Gableisms** tab.  
  - Stats and actions separated into their own **Status** tab.  
  - Shop pane becomes collapsible and sits under **Shop** tab.  
- **Footer & Controls**: 
  - Audio `<audio>` no longer auto-plays (kept `loop`).  
  - Added **Pause** and **Stop** controls; refactored JS audio functions.  
- **Game Keys**:
  - `SAVE_GAME_KEY` updated to `towerOfGableData_v15_2`.  
  - JS is now loaded as an ES module.  

## 🎨 Style & Theming
- **Tabs CSS**: `.tabs`, `.tab-button`, `.tab-content` with active states.  
- **Upgrade Grid**: Responsive grid styling, hover & disabled visuals.  
- **Elegant Buttons**: Italic “Save” & “Developer Mode” styling.  
- **Notification Colors**: Tweaked notification‐type classes for clarity.  

## 🐛 Bug Fixes & Under the Hood
- Fixed button-disable logic for dog walker & shop toggles.  
- Renamed handler `work-in-office-btn → workInOfficeJob`.  
- Ensured reset button never gets stuck disabled.  
- Moved collapse state into CSS (`.collapsed`) and persisted in `localStorage`.  

*Enjoy the upgrade!*  
