# 📺 IPTV Player

A modern, fullscreen IPTV player built with Angular 19 for web browsers and Samsung Tizen Smart TVs.

![Angular](https://img.shields.io/badge/Angular-19-red?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🎬 **HLS Streaming** - Powered by hls.js for reliable video playback
- 📺 **Smart TV Ready** - Optimized UI for Samsung Tizen TVs
- 🎮 **Remote Control Support** - Full navigation with TV remote or keyboard
- 🔍 **Channel Search** - Quick search across 100k+ channels
- 📂 **Category Groups** - Organized channel browsing by category
- ⚡ **Virtual Scrolling** - Smooth performance with large channel lists
- 🌙 **Fullscreen Experience** - Immersive viewing with auto-hiding controls
- 🔄 **Auto Recovery** - Smart error handling and stream recovery

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/IPTV.git
cd IPTV

# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

## ⌨️ Controls

| Key | Action |
|-----|--------|
| `→` Arrow Right | Open channel sidebar |
| `←` Arrow Left | Close sidebar |
| `↑` `↓` Arrows | Navigate channels |
| `Enter` | Select channel |
| `Escape` | Close sidebar |
| `Space` | Play/Pause |
| `CH+` / `CH-` | Next/Previous channel (TV remote) |

## 📺 Samsung Tizen TV Deployment

Build and deploy to Samsung Smart TVs:

```bash
# Build for Tizen
npm run build:tizen
```

See [tizen/README.md](tizen/README.md) for detailed deployment instructions.

## 🛠️ Development

```bash
# Start dev server with proxy
npm start

# Build for production
npm run build

# Build for Tizen TV
npm run build:tizen

# Run tests
npm test
```

## 📁 Project Structure

```
src/
├── app/
│   ├── Components/
│   │   └── player.component.*    # Main IPTV player
│   ├── Pages/
│   │   └── home/                 # Home page
│   ├── app.component.*           # Root component
│   └── app.routes.ts             # Routing config
├── styles.scss                   # Global styles
└── index.html
tizen/
├── config.xml                    # Tizen app config
├── README.md                     # Tizen deployment guide
└── build-tizen.sh               # Build script
```

## ⚙️ Configuration

### Playlist URL

Edit the playlist URL in `src/app/Components/player.component.ts`:

```typescript
playlistUrl = '/api/get.php?username=YOUR_USER&password=YOUR_PASS&type=m3u&output=hls';
```

### Proxy Configuration

The development server uses a proxy to bypass CORS. Configure in `proxy.conf.js`:

```javascript
"/api": {
  target: "http://your-iptv-server.com",
  changeOrigin: true,
  // ...
}
```

## 🔧 HLS Player Settings

The player is optimized for IPTV streams with:

- 60s buffer for stable playback
- Automatic quality adaptation
- Generous retry settings for unreliable streams
- Smart error recovery

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ for IPTV enthusiasts
