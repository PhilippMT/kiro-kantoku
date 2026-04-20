import XCTest
@testable import KiroKantoku

final class PlatformAbstractionTests: XCTestCase {

    // MARK: - Platform Detection Tests

    func testPlatformDetection() {
        let platform = Platform.current
        #if os(macOS)
        XCTAssertEqual(platform, .macOS)
        #elseif os(Linux)
        XCTAssertEqual(platform, .linux)
        #elseif os(Windows)
        XCTAssertEqual(platform, .windows)
        #endif
    }

    // MARK: - PlatformPaths Tests

    func testHomeDirectory() {
        let homeDir = PlatformPaths.homeDirectory
        XCTAssertFalse(homeDir.isEmpty, "Home directory should not be empty")

        #if os(Windows)
        XCTAssertTrue(homeDir.contains("\\"), "Windows paths should contain backslashes")
        #else
        XCTAssertTrue(homeDir.contains("/"), "Unix paths should contain forward slashes")
        #endif
    }

    func testApplicationSupportDirectory() {
        let appSupportDir = PlatformPaths.applicationSupportDirectory
        XCTAssertFalse(appSupportDir.isEmpty, "Application support directory should not be empty")

        #if os(macOS)
        XCTAssertTrue(appSupportDir.contains("Library/Application Support"))
        #elseif os(Linux)
        XCTAssertTrue(appSupportDir.contains(".config") || appSupportDir.contains(".local"))
        #elseif os(Windows)
        XCTAssertTrue(appSupportDir.contains("AppData"))
        #endif
    }

    func testTemporaryDirectory() {
        let tempDir = PlatformPaths.temporaryDirectory
        XCTAssertFalse(tempDir.isEmpty, "Temporary directory should not be empty")
    }

    func testPathSeparator() {
        let separator = PlatformPaths.pathSeparator
        #if os(Windows)
        XCTAssertEqual(separator, "\\")
        #else
        XCTAssertEqual(separator, "/")
        #endif
    }

    func testExpandTilde() {
        let homeDir = PlatformPaths.homeDirectory
        let tildeExpanded = PlatformPaths.expandTilde("~/test/path")
        XCTAssertTrue(tildeExpanded.hasPrefix(homeDir))
        XCTAssertTrue(tildeExpanded.hasSuffix("test\(PlatformPaths.pathSeparator)path"))

        // Non-tilde paths should be unchanged
        let normalPath = "/absolute/path"
        XCTAssertEqual(PlatformPaths.expandTilde(normalPath), normalPath)
    }

    // MARK: - JSONConfigurationStore Tests

    func testJSONConfigurationStore() async throws {
        let store = try JSONConfigurationStore(appName: "KiroKantokuTest_\(UUID().uuidString)")

        // Test string operations
        try await store.setString("testKey", value: "testValue")
        let retrievedString = store.getString("testKey")
        XCTAssertEqual(retrievedString, "testValue")

        // Test integer operations
        try await store.setInt("intKey", value: 42)
        let retrievedInt = store.getInt("intKey")
        XCTAssertEqual(retrievedInt, 42)

        // Test boolean operations
        try await store.setBool("boolKey", value: true)
        let retrievedBool = store.getBool("boolKey")
        XCTAssertEqual(retrievedBool, true)

        // Test double operations
        try await store.setDouble("doubleKey", value: 3.14159)
        let retrievedDouble = store.getDouble("doubleKey")
        XCTAssertEqual(retrievedDouble, 3.14159, accuracy: 0.00001)

        // Test synchronize
        try await store.synchronize()

        // Create new store instance to verify persistence
        let store2 = try JSONConfigurationStore(appName: "KiroKantokuTest_\(UUID().uuidString)")

        // Note: This will be empty because we used a different UUID
        // In real usage, same app name would be used
        XCTAssertNil(store2.getString("testKey"))
    }

    func testJSONConfigurationStoreRemove() async throws {
        let store = try JSONConfigurationStore(appName: "KiroKantokuTest_\(UUID().uuidString)")

        try await store.setString("removeMe", value: "value")
        XCTAssertNotNil(store.getString("removeMe"))

        try await store.remove("removeMe")
        XCTAssertNil(store.getString("removeMe"))
    }

