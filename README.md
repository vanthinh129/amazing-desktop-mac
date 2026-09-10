# AmazingDesktop Mac - Interactive AI Web Wallpaper

### 1. Lệnh Kill sạch tiến trình đang chạy (Clean Kill):
```bash
killall -9 AmazingDesktop 2>/dev/null || true
```

### 2. Lệnh Cập nhật Web & Khởi chạy nhanh:
```bash
killall -9 AmazingDesktop 2>/dev/null || true; rm -rf AmazingDesktop.app/Contents/Resources/web; cp -R web AmazingDesktop.app/Contents/Resources/web; open AmazingDesktop.app
```

### 3. Lệnh Biên dịch lại toàn bộ (Swift + Web Bundle):
```bash
./build.sh && open AmazingDesktop.app
```