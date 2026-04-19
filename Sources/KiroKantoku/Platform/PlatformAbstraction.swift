import Foundation

/// Platform-agnostic abstractions for OS-specific functionality
/// This file provides interfaces and implementations for cross-platform support

// MARK: - Platform Detection

public enum Platform {
    case macOS
    case linux
    case windows

    public static var current: Platform {
        #if os(macOS)
        return .macOS
        #elseif os(Linux)
        return .linux
        #elseif os(Windows)
        return .windows
        #else
        fatalError("Unsupported platform")
        #endif
    }
}

// MARK: - Process Management Protocol

/// Protocol for platform-agnostic process execution
public protocol ProcessExecutor: Sendable {
    /// Spawn a new process with the given executable and arguments
    func spawn(
        executable: String,
        arguments: [String],
        environment: [String: String]?,
        workingDirectory: String?
    ) async throws -> ProcessHandle
}

/// Handle to a running process
public protocol ProcessHandle: Sendable {
    /// Process identifier
    var processId: Int32 { get }

    /// Read from stdout
    func readStdout() async throws -> Data

    /// Write to stdin
    func writeStdin(_ data: Data) async throws

    /// Read from stderr
    func readStderr() async throws -> Data

    /// Wait for process to exit
    func waitForExit() async throws -> Int32

    /// Terminate the process
    func terminate() async throws

    /// Check if process is still running
    var isRunning: Bool { get async }

    /// Stream of stdout data chunks
    var stdout: AsyncStream<Data> { get }

    /// Stream of stderr data chunks
    var stderr: AsyncStream<Data> { get }

    /// Check if process has exited
    var hasExited: Bool { get }
}

// MARK: - Configuration Storage Protocol

/// Protocol for platform-agnostic configuration storage
public protocol ConfigurationStore: Sendable {
    /// Get a string value for the given key
    func getString(_ key: String) async -> String?

    /// Set a string value for the given key
    func setString(_ key: String, value: String) async throws

    /// Get an integer value for the given key
    func getInt(_ key: String) async -> Int?

    /// Set an integer value for the given key
    func setInt(_ key: String, value: Int) async throws

    /// Get a boolean value for the given key
    func getBool(_ key: String) async -> Bool?

    /// Set a boolean value for the given key
    func setBool(_ key: String, value: Bool) async throws

    /// Get a double value for the given key
    func getDouble(_ key: String) async -> Double?

    /// Set a double value for the given key
    func setDouble(_ key: String, value: Double) async throws

    /// Remove a value for the given key
    func remove(_ key: String) async throws

    /// Save all pending changes to disk
    func synchronize() async throws
}

// MARK: - Notification Protocol

/// Protocol for platform-agnostic system notifications
public protocol NotificationService: Sendable {
    /// Request permission to show notifications
    func requestAuthorization() async throws -> Bool

    /// Show a notification with the given title and body
    func showNotification(title: String, body: String, identifier: String) async throws

    /// Remove a notification by identifier
    func removeNotification(identifier: String) async throws

    /// Remove all notifications
    func removeAllNotifications() async throws
}

// MARK: - File Watching Protocol

/// Protocol for platform-agnostic file watching
public protocol FileWatcher: Sendable {
    /// Start watching a directory for changes
    func watch(path: String) async throws

    /// Stop watching
    func stop() async throws

    /// Stream of file change events
    var events: AsyncStream<FileChangeEvent> { get }
}

public struct FileChangeEvent: Sendable {
    public enum EventType: Sendable {
        case created
        case modified
        case deleted
    }

    public let path: String
    public let type: EventType
}

// MARK: - Platform Paths

/// Platform-specific standard paths
public struct PlatformPaths {
    /// Home directory for the current user
    public static var homeDirectory: String {
        #if os(Windows)
        return ProcessInfo.processInfo.environment["USERPROFILE"] ?? ""
        #else
        return FileManager.default.homeDirectoryForCurrentUser.path
        #endif
    }

    /// Application support directory
    public static var applicationSupportDirectory: String {
        #if os(macOS)
        return "\(homeDirectory)/Library/Application Support"
        #elseif os(Linux)
        return ProcessInfo.processInfo.environment["XDG_CONFIG_HOME"] ?? "\(homeDirectory)/.config"
        #elseif os(Windows)
        return ProcessInfo.processInfo.environment["APPDATA"] ?? "\(homeDirectory)\\AppData\\Roaming"
        #else
        return homeDirectory
        #endif
    }

    /// Temporary directory
    public static var temporaryDirectory: String {
        #if os(Windows)
        return ProcessInfo.processInfo.environment["TEMP"] ?? ""
        #else
        return FileManager.default.temporaryDirectory.path
        #endif
    }

    /// Path separator for the current platform
    public static var pathSeparator: String {
        #if os(Windows)
        return "\\"
        #else
        return "/"
        #endif
    }

    /// Expand tilde in path
    public static func expandTilde(_ path: String) -> String {
        if path.hasPrefix("~") {
            return path.replacingOccurrences(of: "~", with: homeDirectory, options: .anchored)
        }
        return path
    }
}
