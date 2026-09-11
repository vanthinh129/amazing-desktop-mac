# Hướng dẫn Setup & Khởi chạy Chi tiết Dự án AmazingDesktop Mac 🤖✨

Tài liệu này hướng dẫn chi tiết từ A - Z cách cài đặt, cấu hình, biên dịch và khởi chạy dự án **AmazingDesktop Mac** (Ứng dụng Hình nền động Sci-Fi AI Live Wallpaper & Holographic Avatar trên macOS).

---

## 🛠️ 1. Các thành phần & Yêu cầu phần mềm

| Thành phần | Yêu cầu | Mục đích |
| :--- | :--- | :--- |
| **macOS** | Version 12.0 (Monterey) trở lên | Chạy cửa sổ Desktop Window Level thấp hơn Desktop Icon |
| **Swift & swiftc** | Cài sẵn qua Xcode Command Line Tools | Biên dịch ứng dụng Swift Native |
| **Python 3.8+** | Cài sẵn trên macOS hoặc qua Homebrew | Chạy máy chủ phát âm giọng đọc Tiếng Việt Local Neural TTS |

---

## 🚀 2. Các bước Setup từng bước (Step-by-Step)

### Bước 1: Mở Terminal & Di chuyển vào thư mục dự án
```bash
cd /Users/amazingcpanel/Project/amazing-desktop-mac
```

### Bước 2: Khởi động máy chủ Đọc Giọng nói Local Neural TTS Server
Chạy file script sau:
```bash
./start_tts.sh
```
*Script sẽ tự động tạo `tts_server/venv`, tự động cài đặt `edge-tts`, `flask`, `flask-cors` và khởi chạy máy chủ tại `http://127.0.0.1:8008`.*

**Kiểm tra tình trạng máy chủ TTS:**
```bash
curl http://127.0.0.1:8008/health
```
Nếu trả về `{"status": "ok", "default_voice": "vi-VN-HoaiMyNeural", ...}` là đã sẵn sàng!

### Bước 3: Biên dịch mã nguồn Swift & Đóng gói App
Chạy script build:
```bash
./build.sh
```
Script này sẽ biên dịch các file Swift trong `src/` thành ứng dụng macOS bundle `AmazingDesktop.app`.

### Bước 4: Chạy ứng dụng AmazingDesktop
```bash
open AmazingDesktop.app
```

---

## ⚡ 3. Các câu lệnh hữu ích khi Phát triển (Cheat Sheet)

- **Biên dịch & Chạy lại ứng dụng**:
  ```bash
  ./build.sh && open AmazingDesktop.app
  ```

- **Chỉ cập nhật mã nguồn Web (CSS/JS/HTML) mà không cần build lại Swift**:
  ```bash
  killall -9 AmazingDesktop 2>/dev/null || true; rm -rf AmazingDesktop.app/Contents/Resources/web; cp -R web AmazingDesktop.app/Contents/Resources/web; open AmazingDesktop.app
  ```

- **Tắt sạch ứng dụng**:
  ```bash
  killall -9 AmazingDesktop 2>/dev/null || true
  ```

---

## 🔊 4. Thông tin Giọng nói & Sci-Fi AI Avatar

- **Sci-Fi Holographic AI Avatar**: Nhân vật AI dạng quả cầu Hologram phát sáng với các vòng năng lượng Spectrum, các hạt Orbit xoay xung quanh và đôi mắt kỹ thuật số sinh động tương tác theo trạng thái (IDLE, LISTENING, THINKING, SPEAKING).
- **Giọng đọc mặc định**: `vi-VN-HoaiMyNeural` (Giọng nữ Miền Nam tự nhiên, đọc đúng chuẩn ngữ điệu Tiếng Việt).
- **Tốc độ phản hồi**: Nhờ kỹ thuật tách câu và phát audio song song, giọng nói cất lên lập tức (<100ms) sau khi AI vừa tạo xong văn bản.
- **Speech Bubble**: Bong bóng thoại của nhân vật tự động đóng ngay lập tức (0ms) khi giọng đọc kết thúc.
