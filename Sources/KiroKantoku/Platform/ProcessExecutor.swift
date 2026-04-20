import Foundation

// MARK: - Unix Process Executor (macOS & Linux)

#if os(macOS) || os(Linux)

public final class UnixProcessExecutor: ProcessExecutor {
    public init() {}

    public func spawn(
        executable: String,
        arguments: [String],
        environment: [String: String]?,
        workingDirectory: String?
    ) async throws -> ProcessHandle {
        let process = Process()

        // Set executable
        let expandedPath = PlatformPaths.expandTilde(executable)
        process.executableURL = URL(fileURLWithPath: expandedPath)

        // Set arguments
        process.arguments = arguments

        // Set working directory
        if let cwd = workingDirectory {
            process.currentDirectoryURL = URL(fileURLWithPath: cwd)
        }

        // Set environment
        if let env = environment {
            var processEnv = ProcessInfo.processInfo.environment
            for (key, value) in env {
                processEnv[key] = value
            }
            process.environment = processEnv
        }

        // Create pipes
        let stdinPipe = Pipe()
        let stdoutPipe = Pipe()
        let stderrPipe = Pipe()

        process.standardInput = stdinPipe
        process.standardOutput = stdoutPipe
        process.standardError = stderrPipe

        // Launch process
        try process.run()

        return UnixProcessHandle(
            process: process,
            stdinPipe: stdinPipe,
            stdoutPipe: stdoutPipe,
            stderrPipe: stderrPipe
        )
    }
}

actor UnixProcessHandle: ProcessHandle {
    private let process: Process
    private let stdinPipe: Pipe
    private let stdoutPipe: Pipe
    private let stderrPipe: Pipe

    nonisolated let stdout: AsyncStream<Data>
    nonisolated let stderr: AsyncStream<Data>
    private let stdoutContinuation: AsyncStream<Data>.Continuation
    private let stderrContinuation: AsyncStream<Data>.Continuation

    init(process: Process, stdinPipe: Pipe, stdoutPipe: Pipe, stderrPipe: Pipe) {
        self.process = process
        self.stdinPipe = stdinPipe
        self.stdoutPipe = stdoutPipe
        self.stderrPipe = stderrPipe

        // Create streams for stdout and stderr
        var tempStdoutContinuation: AsyncStream<Data>.Continuation!
        var tempStderrContinuation: AsyncStream<Data>.Continuation!

        let stdoutStream = AsyncStream<Data> { continuation in
            tempStdoutContinuation = continuation
        }
        let stderrStream = AsyncStream<Data> { continuation in
            tempStderrContinuation = continuation
        }

        self.stdout = stdoutStream
        self.stderr = stderrStream
        self.stdoutContinuation = tempStdoutContinuation
        self.stderrContinuation = tempStderrContinuation

        // Start background reading tasks
        Task { await self.readStdoutLoop() }
        Task { await self.readStderrLoop() }
    }

    private func readStdoutLoop() async {
        let handle = stdoutPipe.fileHandleForReading
        while !Task.isCancelled && process.isRunning {
            let data = await Task {
                handle.availableData
            }.value
            if !data.isEmpty {
                stdoutContinuation.yield(data)
            } else {
                break
            }
        }
        stdoutContinuation.finish()
    }

    private func readStderrLoop() async {
        let handle = stderrPipe.fileHandleForReading
        while !Task.isCancelled && process.isRunning {
            let data = await Task {
                handle.availableData
            }.value
            if !data.isEmpty {
                stderrContinuation.yield(data)
            } else {
                break
            }
        }
        stderrContinuation.finish()
    }

    public var processId: Int32 {
        return process.processIdentifier
    }

    public func readStdout() async throws -> Data {
        return try await Task {
            stdoutPipe.fileHandleForReading.availableData
        }.value
    }

    public func writeStdin(_ data: Data) async throws {
        try await Task {
            try stdinPipe.fileHandleForWriting.write(contentsOf: data)
        }.value
    }

    public func readStderr() async throws -> Data {
        return try await Task {
            stderrPipe.fileHandleForReading.availableData
        }.value
    }

    public func waitForExit() async throws -> Int32 {
        return await withCheckedContinuation { continuation in
            process.waitUntilExit()
            continuation.resume(returning: process.terminationStatus)
        }
    }

    public func terminate() async throws {
        process.terminate()
    }

    public var isRunning: Bool {
        return process.isRunning
    }

    nonisolated public var hasExited: Bool {
        return !process.isRunning
    }

    /// Get access to underlying pipes for ACP ProcessTransport compatibility
    nonisolated public func getStdinPipe() -> Pipe {
        return stdinPipe
    }

    nonisolated public func getStdoutPipe() -> Pipe {
        return stdoutPipe
    }
}

#endif

// MARK: - Windows Process Executor

#if os(Windows)

public final class WindowsProcessExecutor: ProcessExecutor {
    public init() {}

