/**
 * Amazing Desktop Mac - AI Engine Component
 * Handles Gemini API integration and Offline Intelligent Fallback
 */

class AIEngine {
    constructor() {
        this.apiKey = localStorage.getItem('gemini_api_key') || '';
    }

    setApiKey(key) {
        this.apiKey = key.trim();
        localStorage.setItem('gemini_api_key', this.apiKey);
    }

    getApiKey() {
        return this.apiKey;
    }

    async generateResponse(userPrompt) {
        const cleanedPrompt = userPrompt.trim();
        if (!cleanedPrompt) return "Xin chào! Bạn muốn hỏi điều gì?";

        // Check if user is asking to change theme directly
        if (this.checkThemeCommand(cleanedPrompt)) {
            return this.handleThemeCommand(cleanedPrompt);
        }

        // If Gemini API Key exists, attempt online call
        if (this.apiKey) {
            try {
                return await this.callGeminiAPI(cleanedPrompt);
            } catch (err) {
                console.warn("Gemini API Error, falling back to offline engine:", err);
            }
        }

        // Otherwise use smart offline response engine
        return this.generateOfflineResponse(cleanedPrompt);
    }

    checkThemeCommand(prompt) {
        const lower = prompt.toLowerCase();
        return lower.includes('đổi màu') || lower.includes('đổi chủ đề') || lower.includes('theme');
    }

    handleThemeCommand(prompt) {
        const lower = prompt.toLowerCase();
        let theme = 'theme-cyan';
        let name = 'Cyber Cyan';

        if (lower.includes('tím') || lower.includes('purple')) {
            theme = 'theme-purple';
            name = 'Deep Purple';
        } else if (lower.includes('xanh lá') || lower.includes('ngọc') || lower.includes('emerald')) {
            theme = 'theme-emerald';
            name = 'Emerald Aurora';
        } else if (lower.includes('cam') || lower.includes('chạng vạng') || lower.includes('sunset')) {
            theme = 'theme-sunset';
            name = 'Neon Sunset';
        }

        if (window.appController) {
            window.appController.switchTheme(theme);
        }
        return `Đã đổi chủ đề hình nền sang ${name}!`;
    }

    async callGeminiAPI(prompt) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
        const systemInstruction = "Bạn là AI Companion thông minh, thân thiện trên hình nền máy tính macOS của người dùng. Hãy trả lời ngắn gọn, tự nhiên, sinh động bằng tiếng Việt (dưới 3 câu ngắn).";

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: `${systemInstruction}\n\nNgười dùng: ${prompt}` }]
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return replyText || "Tôi đã nhận được thông tin nhưng chưa có câu trả lời phù hợp.";
    }

    generateOfflineResponse(prompt) {
        const lower = prompt.toLowerCase();
        const now = new Date();

        // Date and Time queries
        if (lower.includes('mấy giờ') || lower.includes('thời gian') || lower.includes('bây giờ')) {
            const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            return `Bây giờ là ${timeStr}. Chúc bạn làm việc thật hiệu quả trên Macbook!`;
        }

        if (lower.includes('ngày mấy') || lower.includes('hôm nay') || lower.includes('thứ mấy')) {
            const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            return `Hôm nay là ${dateStr}.`;
        }

        // Weather queries
        if (lower.includes('thời tiết')) {
            return `Hôm nay trời mát mẻ, nhiệt độ khoảng 27°C, rất thích hợp để tập trung làm việc và sáng tạo!`;
        }

        // Who are you / Capabilities
        if (lower.includes('bạn là ai') || lower.includes('giới thiệu') || lower.includes('tên gì')) {
            return `Tôi là AI Companion - Trợ lý thông minh giao diện Web Live Wallpaper trên macOS của bạn! Tôi có thể lắng nghe giọng nói, chuyện trò và làm đẹp cho hình nền của bạn.`;
        }

        // Stories or fun interactions
        if (lower.includes('kể chuyện') || lower.includes('câu chuyện') || lower.includes('truyện')) {
            const stories = [
                "Ngày xửa ngày xưa, có một dòng code nhỏ ước mơ trở thành ứng dụng AI tuyệt vời trên macOS. Sau nhiều lần nỗ lực compile, dòng code đó đã biến thành tôi ngày hôm nay!",
                "Một người lập trình đi vào quán cà phê và gọi: 'Cho tôi một ly cà phê không có bug!'. Phục vụ mỉm cười trả lời: 'Dạ, chúng em chỉ có cà phê nguyên chất, không bug thì phải tự sửa ạ!'."
            ];
            return stories[Math.floor(Math.random() * stories.length)];
        }

        // Greeting
        if (lower.includes('chào') || lower.includes('hello') || lower.includes('hi')) {
            return `Xin chào bạn! Rất vui được đồng hành cùng bạn trên chiếc Macbook này. Hãy nói hoặc nhập câu hỏi nhé!`;
        }

        // General smart fallbacks
        const fallbacks = [
            `Tôi đã nghe rõ "${prompt}". Rất tuyệt vời! Bạn có cần tôi hỗ trợ gì thêm không?`,
            `Tôi luôn có mặt trên hình nền của bạn! Ý tưởng "${prompt}" thật thú vị.`,
            `Cảm ơn bạn đã trò chuyện! Hãy thử nói "Thời tiết" hoặc "Đổi màu hình nền" xem nhé!`
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
}

window.aiEngine = new AIEngine();
