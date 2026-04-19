# Cross-Platform Analysis for Kiro Kantoku

**Date:** 2026-04-19
**Current Platform:** macOS only (macOS 14+)
**Target Platforms:** macOS, Windows 11, Linux

## Executive Summary

This document analyzes approaches for making Kiro Kantoku cross-platform across macOS, Windows 11, and Linux. The analysis covers UI frameworks, process management, file system abstraction, configuration storage, notifications, file watching, and build systems.

**Key Recommendation:** A hybrid approach using **SwiftCrossUI** for the GUI layer with platform-specific process management offers the best balance of code reuse, native performance, and maintainability.

---

## Table of Contents

1. [Current Architecture Analysis](#1-current-architecture-analysis)
2. [Cross-Platform GUI Frameworks](#2-cross-platform-gui-frameworks)
3. [Process Management](#3-process-management)
4. [File System Abstraction](#4-file-system-abstraction)
5. [Configuration Storage](#5-configuration-storage)
6. [Notification Systems](#6-notification-systems)
7. [File Watching Mechanisms](#7-file-watching-mechanisms)
8. [Build System & Packaging](#8-build-system--packaging)
9. [Decision Tree](#9-decision-tree)
10. [Implementation Roadmap](#10-implementation-roadmap)
11. [Risk Assessment](#11-risk-assessment)

---

## 1. Current Architecture Analysis

### 1.1 Platform-Specific Components

The current codebase uses conditional compilation (`#if os(macOS)`) extensively:

**macOS-Only Components:**
- SwiftUI views (all UI code)
- `UserNotifications` framework for notifications
- `Process` API for subprocess management
- `FSEvents` (planned) for file watching
- `UserDefaults` for settings persistence
- `NSApplication` for app lifecycle

**Already Cross-Platform:**
- Foundation networking and JSON parsing
- Data models (all use `Sendable` and Swift Concurrency)
- Business logic in Services layer (isolated with actors)

### 1.2 Dependencies

- `aptove/swift-sdk` (ACP protocol) - Pure Swift, cross-platform compatible
- SwiftUI - macOS/iOS only
- AppKit - macOS only

### 1.3 Code Organization

```
Sources/KiroKantoku/
├── App/                  # Platform-specific (SwiftUI app lifecycle)
├── Models/               # ✓ Cross-platform ready
├── Services/             # Mostly cross-platform, some Process usage
│   ├── AgentManager      # Uses Process (macOS-specific)
│   ├── ACPConnection     # Uses Process and Pipe (macOS-specific)
│   ├── GitService        # Uses Process (macOS-specific)
│   ├── NotificationManager # Uses UserNotifications (macOS-specific)
│   └── FileWatcher       # Placeholder (macOS FSEvents planned)
└── Views/                # Platform-specific (SwiftUI)
```

**Migration Complexity:**
- Models: 0% effort (already portable)
- Services: 30% effort (abstract process management, notifications)
- Views: 70% effort (requires complete UI rewrite or framework change)

---

## 2. Cross-Platform GUI Frameworks

### 2.1 SwiftCrossUI

**Description:** Pure Swift declarative UI framework inspired by SwiftUI, supporting macOS, Windows, and Linux.

**Repository:** https://github.com/stackotter/swift-cross-ui

**Architecture:**
- Declarative syntax similar to SwiftUI
- Uses platform-native widgets (AppKit on macOS, GTK on Linux, Win32 on Windows)
- Custom rendering engine with layout system
- Property wrappers like `@State`, `@Binding`

**Pros:**
- ✅ Most similar to existing SwiftUI codebase
- ✅ Pure Swift solution (no FFI to other languages)
- ✅ Native widgets on each platform
- ✅ Active development (last update: 2024)
- ✅ Smaller migration effort than alternatives
- ✅ Result builders work like SwiftUI

**Cons:**
- ❌ Limited widget set compared to SwiftUI
- ❌ No Markdown rendering built-in (would need custom implementation)
- ❌ Smaller ecosystem and community
- ❌ Less mature than SwiftUI (expect bugs)
- ❌ No native syntax highlighting components
- ❌ Documentation is minimal

**Migration Effort:** Medium (40-60 hours)

**Code Example:**
```swift
import SwiftCrossUI

struct ChatView: View {
    @State var messages: [ChatMessage] = []
    @State var inputText = ""

    var body: some View {
        VStack {
            ScrollView {
                ForEach(messages) { message in
                    MessageRow(message: message)
                }
            }
            HStack {
                TextField("Enter message...", text: $inputText)
                Button("Send") {
                    sendMessage()
                }
            }
        }
    }
}
```

**Best For:** Teams wanting to preserve Swift-only stack with SwiftUI-like syntax.

---

### 2.2 Dear ImGui (via Swift bindings)

**Description:** Immediate-mode GUI library with C++ core and Swift bindings.

**Repository:** https://github.com/ctreffs/SwiftImGui

**Architecture:**
- Immediate-mode rendering (no retained state)
- Custom rendering backend (OpenGL/Metal/Vulkan)
- Procedural API (not declarative)

**Pros:**
- ✅ Battle-tested in game development
- ✅ Excellent performance
- ✅ Built-in text editors, syntax highlighting
- ✅ Highly customizable rendering
- ✅ Works on macOS, Windows, Linux

**Cons:**
- ❌ Completely different paradigm from SwiftUI
- ❌ Requires full UI rewrite (100+ hours)
- ❌ Immediate-mode doesn't fit Swift's value semantics well
- ❌ Not native look-and-feel
- ❌ Accessibility support is poor
- ❌ No state preservation between frames

**Migration Effort:** High (100+ hours)

**Code Example:**
```swift
import ImGui

func renderChatWindow() {
    ImGui.begin("Chat")
    for message in messages {
        ImGui.text(message.content)
    }
    ImGui.inputText("Message", &inputBuffer)
    if ImGui.button("Send") {
        sendMessage()
    }
    ImGui.end()
}
```

**Best For:** Applications needing custom rendering or game-like UIs.

---

### 2.3 Qt for Swift (via CxxInterop)

**Description:** Use Qt framework from Swift via C++ interoperability.

**Repository:** Qt official + Swift C++ Interop

**Architecture:**
- Qt's signal/slot system
- QML for declarative UI (optional)
- C++ core with Swift wrappers

**Pros:**
- ✅ Mature, production-ready framework
- ✅ Native look-and-feel on all platforms
- ✅ Rich widget set (tree views, syntax highlighting, etc.)
- ✅ Excellent documentation
- ✅ Active community

**Cons:**
- ❌ Requires Qt license (LGPL or commercial)
- ❌ Large dependency (100+ MB)
- ❌ C++ interop is complex and verbose
- ❌ Build system complexity (qmake or CMake)
- ❌ Swift interop is experimental
- ❌ Alien to Swift developers

**Migration Effort:** Very High (150+ hours)

**Code Example:**
```swift
import QtWidgets

class ChatWindow: QWidget {
    let messageList = QListWidget()
    let inputField = QLineEdit()
    let sendButton = QPushButton("Send")

    override init() {
        super.init()
        setupUI()
    }
}
```

**Best For:** Enterprises needing long-term stability and commercial support.

---

### 2.4 Web-Based (Tauri + Swift backend)

**Description:** Web frontend (HTML/CSS/JS) with Swift backend via Tauri.

**Repository:** https://github.com/tauri-apps/tauri

**Architecture:**
- Webview for UI (platform-native webview)
- Swift backend communicates via IPC
- Vite/React/Vue for frontend

**Pros:**
- ✅ Rich ecosystem (npm packages, React components)
- ✅ Excellent developer experience
- ✅ Easy to build complex UIs (Markdown, syntax highlighting, etc.)
- ✅ Hot reload during development
- ✅ Small bundle size (no Chromium)

**Cons:**
- ❌ Not a Swift solution (requires JavaScript/TypeScript)
- ❌ Context switching between languages
- ❌ Webview inconsistencies across platforms
- ❌ Performance overhead for IPC
- ❌ Two build systems to manage

**Migration Effort:** Very High (200+ hours)

**Code Example:**
```typescript
// Frontend (React)
function ChatView() {
    const [messages, setMessages] = useState([]);

    const sendMessage = async (text: string) => {
        await invoke('send_message', { text });
    };

    return (
        <div className="chat">
            {messages.map(msg => <Message key={msg.id} {...msg} />)}
            <Input onSubmit={sendMessage} />
        </div>
    );
}
```

**Best For:** Teams with web development expertise or needing rapid UI iteration.

---

### 2.5 Native Approach (Separate Codebases)

**Description:** Platform-specific UIs (AppKit, WPF, GTK) with shared Swift backend.

**Architecture:**
- Shared Swift package for business logic
- Platform-specific UI code per platform
- Communication via JSON-RPC or similar

**Pros:**
- ✅ Best native experience on each platform
- ✅ Full access to platform APIs
- ✅ No framework limitations
- ✅ Optimal performance

**Cons:**
- ❌ 3x development effort for UI
- ❌ Difficult to maintain UI consistency
- ❌ Requires expertise in multiple platforms
- ❌ Feature parity challenges
- ❌ Testing complexity

**Migration Effort:** Extreme (500+ hours)

**Best For:** Large teams with dedicated platform specialists.

---

## 3. Process Management

### 3.1 Current Implementation

**macOS:** Uses `Foundation.Process` API

```swift
let process = Process()
process.executableURL = URL(fileURLWithPath: kirocliPath)
process.arguments = ["acp"]
process.standardInput = Pipe()
process.standardOutput = Pipe()
try process.run()
```

**Issues:**
- `Process` API differs between platforms
- Windows: `Process` exists but behaves differently
- Linux: `Process` available but path handling differs

### 3.2 Cross-Platform Solutions

#### Option A: SwiftSystem + Custom Process Wrapper

**Library:** https://github.com/apple/swift-system

**Approach:**
```swift
#if os(Windows)
import WinSDK
#elseif os(Linux)
import Glibc
#else
import Darwin
#endif

actor ProcessManager {
    func spawn(executable: String, args: [String]) async throws -> ProcessHandle {
        #if os(Windows)
        return try spawnWindows(executable, args)
        #elseif os(Linux)
        return try spawnLinux(executable, args)
        #else
        return try spawnMacOS(executable, args)
        #endif
    }
}
```

**Pros:**
- ✅ Full control over process lifecycle
- ✅ Can optimize per platform
- ✅ No external dependencies

**Cons:**
- ❌ Significant implementation effort
- ❌ Must handle platform quirks manually
- ❌ Windows process API is COM-based (complex)

**Effort:** High (40 hours)

---

#### Option B: Foundation.Process (with platform abstractions)

**Approach:**
```swift
actor CrossPlatformProcess {
    private var process: Process?

    func run(executable: String, args: [String]) async throws {
        let process = Process()

        #if os(Windows)
        // Windows-specific path handling
        process.executableURL = windowsExecutableURL(executable)
        #else
        process.executableURL = URL(fileURLWithPath: executable)
        #endif

        process.arguments = args
        // ... rest of setup
    }

    #if os(Windows)
    private func windowsExecutableURL(_ path: String) -> URL {
        // Handle .exe extensions, path separators
        let windowsPath = path.replacingOccurrences(of: "/", with: "\\")
        return URL(fileURLWithPath: windowsPath.hasSuffix(".exe") ? windowsPath : windowsPath + ".exe")
    }
    #endif
}
```

**Pros:**
- ✅ Moderate effort (20 hours)
- ✅ Leverages existing Foundation API
- ✅ Works on all platforms (with caveats)

**Cons:**
- ❌ Foundation.Process on Windows is less mature
- ❌ Pipe behavior differs on Windows
- ❌ Signal handling inconsistent

**Effort:** Medium (20 hours)

---

#### Option C: Swift Process Library

**Library:** https://github.com/kylef/SwiftProcess (unmaintained) or create new

**Status:** No actively maintained cross-platform Swift process library exists as of 2024.

**Recommendation:** Build custom abstraction layer.

---

### 3.3 Pipe & IPC Considerations

**macOS/Linux:** POSIX pipes work consistently

**Windows:**
- Named pipes have different API
- Anonymous pipes work but with nuances
- Consider using `CreatePipe` from Win32 API

**Recommendation:**
```swift
protocol TransportChannel {
    func write(_ data: Data) async throws
    func read() async throws -> Data
}

#if os(Windows)
class WindowsNamedPipeChannel: TransportChannel { /* Win32 implementation */ }
#else
class PosixPipeChannel: TransportChannel { /* POSIX pipes */ }
#endif
```

---

## 4. File System Abstraction

### 4.1 Current State

Uses `Foundation.FileManager` and `Foundation.URL` - both are cross-platform.

**Existing Code:**
```swift
let fileManager = FileManager.default
let path = expandedKirocliPath
var isDirectory: ObjCBool = false
guard fileManager.fileExists(atPath: path, isDirectory: &isDirectory) else {
    return false
}
```

### 4.2 Cross-Platform Considerations

**Path Separators:**
- macOS/Linux: `/`
- Windows: `\` (but Foundation handles this)

**Home Directory:**
```swift
FileManager.default.homeDirectoryForCurrentUser.path
// Works on all platforms
```

**Executable Paths:**
- macOS/Linux: `~/.local/bin/kiro-cli`
- Windows: `%LOCALAPPDATA%\kiro-cli\kiro-cli.exe`

**Solution:**
```swift
extension FileManager {
    var platformKiroCliPath: String {
        #if os(Windows)
        let localAppData = ProcessInfo.processInfo.environment["LOCALAPPDATA"] ?? ""
        return "\(localAppData)\\kiro-cli\\kiro-cli.exe"
        #else
        return "~/.local/bin/kiro-cli"
        #endif
    }
}
```

### 4.3 Recommendation

**Current Foundation APIs are sufficient** with minor platform-specific path adjustments.

**Effort:** Low (5 hours)

---

## 5. Configuration Storage

### 5.1 Current: UserDefaults (macOS-specific)

```swift
public var kirocliPath: String = UserDefaults.standard.string(forKey: "kirocliPath") ?? "~/.local/bin/kiro-cli" {
    didSet { UserDefaults.standard.set(kirocliPath, forKey: "kirocliPath") }
}
```

**Platform Locations:**
- macOS: `~/Library/Preferences/com.kiro.kantoku.plist`
- Linux: Not available
- Windows: Not available

### 5.2 Cross-Platform Alternatives

#### Option A: JSON File Storage

**Approach:**
```swift
actor SettingsManager {
    private let settingsPath: URL

    init() {
        let appSupport = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        let kiroDir = appSupport.appendingPathComponent("KiroKantoku")
        try? FileManager.default.createDirectory(at: kiroDir, withIntermediateDirectories: true)
        self.settingsPath = kiroDir.appendingPathComponent("settings.json")
    }

    func save<T: Codable>(_ settings: T) async throws {
        let data = try JSONEncoder().encode(settings)
        try data.write(to: settingsPath)
    }

    func load<T: Codable>(_ type: T.Type) async throws -> T {
        let data = try Data(contentsOf: settingsPath)
        return try JSONDecoder().decode(T.self, from: data)
    }
}
```

**Locations:**
- macOS: `~/Library/Application Support/KiroKantoku/settings.json`
- Linux: `~/.config/KiroKantoku/settings.json`
- Windows: `%APPDATA%\KiroKantoku\settings.json`

**Pros:**
- ✅ Simple to implement
- ✅ Human-readable
- ✅ Version control friendly
- ✅ Easy to debug

**Cons:**
- ❌ No automatic change notifications
- ❌ Manual file watching needed
- ❌ Concurrent write handling required

**Effort:** Low (8 hours)

---

#### Option B: SQLite Database

**Library:** Built-in to Foundation via `sqlite3`

**Approach:**
```swift
import SQLite3

actor SettingsStore {
    private let db: OpaquePointer?

    init() throws {
        let path = settingsDBPath()
        var db: OpaquePointer?
        guard sqlite3_open(path, &db) == SQLITE_OK else {
            throw SettingsError.databaseOpenFailed
        }
        self.db = db
        try createTables()
    }

    func setValue(_ value: String, forKey key: String) async throws {
        let query = "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)"
        var stmt: OpaquePointer?
        defer { sqlite3_finalize(stmt) }

        guard sqlite3_prepare_v2(db, query, -1, &stmt, nil) == SQLITE_OK else {
            throw SettingsError.prepareFailed
        }

        sqlite3_bind_text(stmt, 1, key, -1, nil)
        sqlite3_bind_text(stmt, 2, value, -1, nil)

        guard sqlite3_step(stmt) == SQLITE_DONE else {
            throw SettingsError.executeFailed
        }
    }
}
```

**Pros:**
- ✅ ACID transactions
- ✅ Complex queries if needed
- ✅ Built-in to all platforms

**Cons:**
- ❌ Overkill for simple settings
- ❌ More complex than JSON
- ❌ Binary format (not human-readable)

**Effort:** Medium (16 hours)

---

#### Option C: Platform-Specific with Abstraction

**Approach:**
```swift
protocol SettingsBackend {
    func set(_ value: String, forKey key: String) async
    func get(forKey key: String) async -> String?
}

#if os(macOS)
class UserDefaultsBackend: SettingsBackend {
    func set(_ value: String, forKey key: String) async {
        UserDefaults.standard.set(value, forKey: key)
    }

    func get(forKey key: String) async -> String? {
        UserDefaults.standard.string(forKey: key)
    }
}
#else
class JSONFileBackend: SettingsBackend {
    // Implementation from Option A
}
#endif
```

**Pros:**
- ✅ Best of both worlds
- ✅ Native experience on macOS
- ✅ Portable fallback for others

**Cons:**
- ❌ More code to maintain
- ❌ Potential behavior differences

**Effort:** Medium (12 hours)

---

### 5.3 Recommendation

**Use JSON File Storage (Option A)** for simplicity and portability.

Replace `UserDefaults` with:
```swift
@Observable
@MainActor
public final class AppSettings {
    private let settingsManager = SettingsManager()

    public var kirocliPath: String = "~/.local/bin/kiro-cli" {
        didSet { Task { await saveSettings() } }
    }

    private func saveSettings() async {
        try? await settingsManager.save(self)
    }

    public init() {
        Task {
            if let loaded = try? await settingsManager.load(AppSettings.self) {
                self.kirocliPath = loaded.kirocliPath
                // ... restore other properties
            }
        }
    }
}
```

---

## 6. Notification Systems

### 6.1 Current: UserNotifications (macOS)

```swift
@preconcurrency import UserNotifications

let center = UNUserNotificationCenter.current()
let granted = try await center.requestAuthorization(options: [.alert, .sound, .badge])
```

**Platform Availability:**
- macOS: `UserNotifications` framework
- iOS: Same framework
- Linux: Not available
- Windows: Not available

### 6.2 Cross-Platform Solutions

#### Option A: Platform-Specific Implementations

**macOS:** Continue using UserNotifications

**Linux:** libnotify (via C interop)

```swift
#if os(Linux)
import Glibc

func dlopen(_ path: String, _ mode: Int32) -> UnsafeMutableRawPointer?
func dlsym(_ handle: UnsafeMutableRawPointer?, _ symbol: String) -> UnsafeMutableRawPointer?

actor LinuxNotificationManager {
    private var libnotify: UnsafeMutableRawPointer?

    init() {
        libnotify = dlopen("libnotify.so.4", RTLD_LAZY)
        guard libnotify != nil else {
            print("Warning: libnotify not available")
            return
        }

        // Call notify_init
        if let initFunc = dlsym(libnotify, "notify_init").map({ unsafeBitCast($0, to: (@convention(c) (UnsafePointer<CChar>?) -> Bool).self) }) {
            _ = initFunc("KiroKantoku")
        }
    }

    func sendNotification(title: String, body: String) {
        guard let handle = libnotify else { return }

        // Call notify_notification_new and notify_notification_show
        // (implementation details omitted for brevity)
    }
}
#endif
```

**Windows:** Windows Toast Notifications (Win32 API)

```swift
#if os(Windows)
import WinSDK

actor WindowsNotificationManager {
    func sendNotification(title: String, body: String) {
        // Use Windows.UI.Notifications.ToastNotificationManager
        // Requires COM initialization and XML template
        // Complex implementation (50+ lines)
    }
}
#endif
```

**Pros:**
- ✅ Native experience on each platform
- ✅ Full feature access

**Cons:**
- ❌ Platform-specific code complexity
- ❌ Windows notifications are COM-based (very complex)
- ❌ Linux requires runtime dependency (libnotify)

**Effort:** High (40 hours)

---

#### Option B: In-App Notifications Only

**Approach:** Drop system notifications, show alerts within the app UI.

```swift
@MainActor
class NotificationManager {
    @Published var inAppNotifications: [InAppNotification] = []

    func notify(title: String, message: String) {
        let notification = InAppNotification(title: title, message: message, timestamp: Date())
        inAppNotifications.append(notification)

        // Auto-dismiss after 5 seconds
        Task {
            try? await Task.sleep(nanoseconds: 5_000_000_000)
            inAppNotifications.removeAll { $0.id == notification.id }
        }
    }
}

// In UI:
struct NotificationBanner: View {
    let notification: InAppNotification

    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(notification.title).bold()
                Text(notification.message).font(.caption)
            }
            Spacer()
            Button("Dismiss") { /* dismiss */ }
        }
        .padding()
        .background(Color.blue.opacity(0.1))
        .cornerRadius(8)
    }
}
```

**Pros:**
- ✅ No platform-specific code
- ✅ Consistent behavior
- ✅ Simple implementation

**Cons:**
- ❌ Only visible when app is open
- ❌ Less discoverable than system notifications
- ❌ No notification center integration

**Effort:** Low (8 hours)

---

#### Option C: Hybrid Approach

```swift
protocol NotificationBackend {
    func sendNotification(title: String, body: String) async
}

#if os(macOS)
class SystemNotificationBackend: NotificationBackend { /* UserNotifications */ }
#else
class InAppNotificationBackend: NotificationBackend { /* In-app banners */ }
#endif

@MainActor
class NotificationManager {
    private let backend: NotificationBackend

    init() {
        #if os(macOS)
        backend = SystemNotificationBackend()
        #else
        backend = InAppNotificationBackend()
        #endif
    }
}
```

**Effort:** Medium (20 hours)

---

### 6.3 Recommendation

**Use Hybrid Approach (Option C):**
- macOS: Keep UserNotifications
- Linux/Windows: In-app notifications only (for MVP)
- Later: Add native notifications per platform if needed

---

## 7. File Watching Mechanisms

### 7.1 Current State

Placeholder implementation (FSEvents intended for macOS):

```swift
actor FileWatcher {
    let watchedPath: URL

    func startWatching() async {
        // Placeholder - FSEvents implementation would go here
    }
}
```

### 7.2 Platform-Specific APIs

| Platform | Native API | Swift Availability |
|----------|-----------|-------------------|
| macOS | FSEvents | Yes (CoreServices) |
| Linux | inotify | No (requires C interop) |
| Windows | ReadDirectoryChangesW | No (Win32 API) |

### 7.3 Cross-Platform Solutions

#### Option A: Platform-Specific Implementations

**macOS (FSEvents):**
```swift
import CoreServices

actor MacOSFileWatcher {
    func watch(path: String, callback: @escaping (String) -> Void) {
        var context = FSEventStreamContext(
            version: 0,
            info: Unmanaged.passUnretained(self).toOpaque(),
            retain: nil,
            release: nil,
            copyDescription: nil
        )

        let paths = [path] as CFArray
        let stream = FSEventStreamCreate(
            kCFAllocatorDefault,
            { (streamRef, clientCallBackInfo, numEvents, eventPaths, eventFlags, eventIds) in
                // Handle events
            },
            &context,
            paths,
            FSEventStreamEventId(kFSEventStreamEventIdSinceNow),
            0.5,  // latency
            FSEventStreamCreateFlags(kFSEventStreamCreateFlagFileEvents)
        )

        FSEventStreamScheduleWithRunLoop(stream, CFRunLoopGetCurrent(), CFRunLoopMode.defaultMode.rawValue)
        FSEventStreamStart(stream)
    }
}
```

**Linux (inotify via C):**
```swift
#if os(Linux)
import Glibc

actor LinuxFileWatcher {
    private var inotifyFd: Int32 = -1

    func watch(path: String) async throws {
        inotifyFd = inotify_init()
        guard inotifyFd >= 0 else {
            throw FileWatcherError.initFailed
        }

        let wd = inotify_add_watch(inotifyFd, path, UInt32(IN_MODIFY | IN_CREATE | IN_DELETE))
        guard wd >= 0 else {
            throw FileWatcherError.watchFailed
        }

        // Poll inotifyFd in background task
        Task {
            while !Task.isCancelled {
                var buffer = [UInt8](repeating: 0, count: 1024)
                let length = read(inotifyFd, &buffer, buffer.count)
                // Parse events from buffer
            }
        }
    }
}
#endif
```

**Windows (ReadDirectoryChangesW):**
```swift
#if os(Windows)
import WinSDK

actor WindowsFileWatcher {
    func watch(path: String) async throws {
        let pathWide = path.withCString(encodedAs: UTF16.self) { $0 }
        let handle = CreateFileW(
            pathWide,
            FILE_LIST_DIRECTORY,
            FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
            nil,
            OPEN_EXISTING,
            FILE_FLAG_BACKUP_SEMANTICS | FILE_FLAG_OVERLAPPED,
            nil
        )

        // Use ReadDirectoryChangesW with completion port
        // Complex async I/O implementation
    }
}
#endif
```

**Effort:** High (60 hours)

---

#### Option B: Polling-Based Fallback

**Approach:**
```swift
actor SimpleFileWatcher {
    private var lastModified: [String: Date] = [:]

    func watch(directory: URL, onChange: @escaping ([String]) -> Void) async {
        while !Task.isCancelled {
            let changed = await checkForChanges(in: directory)
            if !changed.isEmpty {
                onChange(changed)
            }
            try? await Task.sleep(nanoseconds: 500_000_000)  // Poll every 500ms
        }
    }

    private func checkForChanges(in directory: URL) async -> [String] {
        var changedFiles: [String] = []

        guard let enumerator = FileManager.default.enumerator(at: directory, includingPropertiesForKeys: [.contentModificationDateKey]) else {
            return []
        }

        for case let fileURL as URL in enumerator {
            guard let attributes = try? FileManager.default.attributesOfItem(atPath: fileURL.path),
                  let modDate = attributes[.modificationDate] as? Date else {
                continue
            }

            let path = fileURL.path
            if let lastMod = lastModified[path], modDate > lastMod {
                changedFiles.append(path)
            }
            lastModified[path] = modDate
        }

        return changedFiles
    }
}
```

**Pros:**
- ✅ Simple, cross-platform
- ✅ No platform-specific code
- ✅ Easy to debug

**Cons:**
- ❌ Higher latency (500ms vs instant)
- ❌ CPU overhead from polling
- ❌ Doesn't scale to large directories

**Effort:** Low (12 hours)

---

#### Option C: Third-Party Library

**Candidate:** Create a Swift package wrapping native APIs

**Status:** No mature Swift file watching library exists (as of 2024).

**Options:**
1. Build one (becomes Option A)
2. Use C/C++ library via interop (e.g., `efsw`)

---

### 7.4 Recommendation

**For MVP: Polling-Based (Option B)**
- Good enough for typical use cases (monitoring project directories)
- Avoids platform complexity early on

**For v2: Platform-Specific (Option A)**
- Implement when performance/latency becomes issue
- Can be added incrementally

---

## 8. Build System & Packaging

### 8.1 Current: Swift Package Manager + Homebrew

**Build:**
```bash
swift build -c release
```

**Distribution:** Homebrew Cask (macOS only)

### 8.2 Cross-Platform Build Requirements

#### macOS
- Xcode Command Line Tools
- Code signing & notarization
- DMG or PKG installer

**Current workflow works.**

---

#### Linux

**Build Requirements:**
- Swift toolchain (swift-lang.org)
- GTK+ development libraries (if using SwiftCrossUI with GTK backend)
- System dependencies for UI

**Distribution Options:**

1. **AppImage** (recommended)
   - Self-contained bundle
   - No installation required
   - Works across distros

   ```bash
   # Build script
   swift build -c release
   linuxdeploy --executable .build/release/KiroKantoku --appdir AppDir --output appimage
   ```

2. **Snap Package**
   - Sandboxed
   - Auto-updates
   - Ubuntu/derivatives

   ```yaml
   # snapcraft.yaml
   name: kiro-kantoku
   version: '1.0.0'
   summary: AI coding agent manager
   parts:
     kiro:
       plugin: swift
       source: .
   ```

3. **Flatpak**
   - Sandboxed
   - FreeDesktop standard
   - Growing adoption

4. **Debian/RPM packages**
   - Traditional distro packages
   - Requires separate builds per distro

**Recommendation:** AppImage for initial release (easiest), add Snap/Flatpak later.

**Effort:** Medium (24 hours for AppImage setup)

---

#### Windows

**Build Requirements:**
- Swift for Windows (swift.org)
- Visual Studio Build Tools
- Windows SDK

**Build Command:**
```bash
swift build -c release --triple x86_64-unknown-windows-msvc
```

**Distribution Options:**

1. **MSI Installer** (recommended for Windows)
   - Native Windows installer
   - Add/Remove Programs integration
   - Per-user or system-wide installation

   **Tool:** WiX Toolset

   ```xml
   <!-- kiro.wxs -->
   <Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
     <Product Id="*" Name="Kiro Kantoku" Version="1.0.0" Manufacturer="Kiro" UpgradeCode="...">
       <Package InstallerVersion="500" Compressed="yes" />
       <Directory Id="TARGETDIR" Name="SourceDir">
         <Directory Id="ProgramFilesFolder">
           <Directory Id="INSTALLFOLDER" Name="KiroKantoku" />
         </Directory>
       </Directory>
       <ComponentGroup Id="ProductComponents">
         <Component Id="MainExecutable" Guid="*">
           <File Id="KiroKantoku.exe" Source=".build\release\KiroKantoku.exe" KeyPath="yes" />
         </Component>
       </ComponentGroup>
     </Product>
   </Wix>
   ```

   Build: `candle kiro.wxs && light kiro.wixobj`

2. **Portable ZIP**
   - No installation
   - Extract and run
   - Simple distribution

3. **MSIX Package**
   - Modern Windows packaging
   - Microsoft Store compatible
   - Sandboxed

**Recommendation:** Start with portable ZIP (simplest), add MSI installer for v1.0.

**Effort:** Low for ZIP (4 hours), Medium for MSI (20 hours)

---

### 8.3 CI/CD Updates

**Current:** GitHub Actions with macOS runner

**Required Changes:**

```yaml
# .github/workflows/build.yml
name: Build
on: [push, pull_request]

jobs:
  build-macos:
    runs-on: macos-15
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: swift build -c release
      - name: Test
        run: swift test
      - name: Create DMG
        run: ./scripts/create-dmg.sh
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: KiroKantoku-macOS
          path: KiroKantoku.dmg

  build-linux:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - name: Install Swift
        uses: swift-actions/setup-swift@v2
        with:
          swift-version: "6.0"
      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev  # If using SwiftCrossUI with GTK
      - name: Build
        run: swift build -c release
      - name: Test
        run: swift test
      - name: Create AppImage
        run: ./scripts/create-appimage.sh
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: KiroKantoku-Linux
          path: KiroKantoku-x86_64.AppImage

  build-windows:
    runs-on: windows-2022
    steps:
      - uses: actions/checkout@v4
      - name: Install Swift
        uses: compnerd/gha-setup-swift@main
        with:
          branch: swift-6.0-release
          tag: 6.0-RELEASE
      - name: Build
        run: swift build -c release --triple x86_64-unknown-windows-msvc
      - name: Test
        run: swift test
      - name: Package
        run: Compress-Archive -Path .build\release\KiroKantoku.exe -DestinationPath KiroKantoku-Windows.zip
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: KiroKantoku-Windows
          path: KiroKantoku-Windows.zip
```

**Effort:** Medium (16 hours to set up and debug all platforms)

---

## 9. Decision Tree

### 9.1 High-Level Strategy Decision

```
┌─────────────────────────────────────────────┐
│  What is your priority?                    │
└────────────────┬────────────────────────────┘
                 │
         ┌───────┴────────┐
         │                │
    Pure Swift        Fastest Time
    Solution          to Market
         │                │
         │                │
    ┌────▼─────┐     ┌────▼─────┐
    │SwiftCross│     │ Tauri +  │
    │   UI     │     │ Web UI   │
    └──────────┘     └──────────┘
         │                │
    Medium Effort    High Effort
    (80-120 hrs)     (200+ hrs)
```

---

### 9.2 UI Framework Decision Tree

```
                        ┌─────────────────┐
                        │ Choose UI       │
                        └────────┬────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
    Pure Swift?             Web Tech?            Native Per Platform?
          │                      │                      │
          ▼                      ▼                      ▼
   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
   │ SwiftCrossUI │      │ Tauri +      │      │ AppKit/WPF/  │
   │              │      │ React/Vue    │      │ GTK          │
   └──────────────┘      └──────────────┘      └──────────────┘
          │                      │                      │
    40-60 hrs               200+ hrs               500+ hrs
    Medium complexity       High complexity        Very High
    SwiftUI-like           Two tech stacks        Platform experts
                                                   needed
```

**Recommendation Path:**
```
Start with SwiftCrossUI
  ├─ Pros: Pure Swift, familiar syntax, moderate effort
  ├─ Cons: Less mature, smaller widget set
  └─ Fallback: If SwiftCrossUI proves insufficient, pivot to Tauri
```

---

### 9.3 Component-by-Component Decisions

| Component | Recommended Solution | Effort | Complexity |
|-----------|---------------------|--------|------------|
| **UI Framework** | SwiftCrossUI | 50h | Medium |
| **Process Management** | Foundation.Process + abstractions | 20h | Medium |
| **File System** | Foundation (works as-is) | 5h | Low |
| **Configuration** | JSON file storage | 8h | Low |
| **Notifications** | Hybrid (system on macOS, in-app elsewhere) | 20h | Medium |
| **File Watching** | Polling (MVP), native (v2) | 12h (poll) | Low |
| **Build/Package** | SPM + platform packages | 40h | Medium |
| **Testing** | Cross-platform CI/CD | 16h | Medium |

**Total Estimated Effort:** 171 hours (4-5 weeks for one developer)

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Goals:** Make non-UI components cross-platform

**Tasks:**
1. ✅ Audit all `#if os(macOS)` blocks
2. ✅ Extract platform-specific code into protocols
3. ✅ Implement ProcessManager abstraction
   ```swift
   protocol ProcessManager {
       func spawn(executable: String, args: [String]) async throws -> ProcessHandle
       func terminate(process: ProcessHandle) async
   }
   ```
4. ✅ Replace UserDefaults with JSONSettingsStore
5. ✅ Create platform-agnostic file paths helper
6. ✅ Set up cross-platform testing in CI

**Deliverable:** Business logic compiles on macOS, Linux, Windows

---

### Phase 2: UI Migration (Week 2-4)

**Goals:** Port UI to SwiftCrossUI

**Tasks:**
1. ✅ Set up SwiftCrossUI dependencies
2. ✅ Create design system (colors, fonts, spacing)
   ```swift
   enum DesignSystem {
       static let primaryColor = Color(red: 0.2, green: 0.6, blue: 1.0)
       static let spacing: CGFloat = 8
       static let cornerRadius: CGFloat = 8
   }
   ```
3. ✅ Port Models layer (already done - no changes needed)
4. ✅ Rewrite Views layer:
   - Start with simple views (settings, onboarding)
   - Then complex views (chat, code panel)
   - Finally, dashboard
5. ✅ Implement Markdown rendering (custom or library)
6. ✅ Add syntax highlighting for code diffs
7. ✅ Test on all platforms

**Deliverable:** Full UI works on macOS, Linux, Windows

---

### Phase 3: Platform Polish (Week 4-5)

**Goals:** Native packaging and polish

**Tasks:**
1. ✅ Platform-specific notifications
   - macOS: Keep UserNotifications
   - Linux: In-app banners
   - Windows: In-app banners
2. ✅ File watching
   - All platforms: Polling implementation
3. ✅ Build scripts
   - macOS: DMG creation
   - Linux: AppImage
   - Windows: ZIP distribution
4. ✅ CI/CD
   - GitHub Actions for all platforms
   - Automated release workflow
5. ✅ Platform testing
   - Smoke tests on real machines
   - Fix platform-specific bugs

**Deliverable:** Distributable packages for all platforms

---

### Phase 4: Documentation & Release (Week 5)

**Tasks:**
1. ✅ Update README with platform-specific instructions
2. ✅ Installation guides per platform
3. ✅ Known limitations documentation
4. ✅ Release v1.0-alpha for testing
5. ✅ Gather feedback
6. ✅ Bug fixes and iteration

**Deliverable:** Public cross-platform release

---

## 11. Risk Assessment

### 11.1 High Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| SwiftCrossUI missing critical widgets | High | Medium | Prototype key views first; have Tauri as backup plan |
| Windows Process API incompatibilities | High | Medium | Abstract early; test on Windows VM weekly |
| Performance issues on Linux/Windows | Medium | Low | Profile early; optimize hot paths |
| SwiftCrossUI abandoned/unmaintained | High | Low | Monitor project activity; prepare fork if needed |

---

### 11.2 Medium Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Markdown rendering complexity | Medium | Medium | Use AttributedString or web component |
| Syntax highlighting missing | Medium | High | Implement custom or use TreeSitter |
| CI/CD flakiness | Low | High | Add retries; use stable runner versions |
| Binary size bloat | Low | Medium | Strip symbols; use release optimizations |

---

### 11.3 Low Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| File path handling bugs | Low | Medium | Comprehensive path tests |
| Settings migration issues | Low | Low | Version settings schema |
| Platform-specific crash | Medium | Low | Crash reporting; beta testing |

---

## 12. Alternative Architectures Considered

### 12.1 Electron Alternative (Rejected)

**Why Rejected:**
- Bundle size (100+ MB for Chromium)
- Not a Swift solution
- Performance overhead
- Memory usage

---

### 12.2 Server-Client Split (Rejected)

**Architecture:**
- Swift backend as service
- Thin UI client (web or native)

**Why Rejected:**
- Adds deployment complexity
- Network latency for local operations
- Overkill for desktop app
- Complicates subprocess management

---

### 12.3 Rust Rewrite (Rejected)

**Why Rejected:**
- Complete rewrite (1000+ hours)
- Loses Swift SDK integration
- Team expertise in Swift, not Rust
- Not aligned with project goals

---

## 13. Success Metrics

**Definition of Success:**

1. ✅ Application runs on macOS, Windows 11, Linux
2. ✅ 90%+ feature parity across platforms
3. ✅ No major performance regressions
4. ✅ Installation size < 50 MB per platform
5. ✅ Startup time < 3 seconds
6. ✅ Passes automated tests on all platforms
7. ✅ Community feedback >= 7/10 satisfaction

---

## 14. Appendix: Code Samples

### 14.1 Cross-Platform App Entry Point

```swift
// KiroKantokuApp.swift
#if os(macOS)
import AppKit
#elseif os(Linux)
import Glibc
#elseif os(Windows)
import WinSDK
#endif

import SwiftCrossUI

@main
struct KiroKantokuApp: App {
    init() {
        #if os(macOS)
        NSApplication.shared.setActivationPolicy(.regular)
        #endif
    }

    @State private var agentManager = AgentManager()
    @State private var appStateManager = AppStateManager()
    @State private var appSettings = AppSettings()
    @State private var taskManager = TaskManager()

    var body: some Scene {
        WindowGroup("Kiro Kantoku") {
            Group {
                if appSettings.hasCompletedOnboarding {
                    MainView()
                } else {
                    OnboardingView()
                }
            }
            .environment(agentManager)
            .environment(appStateManager)
            .environment(appSettings)
            .environment(taskManager)
            .onAppear {
                setupServices()
            }
        }
    }

    private func setupServices() {
        agentManager.kirocliPath = appSettings.expandedKirocliPath
        taskManager.agentManager = agentManager
        taskManager.appStateManager = appStateManager
        taskManager.appSettings = appSettings

        Task {
            await killOwnedProcesses()
            let entries = await appStateManager.persistedTaskEntries
            await taskManager.restoreTasks(from: entries)
        }
    }
}
```

---

### 14.2 Platform Process Abstraction

```swift
// ProcessManager.swift
protocol ProcessManager: Actor {
    associatedtype Handle: ProcessHandle

    func spawn(executable: String, args: [String], environment: [String: String]) async throws -> Handle
    func write(to process: Handle, data: Data) async throws
    func read(from process: Handle) async throws -> Data
    func terminate(process: Handle) async
    func waitForExit(process: Handle) async throws -> Int32
}

protocol ProcessHandle: Sendable {
    var processId: Int32 { get }
    var isRunning: Bool { get }
}

#if os(macOS) || os(Linux)
actor UnixProcessManager: ProcessManager {
    struct UnixHandle: ProcessHandle {
        let process: Process
        var processId: Int32 { process.processIdentifier }
        var isRunning: Bool { process.isRunning }
    }

    func spawn(executable: String, args: [String], environment: [String: String]) async throws -> UnixHandle {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: executable)
        process.arguments = args
        process.environment = environment
        try process.run()
        return UnixHandle(process: process)
    }

    // ... implement other methods
}
#endif

#if os(Windows)
actor WindowsProcessManager: ProcessManager {
    struct WindowsHandle: ProcessHandle {
        let processId: Int32
        let handle: HANDLE
        var isRunning: Bool {
            var exitCode: DWORD = 0
            GetExitCodeProcess(handle, &exitCode)
            return exitCode == STILL_ACTIVE
        }
    }

    func spawn(executable: String, args: [String], environment: [String: String]) async throws -> WindowsHandle {
        // Windows CreateProcess implementation
        var si = STARTUPINFOW()
        var pi = PROCESS_INFORMATION()

        let cmdLine = ([executable] + args).joined(separator: " ")
        let success = cmdLine.withCString(encodedAs: UTF16.self) { cmdLinePtr in
            CreateProcessW(
                nil,  // lpApplicationName
                UnsafeMutablePointer(mutating: cmdLinePtr),  // lpCommandLine
                nil,  // lpProcessAttributes
                nil,  // lpThreadAttributes
                false,  // bInheritHandles
                0,  // dwCreationFlags
                nil,  // lpEnvironment
                nil,  // lpCurrentDirectory
                &si,  // lpStartupInfo
                &pi   // lpProcessInformation
            )
        }

        guard success else {
            throw ProcessError.spawnFailed
        }

        CloseHandle(pi.hThread)
        return WindowsHandle(processId: Int32(pi.dwProcessId), handle: pi.hProcess)
    }

    // ... implement other methods
}
#endif
```

---

### 14.3 Cross-Platform Settings Store

```swift
// SettingsManager.swift
actor SettingsManager {
    private let settingsURL: URL

    init() {
        let appSupport: URL
        #if os(macOS)
        appSupport = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        #elseif os(Linux)
        let home = FileManager.default.homeDirectoryForCurrentUser
        appSupport = home.appendingPathComponent(".config")
        #elseif os(Windows)
        let appData = ProcessInfo.processInfo.environment["APPDATA"] ?? ""
        appSupport = URL(fileURLWithPath: appData)
        #endif

        let kiroDir = appSupport.appendingPathComponent("KiroKantoku")
        try? FileManager.default.createDirectory(at: kiroDir, withIntermediateDirectories: true)
        self.settingsURL = kiroDir.appendingPathComponent("settings.json")
    }

    func save<T: Codable>(_ settings: T) async throws {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        let data = try encoder.encode(settings)
        try data.write(to: settingsURL, options: .atomic)
    }

    func load<T: Codable>(_ type: T.Type) async throws -> T {
        let data = try Data(contentsOf: settingsURL)
        return try JSONDecoder().decode(T.self, from: data)
    }
}

// Usage in AppSettings
@Observable
@MainActor
public final class AppSettings: Codable {
    private let manager = SettingsManager()

    public var kirocliPath: String = "" {
        didSet { save() }
    }

    private func save() {
        Task { try? await manager.save(self) }
    }

    public init() {
        Task {
            if let loaded = try? await manager.load(AppSettings.self) {
                self.kirocliPath = loaded.kirocliPath
                // ... other properties
            }
        }
    }
}
```

---

## 15. Conclusion

**Recommended Approach:**

1. **UI:** SwiftCrossUI (pure Swift, SwiftUI-like, moderate effort)
2. **Process Management:** Foundation.Process with platform abstractions
3. **File System:** Foundation APIs (work as-is)
4. **Settings:** JSON file storage
5. **Notifications:** Hybrid (native on macOS, in-app elsewhere)
6. **File Watching:** Polling for MVP
7. **Packaging:** AppImage (Linux), ZIP (Windows), DMG (macOS)

**Timeline:** 4-5 weeks for full cross-platform support

**Total Effort:** ~170 hours

**Next Steps:**
1. Prototype chat view in SwiftCrossUI (validate approach)
2. Set up Windows/Linux CI runners
3. Implement ProcessManager abstraction
4. Begin incremental migration

---

**Document Version:** 1.0
**Last Updated:** 2026-04-19
**Author:** Cross-Platform Analysis for Kiro Kantoku
