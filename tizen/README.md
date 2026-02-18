# IPTV Player - Samsung Tizen TV Deployment

## Prerequisites

1. **Samsung Developer Account**: [Register here](https://developer.samsung.com/)
2. **Tizen Studio**: [Download here](https://developer.tizen.org/development/tizen-studio/download)
3. **Samsung TV in Developer Mode**

---

## Step 1: Build the App

```bash
npm run build:tizen
```

This creates the Tizen-ready app in `tizen/output/`.

---

## Step 2: Enable Developer Mode on TV

1. Open **Apps** on your Samsung TV
2. Press **1-2-3-4-5** on the remote (number sequence)
3. **Developer Mode** dialog appears
4. Set to **ON**
5. Enter your **computer's IP address**
6. **Restart** the TV

---

## Step 3: Setup Tizen Studio

### Install Required Packages
1. Open **Tizen Package Manager**
2. Install:
   - **TV Extensions-6.0** (or latest)
   - **Samsung Certificate Extension**

### Connect to TV
1. Open **Device Manager** (Tools → Device Manager)
2. Click **Remote Device Manager**
3. Click **+** to add device
4. Enter your **TV's IP address** (find in TV Settings → Network)
5. Click **Connect**

---

## Step 4: Create Samsung Certificate

**First time only:**

1. **Tools → Certificate Manager**
2. Click **+** to create new certificate
3. Choose **Samsung** certificate type
4. **Create new certificate profile**
5. Log in to your Samsung developer account
6. For **Distributor Certificate**:
   - Choose **Partner** (for development)
   - Add your TV's **DUID** (shown in Device Manager)
7. Complete the wizard

---

## Step 5: Import & Run Project

1. **File → Import → Tizen → Tizen Project**
2. Select `tizen/output` folder
3. Right-click project → **Run As → Tizen Web Application**

The app will install and launch on your TV!

---

## Remote Control Keys

| Key | Action |
|-----|--------|
| ← Arrow Left | Close sidebar |
| → Arrow Right | Open sidebar/channel list |
| ↑↓ Arrows | Navigate channels |
| Enter/OK | Select channel |
| Back | Close sidebar |
| CH+/CH- | Next/Previous channel |
| Play/Pause | Toggle playback |
| Exit | Close app |

---

## Troubleshooting

### "Certificate error"
- Re-create certificate with correct TV DUID
- Make sure TV is connected in Device Manager

### "App won't install"
- Check TV is in Developer Mode
- Verify IP addresses are correct
- Try restarting Device Manager

### "CORS errors on TV"
- The built app connects directly to IPTV server
- No proxy needed on the TV (it's a native app)

### "Channels not loading"
- Check TV is connected to internet
- Verify IPTV subscription is active

---

## Building for Production (Distribution)

For Samsung TV App Store submission:

1. Create **Commercial** certificate (instead of Partner)
2. Test on multiple TV models
3. Submit via [Samsung Seller Office](https://seller.samsungapps.com/)
