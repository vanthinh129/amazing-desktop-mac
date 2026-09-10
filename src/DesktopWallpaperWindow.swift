import Cocoa
import WebKit

class DesktopWallpaperWindow: NSWindow {
    
    init(contentRect: NSRect) {
        super.init(
            contentRect: contentRect,
            styleMask: [.borderless],
            backing: .buffered,
            defer: false
        )
        
        // Configure Desktop Wallpaper window level just above system wallpaper
        let desktopLevel = CGWindowLevelForKey(.desktopWindow)
        self.level = NSWindow.Level(Int(desktopLevel) + 1)
        self.backgroundColor = .clear
        self.isOpaque = false
        self.hasShadow = false
        self.hidesOnDeactivate = false
        self.canHide = false
        self.isReleasedWhenClosed = false
        
        // Enable wallpaper behavior across spaces & mission control
        self.collectionBehavior = [
            .canJoinAllSpaces,
            .stationary,
            .ignoresCycle
        ]
        
        // Default to interactive mode so users can click web buttons, mic, and settings
        self.ignoresMouseEvents = false
    }
    
    func setInteractive(_ interactive: Bool) {
        if interactive {
            // Level .normal allows macOS WindowServer to dispatch mouse click events to WKWebView
            self.level = .normal
            self.ignoresMouseEvents = false
            self.makeKeyAndOrderFront(nil)
            NSApp.activate(ignoringOtherApps: true)
        } else {
            // Desktop level puts window behind icons and ignores mouse events for file selection
            let desktopLevel = CGWindowLevelForKey(.desktopWindow)
            self.level = NSWindow.Level(Int(desktopLevel) + 1)
            self.ignoresMouseEvents = true
            self.orderFrontRegardless()
        }
    }

    override var canBecomeKey: Bool {
        return true
    }

    override var canBecomeMain: Bool {
        return true
    }

    func setWallpaperLayer(_ layerType: String) {
        if layerType == "desktop" {
            let desktopLevel = CGWindowLevelForKey(.desktopWindow)
            self.level = NSWindow.Level(Int(desktopLevel) + 1)
        } else if layerType == "normal" {
            self.level = .normal
        } else if layerType == "floating" {
            self.level = .floating
        }
        self.orderFrontRegardless()
    }
}
