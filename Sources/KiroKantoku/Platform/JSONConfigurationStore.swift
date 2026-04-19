import Foundation

/// JSON file-based configuration store that replaces UserDefaults
/// Provides cross-platform persistent storage for application settings
public actor JSONConfigurationStore: ConfigurationStore {
    private let fileURL: URL
    private var data: [String: Any] = [:]
    private let fileManager = FileManager.default

    public init(appName: String) throws {
        // Determine platform-specific config directory
        let configDir = PlatformPaths.applicationSupportDirectory
        let appConfigDir = URL(fileURLWithPath: configDir).appendingPathComponent(appName)

        // Create directory if it doesn't exist
        if !fileManager.fileExists(atPath: appConfigDir.path) {
            try fileManager.createDirectory(at: appConfigDir, withIntermediateDirectories: true)
        }

        self.fileURL = appConfigDir.appendingPathComponent("config.json")

        // Load existing data if available
        if fileManager.fileExists(atPath: fileURL.path) {
            let jsonData = try Data(contentsOf: fileURL)
            if let loadedData = try JSONSerialization.jsonObject(with: jsonData) as? [String: Any] {
                self.data = loadedData
            }
        }
    }

    // MARK: - String Operations

    public func getString(_ key: String) async -> String? {
        return data[key] as? String
    }

    public func setString(_ key: String, value: String) async throws {
        data[key] = value
    }

    // MARK: - Integer Operations

    public func getInt(_ key: String) async -> Int? {
        return data[key] as? Int
    }

    public func setInt(_ key: String, value: Int) async throws {
        data[key] = value
    }

    // MARK: - Boolean Operations

    public func getBool(_ key: String) async -> Bool? {
        return data[key] as? Bool
    }

    public func setBool(_ key: String, value: Bool) async throws {
        data[key] = value
    }

    // MARK: - Double Operations

    public func getDouble(_ key: String) async -> Double? {
        return data[key] as? Double
    }

    public func setDouble(_ key: String, value: Double) async throws {
        data[key] = value
    }

    // MARK: - Remove

    public func remove(_ key: String) async throws {
        data.removeValue(forKey: key)
    }

    // MARK: - Synchronize

    public func synchronize() async throws {
        let jsonData = try JSONSerialization.data(withJSONObject: data, options: [.prettyPrinted, .sortedKeys])
        try jsonData.write(to: fileURL, options: [.atomic])
    }
}

// MARK: - Convenience Extensions

extension JSONConfigurationStore {
    /// Get a value with a default if not found
    public func getString(_ key: String, default defaultValue: String) -> String {
        return getString(key) ?? defaultValue
    }

    public func getInt(_ key: String, default defaultValue: Int) -> Int {
        return getInt(key) ?? defaultValue
    }

    public func getBool(_ key: String, default defaultValue: Bool) -> Bool {
        return getBool(key) ?? defaultValue
    }

    public func getDouble(_ key: String, default defaultValue: Double) -> Double {
        return getDouble(key) ?? defaultValue
    }
}
