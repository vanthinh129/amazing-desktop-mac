# AmazingDesktop Mac - Interactive AI Web Wallpaper

Lệnh biên dịch & khởi chạy lại toàn bộ ứng dụng (Bao gồm Quét tự động 100% hình ảnh trong thư mục `images/`):

```bash
./build.sh && open AmazingDesktop.app
```
rm -rf AmazingDesktop.app/Contents/Resources/web && cp -R web AmazingDesktop.app/Contents/Resources/web && killall AmazingDesktop || true && open AmazingDesktop.app