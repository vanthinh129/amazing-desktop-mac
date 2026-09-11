# AmazingDesktop Mac - Interactive Sci-Fi AI Companion Live Wallpaper 🤖✨

**AmazingDesktop Mac** là ứng dụng Hình nền động thông minh (Interactive Sci-Fi AI Live Wallpaper & Desktop Assistant) dành cho hệ điều hành macOS. 

Ứng dụng tích hợp nhân vật **Sci-Fi Holographic AI Avatar** tương tác sống động (biểu cảm mắt kỹ thuật số, hiệu ứng hạt Orbit Particles & vòng năng lượng Spectrum), bộ sưu tập **3D Spatial Wallpaper Slider**, **AI Companion** (Gemini API + Offline Smart Engine), và hệ thống **Đọc giọng nói Tiếng Việt miền Nam tự nhiên** (Hoài My Neural) chạy hoàn toàn Local với độ trễ siêu thấp (<100ms).

---

## 📋 Yêu cầu Hệ thống (Prerequisites)

- **Hệ điều hành**: macOS 12.0 (Monterey) trở lên (Tương thích hoàn hảo trên Apple Silicon M1/M2/M3/M4 & Intel Mac).
- **Trình biên dịch**: Xcode Command Line Tools (`swiftc` đã được cài sẵn trên Mac).
- **Python**: Python 3.8+ (Dùng để chạy máy chủ Local Neural TTS Server).

---

## 🚀 Hướng dẫn Setup & Khởi chạy Chi tiết

### Bước 1: Mở Terminal và di chuyển vào thư mục dự án
```bash
cd /path/to/amazing-desktop-mac
```

### Bước 2: Khởi chạy Máy chủ Đọc Giọng nói Local Neural TTS (Hoài My Neural)
Chạy script khởi tạo môi trường Python virtualenv và chạy máy chủ TTS tại cổng `8008`:

```bash
./start_tts.sh
```

> **Lưu ý**: Script `start_tts.sh` sẽ tự động:
> 1. Tạo môi trường ảo `tts_server/venv` nếu chưa có.
> 2. Cài đặt các thư viện cần thiết: `edge-tts`, `flask`, `flask-cors`.
> 3. Lắng nghe tại địa chỉ `http://127.0.0.1:8008`.

Để kiểm tra máy chủ đọc đã hoạt động hay chưa:
```bash
curl http://127.0.0.1:8008/health
# Trả về: {"default_voice":"vi-VN-HoaiMyNeural","service":"AmazingDesktop Local Neural TTS","status":"ok"}
```

---

### Bước 3: Biên dịch ứng dụng Swift & Đóng gói `.app`
Ứng dụng sử dụng trình biên dịch `swiftc` để tạo file thực thi native kết nối trực tiếp với Cocoa & WebKit ở mức Desktop Layer.

Chạy lệnh build:
```bash
./build.sh
```

Quá trình này sẽ:
1. Biên dịch các file mã nguồn Swift trong thư mục `src/` thành file thực thi `AmazingDesktop`.
2. Tạo cấu trúc ứng dụng macOS standard bundle `AmazingDesktop.app`.
3. Đồng bộ toàn bộ tài nguyên Web (HTML, CSS, JS, Assets) từ thư mục `web/` vào `AmazingDesktop.app/Contents/Resources/web`.
4. Tạo `Info.plist` cấp quyền Microphone và cấu hình hiển thị hình nền.

---

### Bước 4: Mở và Trải nghiệm Ứng dụng
Khởi chạy ứng dụng bằng lệnh:
```bash
open AmazingDesktop.app
```

---

## 🖼️ Hướng dẫn Thêm Hình Ảnh vào Bộ Sưu Tập 3D Spatial Slider

Ứng dụng hỗ trợ tự động quét và nạp ảnh cá nhân của bạn vào bộ sưu tập **3D Spatial Carousel**:

