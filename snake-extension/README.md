# 🐍 Snake Game — Chrome Extension

A fully-featured classic Snake game playable directly from your browser toolbar. No internet required, no permissions needed — just pure Snake fun one click away.

---

## 📦 Files Included

```
snake-extension/
├── manifest.json       # Extension configuration (Manifest V3)
├── popup.html          # Game UI — rendered as the extension popup
├── game.js             # All game logic, drawing, and audio
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

---

## 🚀 Installation

### Chrome / Brave / Edge

1. **Download** the `snake-extension.zip` and extract it to a folder on your computer.
2. Open your browser and go to:
   ```
   chrome://extensions
   ```
3. Toggle **Developer mode** ON (top-right corner).
4. Click **"Load unpacked"**.
5. Select the extracted `snake-extension` folder.
6. The 🐍 snake icon will appear in your browser toolbar.
7. Click it to start playing!

> **Tip:** Pin the extension to your toolbar so it's always one click away.  
> Click the puzzle-piece icon → find Snake Game → click the pin 📌

---

## 🎮 How to Play

| Control | Action |
|---|---|
| `Arrow Keys` or `W A S D` | Move the snake |
| `Space` | Pause / Resume |
| `🔊` button | Toggle sound on/off |
| `⏸` button | Pause / Resume |
| `↺` button | Restart / Back to menu |

**Goal:** Eat apples 🍎 to grow your snake and score points. Avoid hitting walls or your own tail!

---

## 🕹️ Game Modes

| Mode | Description |
|---|---|
| **Classic** | The original experience — walls and your own tail kill you. |
| **Borderless** | Edges wrap around, so you can pass through walls and come out the other side. |
| **Wall** | Every apple you eat spawns a new permanent brick somewhere on the board. The playable space shrinks over time! |
| **Dark** | Same Classic rules with a dark board and dark blue snake for a moodier atmosphere. |
| **Speedy** | The snake speeds up by 8ms every time you eat an apple. How long can you last? |
| **Maze** | A set of fixed wall obstacles fills the board. Navigate through tight gaps to survive. |

---

## 🔊 Sound Effects

All sounds are generated using the **Web Audio API** — no audio files needed.

| Sound | Trigger |
|---|---|
| 🎵 Start jingle | Rising 4-note melody when a game begins |
| 🍎 Eat crunch | Pitch rises higher the longer your snake gets |
| 🧱 Wall spawn | Dull thud when a brick appears (Wall mode only) |
| 💀 Death fanfare | Descending 4-note sequence on game over |
| 🏆 New high score | Special ascending jingle when you beat your best |
| 🔈 Move tick | Subtle low pulse every few steps |
| ⏸ Pause click | Soft two-tone blip on pause/resume |

Click **🔊** in the header to mute all sounds at any time.

---

## ⚙️ Settings

| Setting | Options |
|---|---|
| **Speed** | Slow (200ms) · Normal (130ms) · Fast (80ms) · Blazing (50ms) |
| **Apples** | 1 · 3 · 5 apples on the board at once |

---

## 🏆 Scoring

- **+1 point** for every apple eaten.
- Your **high score** (🏆) is tracked for the entire browser session.
- The score counter flashes gold when you eat an apple.
- A special jingle plays when you set a new personal best.

---

## 🛠️ Technical Details

| Detail | Value |
|---|---|
| Manifest Version | V3 (latest Chrome standard) |
| Grid Size | 17 × 17 cells |
| Cell Size | 24 × 24 px |
| Canvas Size | 408 × 408 px |
| Popup Width | 420 px |
| Audio Engine | Web Audio API (no files) |
| Permissions | None required |
| External Requests | None — fully offline |

---

## 🌐 Browser Compatibility

| Browser | Supported |
|---|---|
| Google Chrome | ✅ Yes |
| Microsoft Edge | ✅ Yes |
| Brave | ✅ Yes |
| Opera | ✅ Yes |
| Firefox | ⚠️ Use Firefox's "Load Temporary Add-on" via `about:debugging` |
| Safari | ❌ Not supported (different extension format) |

---

## 📝 Notes

- The high score resets when the browser session ends (no persistent storage used).
- In **Speedy** mode, the game over screen shows your final speed in milliseconds.
- In **Wall** mode, the game over screen shows how many bricks were on the board.
- The snake's eyes always track the direction of movement.
- You cannot reverse 180° directly into your own neck — only 90° turns are allowed.

---

## 📁 Want the Standalone Version?

A standalone `snake_game.html` file is also available — just open it in any browser without installing anything. All features are identical.

---

*Built with HTML5 Canvas, vanilla JavaScript, and Web Audio API.*