    func testJSONConfigurationStoreDefaults() async throws {
        let store = try JSONConfigurationStore(appName: "KiroKantokuTest_\(UUID().uuidString)")

        // Test defaults for missing keys
        XCTAssertEqual(store.getString("missing", default: "default"), "default")
        XCTAssertEqual(store.getInt("missing", default: 100), 100)
        XCTAssertEqual(store.getBool("missing", default: false), false)
        XCTAssertEqual(store.getDouble("missing", default: 1.5), 1.5)
    }

    // MARK: - Process Executor Tests

    func testProcessExecutorFactory() {
        let executor = PlatformFactory.createProcessExecutor()
        XCTAssertNotNil(executor)
    }

    func testProcessExecution() async throws {
        let executor = PlatformFactory.createProcessExecutor()

        #if os(Windows)
        let executable = "cmd.exe"
        let arguments = ["/c", "echo", "Hello"]
        #else
        let executable = "/bin/echo"
        let arguments = ["Hello"]
        #endif

        let handle = try await executor.spawn(
            executable: executable,
            arguments: arguments,
            environment: nil,
            workingDirectory: nil
        )

        XCTAssertGreaterThan(handle.processId, 0)

        // Wait for process to complete
        let exitCode = try await handle.waitForExit()
        XCTAssertEqual(exitCode, 0)

        let isRunning = await handle.isRunning
        XCTAssertFalse(isRunning)
    }

    // MARK: - Notification Service Tests

    func testNotificationServiceFactory() {
        let service = PlatformFactory.createNotificationService()
        XCTAssertNotNil(service)
    }

    func testInAppNotificationService() async throws {
        let service = InAppNotificationService()

        // Request authorization
        let authorized = try await service.requestAuthorization()
        XCTAssertTrue(authorized)

        // Show notification
        try await service.showNotification(
            title: "Test Title",
            body: "Test Body",
            identifier: "test-notification"
        )

        // Verify notification exists
        let notifications = service.getAllNotifications()
        XCTAssertEqual(notifications.count, 1)
        XCTAssertEqual(notifications.first?.title, "Test Title")
        XCTAssertEqual(notifications.first?.body, "Test Body")

        // Remove notification
        try await service.removeNotification(identifier: "test-notification")
        let afterRemove = service.getAllNotifications()
        XCTAssertEqual(afterRemove.count, 0)
    }

    func testInAppNotificationServiceLimit() async throws {
        let service = InAppNotificationService()

        // Add more than the limit (50)
        for i in 0..<60 {
            try await service.showNotification(
                title: "Test \(i)",
                body: "Body \(i)",
                identifier: "test-\(i)"
            )
        }

        // Should not exceed limit
        let count = service.count
        XCTAssertLessThanOrEqual(count, 50)
    }

    // MARK: - File Watcher Tests

    func testFileWatcherFactory() {
        let watcher = PlatformFactory.createFileWatcher()
        XCTAssertNotNil(watcher)
    }

    func testPollingFileWatcher() async throws {
        let watcher = PollingFileWatcher(pollInterval: 0.1)

        // Create a temporary directory
        let tempDir = FileManager.default.temporaryDirectory
            .appendingPathComponent("KiroKantokuFileWatcherTest_\(UUID().uuidString)")

        try FileManager.default.createDirectory(at: tempDir, withIntermediateDirectories: true)

        defer {
            try? FileManager.default.removeItem(at: tempDir)
        }

        // Start watching
        try await watcher.watch(path: tempDir.path)

        // Create a test file
        let testFile = tempDir.appendingPathComponent("test.txt")
        try "Hello".write(to: testFile, atomically: true, encoding: .utf8)

        // Wait a bit for the file watcher to detect
        try await Task.sleep(nanoseconds: 200_000_000) // 200ms

        // Stop watching
        try await watcher.stop()
    }

    func testFileWatcherInvalidPath() async throws {
        let watcher = PollingFileWatcher()

        do {
            try await watcher.watch(path: "/nonexistent/path/\(UUID().uuidString)")
            XCTFail("Should have thrown an error for nonexistent path")
        } catch {
            // Expected error
            XCTAssertTrue(error is FileWatcherError)
        }
    }
}
