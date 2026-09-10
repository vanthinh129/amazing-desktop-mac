import Cocoa
import WebKit

class AppDelegate: NSObject, NSApplicationDelegate {
    
    var wallpaperWindow: DesktopWallpaperWindow!
    var wallpaperVC: WallpaperViewController!
    var statusItem: NSStatusItem!
    var isInteractive: Bool = true
    
    func applicationDidFinishLaunching(_ notification: Notification) {
        // Set application activation policy to accessory (runs as menu bar app, no dock icon)
        NSApp.setActivationPolicy(.accessory)
        
        setupWallpaperWindow()
        setupMenuBar()
    }
    
    func setupWallpaperWindow() {
        guard let mainScreen = NSScreen.main else { return }
        let screenFrame = mainScreen.frame
        
        wallpaperWindow = DesktopWallpaperWindow(contentRect: screenFrame)
        wallpaperVC = WallpaperViewController()
        
        wallpaperWindow.contentViewController = wallpaperVC
        wallpaperWindow.setFrame(screenFrame, display: true)
        
        // Apply interactive mode (adjusts window level to receive mouse events)
        wallpaperWindow.setInteractive(isInteractive)
        
        print("[AmazingDesktop] Wallpaper Window initialized on screen: \(screenFrame), interactive: \(isInteractive)")
        fflush(stdout)
    }
    
    func setupMenuBar() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        
        if let button = statusItem.button {
            button.title = "🤖 Wallpaper"
        }
        
        let menu = NSMenu()
        
        // Toggle Interactivity Menu Item
        let interactiveItem = NSMenuItem(
            title: "⚡ Cho phép tương tác chuột (Clickable)",
            action: #selector(toggleInteractivity(_:)),
            keyEquivalent: "i"
        )
        interactiveItem.target = self
        interactiveItem.state = isInteractive ? .on : .off
        menu.addItem(interactiveItem)
        
        menu.addItem(NSMenuItem.separator())
        
        // Window Layer Selection Submenu
        let layerMenuItem = NSMenuItem(title: "🪟 Chế độ hiển thị Cửa sổ", action: nil, keyEquivalent: "")
        let layerMenu = NSMenu()
        
        let desktopLayerItem = NSMenuItem(title: "Hình nền Desktop (Dưới Icon)", action: #selector(selectLayerDesktop(_:)), keyEquivalent: "")
        desktopLayerItem.target = self
        layerMenu.addItem(desktopLayerItem)
        
        let normalLayerItem = NSMenuItem(title: "Cửa sổ Thường (Normal Window)", action: #selector(selectLayerNormal(_:)), keyEquivalent: "")
        normalLayerItem.target = self
        layerMenu.addItem(normalLayerItem)

        let floatingLayerItem = NSMenuItem(title: "Nổi trên cùng (Always on Top)", action: #selector(selectLayerFloating(_:)), keyEquivalent: "")
        floatingLayerItem.target = self
        layerMenu.addItem(floatingLayerItem)
        
        layerMenuItem.submenu = layerMenu
        menu.addItem(layerMenuItem)
        
        menu.addItem(NSMenuItem.separator())
        
        // Mic Listen Toggle
        let micItem = NSMenuItem(
            title: "🎤 Bật/Tắt Micro nghe AI",
            action: #selector(toggleMic(_:)),
            keyEquivalent: "m"
        )
        micItem.target = self
        menu.addItem(micItem)
        
        // Theme Submenu
        let themeMenuItem = NSMenuItem(title: "🎨 Đổi chủ đề hình nền", action: nil, keyEquivalent: "")
        let themeMenu = NSMenu()
        
        let cyanItem = NSMenuItem(title: "Cyber Cyan", action: #selector(selectThemeCyan(_:)), keyEquivalent: "")
        cyanItem.target = self
        themeMenu.addItem(cyanItem)
        
        let purpleItem = NSMenuItem(title: "Deep Purple", action: #selector(selectThemePurple(_:)), keyEquivalent: "")
        purpleItem.target = self
        themeMenu.addItem(purpleItem)
        
        let emeraldItem = NSMenuItem(title: "Emerald Aurora", action: #selector(selectThemeEmerald(_:)), keyEquivalent: "")
        emeraldItem.target = self
        themeMenu.addItem(emeraldItem)
        
        let sunsetItem = NSMenuItem(title: "Neon Sunset", action: #selector(selectThemeSunset(_:)), keyEquivalent: "")
        sunsetItem.target = self
        themeMenu.addItem(sunsetItem)
        
        themeMenuItem.submenu = themeMenu
        menu.addItem(themeMenuItem)
        
        menu.addItem(NSMenuItem.separator())
        
        // Reload Menu Item
        let reloadItem = NSMenuItem(
            title: "🔄 Tải lại Web Wallpaper",
            action: #selector(reloadWallpaper(_:)),
            keyEquivalent: "r"
        )
        reloadItem.target = self
        menu.addItem(reloadItem)
        
        menu.addItem(NSMenuItem.separator())
        
        // Quit Menu Item
        let quitItem = NSMenuItem(
            title: "🚪 Thoát AmazingDesktop",
            action: #selector(quitApp(_:)),
            keyEquivalent: "q"
        )
        quitItem.target = self
        menu.addItem(quitItem)
        
        statusItem.menu = menu
    }
    
    // MARK: - Actions
    @objc func toggleInteractivity(_ sender: NSMenuItem) {
        isInteractive.toggle()
        sender.state = isInteractive ? .on : .off
        wallpaperWindow.setInteractive(isInteractive)
        print("[AmazingDesktop] Mouse Interactivity set to: \(isInteractive)")
        fflush(stdout)
    }

    @objc func selectLayerDesktop(_ sender: NSMenuItem) {
        wallpaperWindow.setWallpaperLayer("desktop")
    }
    @objc func selectLayerNormal(_ sender: NSMenuItem) {
        wallpaperWindow.setWallpaperLayer("normal")
    }
    @objc func selectLayerFloating(_ sender: NSMenuItem) {
        wallpaperWindow.setWallpaperLayer("floating")
    }
    
    @objc func toggleMic(_ sender: NSMenuItem) {
        wallpaperVC.sendToJS(command: "toggleMic")
    }
    
    @objc func selectThemeCyan(_ sender: NSMenuItem) {
        wallpaperVC.sendToJS(command: "setTheme", data: "theme-cyan")
    }
    @objc func selectThemePurple(_ sender: NSMenuItem) {
        wallpaperVC.sendToJS(command: "setTheme", data: "theme-purple")
    }
    @objc func selectThemeEmerald(_ sender: NSMenuItem) {
        wallpaperVC.sendToJS(command: "setTheme", data: "theme-emerald")
    }
    @objc func selectThemeSunset(_ sender: NSMenuItem) {
        wallpaperVC.sendToJS(command: "setTheme", data: "theme-sunset")
    }
    
    @objc func reloadWallpaper(_ sender: NSMenuItem) {
        wallpaperVC.loadLocalWebWallpaper()
    }
    
    @objc func quitApp(_ sender: NSMenuItem) {
        NSApp.terminate(nil)
    }
}

// App Entry Point
let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
