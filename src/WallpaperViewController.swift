import Cocoa
import WebKit

class WallpaperViewController: NSViewController, WKUIDelegate, WKNavigationDelegate, WKScriptMessageHandler {
    
    var webView: WKWebView!
    
    override func loadView() {
        let config = WKWebViewConfiguration()
        
        // Allow media autoplay without user gesture
        config.mediaTypesRequiringUserActionForPlayback = []
        
        // Add JS script message handler
        let contentController = WKUserContentController()
        contentController.add(self, name: "nativeBridge")
        config.userContentController = contentController
        
        webView = WKWebView(frame: .zero, configuration: config)
        webView.uiDelegate = self
        webView.navigationDelegate = self
        webView.setValue(false, forKey: "drawsBackground") // Transparent WKWebView background
        
        self.view = webView
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        loadLocalWebWallpaper()
    }
    
    func loadLocalWebWallpaper() {
        var htmlURL: URL? = nil
        var webDirURL: URL? = nil
        
        // 1. Check Bundle resource path
        if let bundleResPath = Bundle.main.resourcePath {
            let bundleHtmlPath = (bundleResPath as NSString).appendingPathComponent("web/index.html")
            if FileManager.default.fileExists(atPath: bundleHtmlPath) {
                htmlURL = URL(fileURLWithPath: bundleHtmlPath)
                webDirURL = URL(fileURLWithPath: (bundleResPath as NSString).appendingPathComponent("web"))
            }
        }
        
        // 2. Check current working directory
        if htmlURL == nil {
            let currentDir = FileManager.default.currentDirectoryPath
            let htmlPath = (currentDir as NSString).appendingPathComponent("web/index.html")
            if FileManager.default.fileExists(atPath: htmlPath) {
                htmlURL = URL(fileURLWithPath: htmlPath)
                webDirURL = URL(fileURLWithPath: (currentDir as NSString).appendingPathComponent("web"))
            }
        }
        
        if let targetURL = htmlURL, let accessURL = webDirURL {
            webView.loadFileURL(targetURL, allowingReadAccessTo: accessURL)
            print("[WallpaperViewController] Loaded web wallpaper from: \(targetURL.path)")
        } else {
            print("[WallpaperViewController] ERROR: web/index.html not found!")
        }
    }
    
    // MARK: - WKUIDelegate (Microphone & Camera Permissions)
    @available(macOS 12.0, *)
    func webView(
        _ webView: WKWebView,
        requestMediaCapturePermissionFor origin: WKSecurityOrigin,
        initiatedByFrame frame: WKFrameInfo,
        type: WKMediaCaptureType,
        decisionHandler: @escaping (WKPermissionDecision) -> Void
    ) {
        // Auto-grant Microphone permission for AI character listening
        decisionHandler(.grant)
    }
    
    // MARK: - WKScriptMessageHandler
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "nativeBridge", let body = message.body as? [String: Any] {
            print("[NativeBridge] Message received from JS:", body)
        }
    }
    
    func sendToJS(command: String, data: String = "") {
        let js = "if (window.onNativeCommand) { window.onNativeCommand('\(command)', '\(data)'); }"
        webView.evaluateJavaScript(js, completionHandler: nil)
    }
}
