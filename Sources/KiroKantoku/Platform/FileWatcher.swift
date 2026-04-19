import Foundation

// MARK: - Polling-Based File Watcher (Cross-Platform)

/// Simple polling-based file watcher that works on all platforms
/// Checks for file changes at regular intervals
public actor PollingFileWatcher: FileWatcher {
    private let watchedPath: String
    private let pollInterval: TimeInterval
    private var isWatching = false
    private var watchTask: Task<Void, Never>?
    private var lastModificationTimes: [String: Date] = [:]

    private let eventsContinuation: AsyncStream<FileChangeEvent>.Continuation
    public let events: AsyncStream<FileChangeEvent>

    public init(pollInterval: TimeInterval = 0.5) {
        self.watchedPath = ""
        self.pollInterval = pollInterval

        var continuation: AsyncStream<FileChangeEvent>.Continuation!
        self.events = AsyncStream { continuation = $0 }
        self.eventsContinuation = continuation
    }

    public func watch(path: String) async throws {
        guard !isWatching else { return }

        // Validate path exists
        let fileManager = FileManager.default
        var isDirectory: ObjCBool = false
        guard fileManager.fileExists(atPath: path, isDirectory: &isDirectory) else {
            throw FileWatcherError.pathDoesNotExist(path)
        }

        isWatching = true

        // Initial scan to build baseline
        try await scanDirectory(path: path, isInitial: true)

        // Start polling
        watchTask = Task {
            while !Task.isCancelled && isWatching {
                try? await Task.sleep(nanoseconds: UInt64(pollInterval * 1_000_000_000))

                if Task.isCancelled { break }

                try? await scanDirectory(path: path, isInitial: false)
            }
        }
    }

    public func stop() async throws {
        isWatching = false
        watchTask?.cancel()
        watchTask = nil
        lastModificationTimes.removeAll()
    }

    private func scanDirectory(path: String, isInitial: Bool) async throws {
        let fileManager = FileManager.default

        // Get all files in directory recursively
        guard let enumerator = fileManager.enumerator(atPath: path) else { return }

        var currentFiles: Set<String> = []

        while let relativePath = enumerator.nextObject() as? String {
            let fullPath = (path as NSString).appendingPathComponent(relativePath)
            currentFiles.insert(relativePath)

            // Get modification time
            guard let attributes = try? fileManager.attributesOfItem(atPath: fullPath),
                  let modificationDate = attributes[.modificationDate] as? Date else {
                continue
            }

            if let lastModTime = lastModificationTimes[relativePath] {
                // File existed before, check if modified
                if modificationDate > lastModTime && !isInitial {
                    eventsContinuation.yield(FileChangeEvent(
                        path: relativePath,
                        type: .modified
                    ))
                }
            } else if !isInitial {
                // New file detected
                eventsContinuation.yield(FileChangeEvent(
                    path: relativePath,
                    type: .created
                ))
            }

            lastModificationTimes[relativePath] = modificationDate
        }

        // Check for deleted files
        if !isInitial {
            for (filePath, _) in lastModificationTimes {
                if !currentFiles.contains(filePath) {
                    eventsContinuation.yield(FileChangeEvent(
                        path: filePath,
                        type: .deleted
                    ))
                    lastModificationTimes.removeValue(forKey: filePath)
                }
            }
        }
    }
}

// MARK: - Platform-Specific File Watchers (Future)

#if os(macOS)
// TODO: Implement FSEvents-based watcher for better performance on macOS
// This would use the FSEventStreamCreate API for efficient file system monitoring
#endif

#if os(Linux)
// TODO: Implement inotify-based watcher for Linux
// This would use the inotify API for kernel-level file system event notification
#endif

#if os(Windows)
// TODO: Implement ReadDirectoryChangesW-based watcher for Windows
// This would use the Windows API for file system change notifications
#endif

// MARK: - Errors

public enum FileWatcherError: Error, LocalizedError {
    case pathDoesNotExist(String)
    case notWatching

    public var errorDescription: String? {
        switch self {
        case .pathDoesNotExist(let path):
            return "Path does not exist: \(path)"
        case .notWatching:
            return "File watcher is not currently watching any path"
        }
    }
}

// MARK: - Platform Factory

extension PlatformFactory {
    /// Create the appropriate file watcher for the current platform
    public static func createFileWatcher() -> any FileWatcher {
        // For now, use polling on all platforms
        // Future: Use platform-specific implementations
        return PollingFileWatcher()
    }
}
