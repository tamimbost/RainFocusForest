# 🌳 RainFocusForest

**RainFocusForest** is a cross-platform productivity desktop app that simulates a calming forest environment with customizable ambient sounds and a Pomodoro timer — helping users stay focused and manage their routines.

Built with **Electron** + **React**, it offers a minimal, distraction-free interface with elegant design and smart features.

---

![RainFocusForest Dashboard](software-screenshorts/11.png)
![RainFocusForest Total activity types graph and today's notes ](software-screenshorts/22.png)
![RainFocusForest Today's routine status ](software-screenshorts/33.png)
![RainFocusForest My routine](software-screenshorts/44.png)
![RainFocusForest Data Analytics ](software-screenshorts/55.png)
![RainFocusForest Customize routines ](software-screenshorts/88.png)
![RainFocusForest Current custom routine ](software-screenshorts/99.png)
![RainFocusForest Focus Music Player ](software-screenshorts/10.png)

> _Built with ☕, ⚛️, and 🌳 by [Saiful Islam Tamim](mailto:contact.sitamim@gmail.com)_

---

## 🚀 Features

- 🧘‍♂️ Calming forest-themed focus timer
- ⏱️ Pomodoro sessions with break scheduling
- 🎧 Custom ambient background sounds (rain, birds, breeze, etc.)
- 📊 Productivity analytics and focus tracking
- 🌓 Light/Dark theme toggle
- 📆 Goal reminders + calendar sync (coming soon)
- 🖥️ Cross-platform: Windows (Linux & macOS coming)

---

## 📦 Download

👉 [Download the latest release](https://github.com/tamimbost/RainFocusForest/)  
Windows `.exe` installer and portable version available.

---

## 🛠️ Getting Started (Development Setup)

### 1. Clone the Repo

```bash
git clone https://github.com/tamimbost/RainFocusForest.git
cd RainFocusForest
```

### 2. Install Dependencies

```bash
npm install
```


### 3. Run in Development Mode

```bash
npm start       # Start React app
npm run dev     # Start Electron with React concurrently
```

### 4. Build for Production

```bash
npm run dist    # Generates platform-specific builds
```

> ⚠️ Requires **Node.js >= 16** and **npm >= 8**

---

### 4. 📁 **File Structure**

```
RainFocusForest/
├── assets/
│   ├── icon.icns
│   ├── icon.ico
│   └── icon.png
├── build/
│   ├── static/
│   │   ├── css/
│   │   │   ├── main.c122a62b.css
│   │   │   └── main.c122a62b.css.map
│   │   └── js/
│   │       ├── main.8665535d.js
│   │       ├── main.8665535d.js.LICENSE.txt
│   │       └── main.8665535d.js.map
│   ├── asset-manifest.json
│   ├── electron.js
│   └── index.html
├── dist/
│   └── win-unpacked/
│       ├── locales/
│       │   └── ... (language files)
│       ├── resources/
│       │   ├── app.asar
│       │   ├── elevate.exe
│       │   ├── chrome_100_percent.pak
│       │   ├── chrome_200_percent.pak
│       │   ├── d3dcompiler_47.dll
│       │   ├── ffmpeg.dll
│       │   ├── icudtl.dat
│       │   ├── libEGL.dll
│       │   ├── libGLESv2.dll
│       │   ├── LICENSE.electron.txt
│       │   ├── LICENSES.chromium.html
│       │   ├── RainFocusForest.exe (Main exe file)
│       │   ├── resources.pak
│       │   ├── snapshot_blob.bin
│       │   └── v8_context_snapshot.bin
│       ├── vk_swiftshader_icd.json
│       └── vulkan-1.dll
├── .builder-debug.yml
├── builder-effective-config.yaml
├── RainFocusForest Setup 1.0.0.exe
├── RainFocusForest Setup 1.0.0.exe.blockmap
├── node_modules/
│   └── ... (project dependencies)
├── public/
│   ├── electron.js
│   └── index.html
├── src/
│   └── ... (your React source code, e.g., App.js, index.js, index.css)
├── package-lock.json
└── package.json

```
---

## 🧑‍💻 Contributing

We welcome all contributors! Whether you're fixing bugs, adding new features, or improving documentation — your help is appreciated 💚

### Ways to Contribute

- 🐞 Report or fix bugs
- ✨ Add new features
- 🧪 Add tests
- 📝 Improve documentation
- 🎨 Share UI/UX feedback
- 🌍 Translate the interface

### Setup a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Make your changes and push:

```bash
git add .
git commit -m "✨ Add [feature description]"
git push origin feature/your-feature-name
```

Then open a **Pull Request** on GitHub.

---

## ✅ Pull Request Guidelines

- Clear and descriptive titles
- Keep commits focused and small
- Reference related issues using `#issue_number`
- Test your changes
- Include screenshots for UI updates

---

## 🐛 Reporting Bugs or Issues

1. Check if the issue exists: [GitHub Issues](https://github.com/tamimbost/RainFocusForest/issues)
2. If not, create a new issue and include:
   - A clear title and description
   - Steps to reproduce
   - OS/platform details
   - Screenshots or logs if applicable

---

## 🧠 Developer Tips

- Use browser DevTools or `console.log()` for debugging
- Enable React Developer Tools for easier component inspection
- Use `electron-builder` for cross-platform builds
- Keep code modular, clean, and well-commented
- Follow existing naming/style conventions

---

## 🖼 Screenshots

> Place your screenshots inside: `assets/screenshots/`

---

## 📬 Contact

Need help or want to say hi?

📧 Email: [contact.sitamim@gmail.com](mailto:contact.sitamim@gmail.com)  
🐙 GitHub: [@saifulislamtamim](https://github.com/tamimbost)

---

## 💚 Thank You

Thanks for being a part of the **RainFocusForest** community. Every contribution matters and helps this project grow stronger.

> _Stay focused, stay mindful — one pomodoro at a time._ 🍃