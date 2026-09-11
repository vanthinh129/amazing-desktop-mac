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
                console.warn("Gemini API Error:", err);
                return `Kết nối Gemini API thất bại (${err.message || 'Lỗi API Key'}). Vui lòng kiểm tra lại Key trong ⚙️ Cài đặt!`;
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
        const systemInstruction = "Bạn là AI Companion thân thiện, tinh tế và quan tâm trên hình nền máy tính macOS của người dùng. Hãy trả lời trực tiếp, ân cần và hữu ích bằng tiếng Việt tự nhiên (tối đa 2-3 câu). Khi người dùng chia sẻ về sức khỏe, cảm xúc hay thắc mắc, hãy lắng nghe và đưa ra lời khuyên thiết thực.";
        
        const models = ['gemini-flash-latest', 'gemini-3.6-flash', 'gemini-flash-lite-latest', 'gemini-pro-latest', 'gemini-2.5-flash-lite', 'gemini-1.5-flash'];
        let lastError = null;

        for (const model of models) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
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

                if (response.ok) {
                    const data = await response.json();
                    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (replyText) return replyText;
                } else {
                    const errData = await response.json().catch(() => ({}));
                    const errMsg = errData.error?.message || `Lỗi HTTP ${response.status}`;
                    lastError = new Error(`${errMsg}`);
                }
            } catch (err) {
                lastError = err;
            }
        }
        
        throw lastError || new Error("Không thể kết nối máy chủ Gemini");
    }

    generateOfflineResponse(prompt) {
        const lower = prompt.toLowerCase();
        const now = new Date();

        // 1. Health & Physical Care Queries
        if (lower.includes('đau bụng') || lower.includes('xót bụng') || lower.includes('đau dạ dày')) {
            return `Ôi bạn bị đau bụng à? Hãy chườm ấm bụng, uống một ly nước ấm hoặc trà gừng và nằm nghỉ ngơi nhé. Nếu cơn đau dữ dội hoặc kéo dài, hãy đi khám bác sĩ ngay bạn nhé!`;
        }

        if (lower.includes('đau đầu') || lower.includes('chóng mặt') || lower.includes('nhức đầu')) {
            return `Bạn bị đau đầu à? Hãy tạm rời màn hình máy tính, nhắm mắt nghỉ ngơi 10 phút, uống đủ nước và massage nhẹ vùng thái dương xem sao nhé!`;
        }

        if (lower.includes('mệt') || lower.includes('oải') || lower.includes('kiệt sức') || lower.includes('stress') || lower.includes('căng thẳng')) {
            return `Làm việc nhiều trên máy tính dễ mệt mỏi lắm. Bạn hít thở sâu vài nhịp, đứng dậy vươn vai và uống một ngụm nước nhé. Tôi luôn ở đây đồng hành cùng bạn!`;
        }

        if (lower.includes('buồn ngủ') || lower.includes('buồn ngủ quá') || lower.includes('ngủ gật')) {
            return `Nếu buồn ngủ quá, bạn hãy đi rửa mặt bằng nước lạnh hoặc pha một ly trà/cà phê nhẹ. Hoặc chớp mắt ngủ trưa ngắn 15 phút sẽ hồi phục năng lượng rất nhanh đấy!`;
        }

        // 2. Advice & Asking What To Do ("làm sao", "phải làm gì")
        if (lower.includes('làm sao') || lower.includes('phải làm gì') || lower.includes('nên làm gì')) {
            return `Nếu bạn gặp vấn đề sức khỏe hoặc công việc, hãy tạm dừng lại nghỉ ngơi một chút, lắng nghe cơ thể mình và giải quyết từng bước một nhé!`;
        }

        // 3. Weather queries (Check weather before date because "thời tiết hôm nay" contains "hôm nay")
        if (lower.includes('thời tiết')) {
            return `Hôm nay trời mát mẻ, nhiệt độ khoảng 27°C, rất thích hợp để tập trung làm việc và sáng tạo!`;
        }

        // 4. Date and Time queries
        if (lower.includes('mấy giờ') || lower.includes('thời gian') || lower.includes('bây giờ')) {
            const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            return `Bây giờ là ${timeStr}. Chúc bạn làm việc thật hiệu quả trên Macbook!`;
        }

        if (lower.includes('ngày mấy') || lower.includes('thứ mấy') || lower.includes('ngày bao nhiêu') || (lower.includes('hôm nay') && (lower.includes('ngày') || lower.includes('thứ') || lower.length < 15))) {
            const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            return `Hôm nay là ${dateStr}.`;
        }

        // 5. Who are you / Capabilities
        if (lower.includes('bạn là ai') || lower.includes('giới thiệu') || lower.includes('tên gì')) {
            return `Tôi là AI Companion - Trợ lý thông minh giao diện Web Live Wallpaper trên macOS của bạn! Tôi có thể lắng nghe giọng nói, chuyện trò và làm đẹp cho hình nền của bạn.`;
        }

        // 6. Stories or fun interactions
        if (lower.includes('kể chuyện') || lower.includes('câu chuyện') || lower.includes('truyện')) {
            const stories = [
                "Ngày xửa ngày xưa, có một dòng code nhỏ ước mơ trở thành ứng dụng AI tuyệt vời trên macOS. Sau nhiều lần nỗ lực compile, dòng code đó đã biến thành tôi ngày hôm nay!",
                "Một người lập trình đi vào quán cà phê và gọi: 'Cho tôi một ly cà phê không có bug!'. Phục vụ mỉm cười trả lời: 'Dạ, chúng em chỉ có cà phê nguyên chất, không bug thì phải tự sửa ạ!'."
            ];
            return stories[Math.floor(Math.random() * stories.length)];
        }

        // 7. Greeting
        if (lower.includes('chào') || lower.includes('hello') || lower.includes('hi')) {
            return `Xin chào bạn! Rất vui được đồng hành cùng bạn trên chiếc Macbook này. Hãy nói hoặc nhập câu hỏi nhé!`;
        }

        // General empathetic offline fallbacks
        const fallbacks = [
            `Tôi đã nghe câu hỏi "${prompt}" của bạn. Bạn hãy nghỉ ngơi chút nhé! (Mẹo: Nhập Gemini API Key trong icon ⚙️ Cài đặt để AI trả lời chi tiết mọi chủ đề).`,
            `Tôi luôn có mặt trên hình nền để đồng hành cùng bạn! Bạn có cần tôi bật nhạc hay giúp gì không?`,
            `Cảm ơn bạn đã trò chuyện! Đừng quên giữ gìn sức khỏe khi làm việc với Macbook nhé!`
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
}

window.aiEngine = new AIEngine();