1. **Vị trí thả ảnh**:
   - Copy/Thả các file hình ảnh của bạn vào thư mục `images/` (ở thư mục gốc dự án) hoặc thư mục `web/images/`.
   - Các định dạng được hỗ trợ: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.svg`, `.bmp`.

2. **Cơ chế Tự động hóa**:
   - Ứng dụng Swift Native (`WallpaperViewController.swift`) sẽ tự động quét thư mục `images/`, đồng bộ vào bộ sưu tập web, xáo trộn ngẫu nhiên (shuffle) và nạp mượt mà vào Slide 3D khi ứng dụng khởi chạy.
   - Thẻ hình ảnh 3D tự động xoay chuyển theo vòng lặp 3 giây và đưa bức ảnh tiêu điểm ra trước mặt.

---

## ⚙️ Hướng dẫn Cấu hình Feature & AI

### 1. Cấu hình Gemini API (Tùy chọn)
- Mở bảng **⚙️ Cài đặt** trên màn hình ứng dụng.
- Dán **Gemini API Key** của bạn vào ô nhập liệu và nhấn **Lưu**.
- Nếu không nhập API Key, ứng dụng sẽ tự động chuyển sang **Offline Intelligent Engine** thông minh, phản hồi ngay lập tức các thắc mắc về sức khỏe, thời gian, thời tiết, tư vấn làm việc và tương tác vui vẻ.

### 2. Tương tác với Nhân vật Sci-Fi Holographic AI Avatar 🤖
- Nhân vật Hologram AI trên màn hình tự động thực hiện các hiệu ứng chuyển trạng thái linh hoạt:
  - **IDLE**: Nhấp nháy mắt, bay bồng bềnh, các vòng Halo xoay nhẹ.
  - **LISTENING**: Mắt ghen phát sáng rộng, vòng âm thanh mở rộng.
  - **THINKING**: Mắt hướng lên suy nghĩ, miệng hình chữ "o" tò mò, các hạt Orbit xoay nhanh.
  - **SPEAKING**: Mắt hình nụ cười, miệng phát nhịp theo tần số âm thanh thực tế.
- **Hộp thoại Bong bóng thoại (Speech Bubble)**: Tự động xuất hiện khi AI suy nghĩ/trả lời và tự động đóng ngay lập tức (0ms) khi AI đọc xong.

---

## 🛠️ Lệnh Thao tác Nhanh cho Lập trình viên

### 1. Cập nhật mã nguồn Web mà không cần Biên dịch lại Swift:
Khi bạn chỉnh sửa mã nguồn trong thư mục `web/` (HTML, CSS, JS):
```bash
killall -9 AmazingDesktop 2>/dev/null || true; rm -rf AmazingDesktop.app/Contents/Resources/web; cp -R web AmazingDesktop.app/Contents/Resources/web; open AmazingDesktop.app
```

### 2. Tắt hoàn toàn ứng dụng (Clean Kill):
```bash
killall -9 AmazingDesktop 2>/dev/null || true
```

### 3. Rebuild toàn bộ dự án từ đầu:
```bash
./build.sh && open AmazingDesktop.app
```

---

## 📁 Cấu trúc Mã nguồn Dự án (Project Architecture)

```
amazing-desktop-mac/
├── src/                         # Mã nguồn Swift Native (macOS Desktop Window)
│   ├── main.swift               # Điểm khởi chạy ứng dụng NSApplication
│   ├── DesktopWallpaperWindow.swift # Thiết lập Window Level = kCGDesktopWindowLevel - 1
│   └── WallpaperViewController.swift # Khởi tạo WKWebView & tự động quét/nạp folder images/
├── web/                         # Giao diện Web Live Wallpaper & AI Engine
│   ├── index.html               # Cấu trúc HTML5
│   ├── css/style.css            # Thiết kế Glassmorphism & Themes
│   ├── images/                  # Thư mục lưu trữ hình ảnh cho Slider 3D
│   └── js/
│       ├── ai.js                # Xử lý Gemini API & Offline AI Fallback
│       ├── voice.js             # Engine phát âm thanh Local Neural TTS (Hoài My)
│       ├── character.js         # Canvas Sci-Fi Holographic AI Avatar & Visualizer
│       ├── slider.js            # Render Thư viện 3D Spatial Wallpaper Gallery Slider
│       └── app.js               # Controller chính kết nối AI & UI
├── tts_server/                  # Máy chủ Python Local Neural TTS
│   ├── server.py                # Flask API endpoint /tts & /health
│   └── start_tts.sh             # Script tự động kích hoạt virtualenv & server
├── images/                      # Thư mục gốc để người dùng thả ảnh tự do
├── build.sh                     # Script biên dịch Swift & tạo bundle AmazingDesktop.app
├── SETUP_GUIDE.md               # Hướng dẫn setup nhanh
└── README.md                    # File hướng dẫn đầy đủ dự án
```

---

## 🔊 Giọng đọc Local Neural TTS

- **Giọng đọc mặc định**: `vi-VN-HoaiMyNeural` (Giọng nữ Miền Nam tự nhiên, truyền cảm, phát âm chính xác các từ ngữ "một chút nha", "nghỉ ngơi nhé",...).
- **Cơ chế tải song song (Parallel Pre-fetching)**: Giúp câu thoại đầu tiên cất lên chỉ sau **<100ms** khi AI vừa tạo xong văn bản, các câu tiếp theo được tải ngầm liên tục không bị ngắt quãng hay giật lag.