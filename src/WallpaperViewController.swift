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
    
    // MARK: - WKNavigationDelegate
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        print("[WallpaperViewController] Web View finished loading. Scanning images directory...")
        scanAndSendGalleryImages()
    }
    
    func scanAndSendGalleryImages() {
        let fileManager = FileManager.default
        let currentDir = fileManager.currentDirectoryPath
        let bundleParentDir = URL(fileURLWithPath: Bundle.main.bundlePath).deletingLastPathComponent().path
        
        // 1. Locate source images directory
        let searchDirectories = [
            (bundleParentDir as NSString).appendingPathComponent("images"),
            (currentDir as NSString).appendingPathComponent("images")
        ]
        
        var sourceImagesDir: String? = nil
        for dir in searchDirectories {
            if fileManager.fileExists(atPath: dir) {
                sourceImagesDir = dir
                break
            }
        }
        
        // 2. Locate target web/images directory
        var webImagesDir = (bundleParentDir as NSString).appendingPathComponent("web/images")
        if let bundleResPath = Bundle.main.resourcePath {
            let resWebImages = (bundleResPath as NSString).appendingPathComponent("web/images")
            if fileManager.fileExists(atPath: resWebImages) {
                webImagesDir = resWebImages
            }
        }
        if !fileManager.fileExists(atPath: webImagesDir) {
            webImagesDir = (currentDir as NSString).appendingPathComponent("web/images")
        }
        
        try? fileManager.createDirectory(atPath: webImagesDir, withIntermediateDirectories: true, attributes: nil)
        
        let validExtensions = Set(["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp"])
        var relativeImagePaths: [String] = []
        var processedFileNames = Set<String>()
        
        let processDirectory = { (dirPath: String) in
            if let files = try? fileManager.contentsOfDirectory(atPath: dirPath) {
                let sortedFiles = files.sorted()
                for file in sortedFiles {
                    if file.hasPrefix(".") { continue } // Ignore hidden files
                    let ext = (file as NSString).pathExtension.lowercased()
                    let lowerName = file.lowercased()
                    
                    if validExtensions.contains(ext) && !processedFileNames.contains(lowerName) {
                        processedFileNames.insert(lowerName)
                        
                        let srcPath = (dirPath as NSString).appendingPathComponent(file)
                        let destPath = (webImagesDir as NSString).appendingPathComponent(file)
                        
                        // Copy file to web/images if not already there
                        if srcPath != destPath && !fileManager.fileExists(atPath: destPath) {
                            try? fileManager.copyItem(atPath: srcPath, toPath: destPath)
                        }
                        
                        // Use relative path for WebKit security compliance
                        let relativePath = "images/" + file
                        relativeImagePaths.append(relativePath)
                    }
                }
            }
        }
        
        if let srcDir = sourceImagesDir {
            processDirectory(srcDir)
        }
        processDirectory(webImagesDir)
        
        print("[WallpaperViewController] Successfully scanned & synced \(relativeImagePaths.count) unique images for WebKit.")
        
        if let jsonData = try? JSONSerialization.data(withJSONObject: relativeImagePaths),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            let js = "if (window.spatial3DSlider) { window.spatial3DSlider.loadCustomImages(\(jsonString)); }"
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                self.webView.evaluateJavaScript(js, completionHandler: nil)
            }
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
