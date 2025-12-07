Options for serving to local network:

(Claude):

Great question! Here are a few easy ways to preview your site on your phone before pushing:

## Option 1: Python (Simplest - Already Installed on Linux)

Open a terminal in your portfolio directory and run:

```bash
cd /data/Projects_Link/home_code_2022/home_only/amelia-portfolio/portfolio

# Python 3
python3 -m http.server 8080 --bind 0.0.0.0

# Or Python 2 (if that's what you have)
python -m SimpleHTTPServer 8080
```

Then:
1. **Find your computer's IP address:**
   ```bash
   hostname -I | awk '{print $1}'
   ```
   (It'll be something like `192.168.1.x`)

2. **On your phone**, connect to the same WiFi network and open:
   ```
   http://192.168.1.x:8080/graphic-design.html
   ```

**Press Ctrl+C to stop the server when done.**

---

## Option 2: Node.js (If You Have Node Installed)

```bash
# Install once
npm install -g http-server

# Run in your portfolio folder
cd /data/Projects_Link/home_code_2022/home_only/amelia-portfolio/portfolio
http-server -p 8080 -a 0.0.0.0
```

Same as above - access via `http://YOUR_IP:8080/graphic-design.html`

---

## Option 3: DreamWeaver's Built-in Preview

DreamWeaver has a "Real-time Preview" feature:
1. Go to **File → Real-time Preview → Edit Browser List**
2. Enable the device preview feature
3. DreamWeaver will give you a URL/QR code to scan with your phone

This is probably the easiest if you're already working in DreamWeaver!

---

## Quick Reference

| Method | Command | URL on Phone |
|--------|---------|--------------|
| Python 3 | `python3 -m http.server 8080 --bind 0.0.0.0` | `http://YOUR_IP:8080/` |
| Node | `npx http-server -p 8080 -a 0.0.0.0` | `http://YOUR_IP:8080/` |
| DreamWeaver | Real-time Preview menu | Shows QR code |

---

## Tips

- **Same WiFi**: Your phone must be on the same WiFi network as your computer
- **Firewall**: If it doesn't work, you may need to allow port 8080 through your firewall:
  ```bash
  sudo ufw allow 8080
  ```
- **Stop server**: Press `Ctrl+C` in the terminal when you're done testing

Would you like me to help you set up one of these options?