    public func spawn(
        executable: String,
        arguments: [String],
        environment: [String: String]?,
        workingDirectory: String?
    ) async throws -> ProcessHandle {
        // Note: Windows implementation requires Foundation.Process to be available
        // This is supported in Swift 5.7+ on Windows
        let process = Process()

        // Ensure .exe extension
        var executablePath = PlatformPaths.expandTilde(executable)
        if !executablePath.lowercased().hasSuffix(".exe") && !executablePath.contains("/") && !executablePath.contains("\\") {
            executablePath += ".exe"
        }

        process.executableURL = URL(fileURLWithPath: executablePath)
        process.arguments = arguments

        if let cwd = workingDirectory {
            process.currentDirectoryURL = URL(fileURLWithPath: cwd)
        }

        if let env = environment {
            var processEnv = ProcessInfo.processInfo.environment
            for (key, value) in env {
                processEnv[key] = value
            }
            process.environment = processEnv
        }

        let stdinPipe = Pipe()
        let stdoutPipe = Pipe()
        let stderrPipe = Pipe()

        process.standardInput = stdinPipe
        process.standardOutput = stdoutPipe
        process.standardError = stderrPipe

        try process.run()

        return WindowsProcessHandle(
            process: process,
            stdinPipe: stdinPipe,
            stdoutPipe: stdoutPipe,
            stderrPipe: stderrPipe
        )
    }
}

actor WindowsProcessHandle: ProcessHandle {
    private let process: Process
    private let stdinPipe: Pipe
    private let stdoutPipe: Pipe
    private let stderrPipe: Pipe

    nonisolated let stdout: AsyncStream<Data>
    nonisolated let stderr: AsyncStream<Data>
    private let stdoutContinuation: AsyncStream<Data>.Continuation
    private let stderrContinuation: AsyncStream<Data>.Continuation

    init(process: Process, stdinPipe: Pipe, stdoutPipe: Pipe, stderrPipe: Pipe) {
        self.process = process
        self.stdinPipe = stdinPipe
        self.stdoutPipe = stdoutPipe
        self.stderrPipe = stderrPipe

        // Create streams for stdout and stderr
        var tempStdoutContinuation: AsyncStream<Data>.Continuation!
        var tempStderrContinuation: AsyncStream<Data>.Continuation!

        let stdoutStream = AsyncStream<Data> { continuation in
            tempStdoutContinuation = continuation
        }
        let stderrStream = AsyncStream<Data> { continuation in
            tempStderrContinuation = continuation
        }

        self.stdout = stdoutStream
        self.stderr = stderrStream
        self.stdoutContinuation = tempStdoutContinuation
        self.stderrContinuation = tempStderrContinuation

        // Start background reading tasks
        Task { await self.readStdoutLoop() }
        Task { await self.readStderrLoop() }
    }

    private func readStdoutLoop() async {
        let handle = stdoutPipe.fileHandleForReading
        while !Task.isCancelled && process.isRunning {
            let data = await Task {
                handle.availableData
            }.value
            if !data.isEmpty {
                stdoutContinuation.yield(data)
            } else {
                break
            }
        }
        stdoutContinuation.finish()
    }

    private func readStderrLoop() async {
        let handle = stderrPipe.fileHandleForReading
        while !Task.isCancelled && process.isRunning {
            let data = await Task {
                handle.availableData
            }.value
            if !data.isEmpty {
                stderrContinuation.yield(data)
            } else {
                break
            }
        }
        stderrContinuation.finish()
    }

    public var processId: Int32 {
        return process.processIdentifier
    }

    public func readStdout() async throws -> Data {
        return try await Task {
            stdoutPipe.fileHandleForReading.availableData
        }.value
    }

    public func writeStdin(_ data: Data) async throws {
        try await Task {
            try stdinPipe.fileHandleForWriting.write(contentsOf: data)
        }.value
    }

    public func readStderr() async throws -> Data {
        return try await Task {
            stderrPipe.fileHandleForReading.availableData
        }.value
    }

    public func waitForExit() async throws -> Int32 {
        return await withCheckedContinuation { continuation in
            process.waitUntilExit()
            continuation.resume(returning: process.terminationStatus)
        }
    }

    public func terminate() async throws {
        process.terminate()
    }

    public var isRunning: Bool {
        return process.isRunning
    }

    nonisolated public var hasExited: Bool {
        return !process.isRunning
    }

    /// Get access to underlying pipes for ACP ProcessTransport compatibility
    nonisolated public func getStdinPipe() -> Pipe {
        return stdinPipe
    }

    nonisolated public func getStdoutPipe() -> Pipe {
        return stdoutPipe
    }
}

#endif

// MARK: - Platform Factory

public struct PlatformFactory {
    /// Create the appropriate process executor for the current platform
    public static func createProcessExecutor() -> ProcessExecutor {
        #if os(macOS) || os(Linux)
        return UnixProcessExecutor()
        #elseif os(Windows)
        return WindowsProcessExecutor()
        #else
        fatalError("Unsupported platform")
        #endif
    }
}
