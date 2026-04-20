import Foundation

#if os(macOS)
import UserNotifications
#endif

// MARK: - macOS Notification Service

#if os(macOS)

@MainActor
public final class MacOSNotificationService: NotificationService {
    private let center = UNUserNotificationCenter.current()

    public init() {}

    public func requestAuthorization() async throws -> Bool {
        let granted = try await center.requestAuthorization(options: [.alert, .sound, .badge])
        return granted
    }

    public func showNotification(title: String, body: String, identifier: String) async throws {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default

        let request = UNNotificationRequest(
            identifier: identifier,
            content: content,
            trigger: nil
        )

        try await center.add(request)
    }

    public func removeNotification(identifier: String) async throws {
        center.removeDeliveredNotifications(withIdentifiers: [identifier])
    }

    public func removeAllNotifications() async throws {
        center.removeAllDeliveredNotifications()
        center.removeAllPendingNotificationRequests()
    }
}

#endif

// MARK: - Cross-Platform In-App Notification Service

/// Fallback notification service for platforms without native notifications
/// Stores notifications in memory for display in the application UI
public actor InAppNotificationService: NotificationService {
    public struct Notification: Sendable {
        public let identifier: String
        public let title: String
        public let body: String
        public let timestamp: Date
    }

    private var notifications: [String: Notification] = [:]
    private let maxNotifications = 50

    public init() {}

    public func requestAuthorization() async throws -> Bool {
        // In-app notifications don't require authorization
        return true
    }

    public func showNotification(title: String, body: String, identifier: String) async throws {
        let notification = Notification(
            identifier: identifier,
            title: title,
            body: body,
            timestamp: Date()
        )
        notifications[identifier] = notification

        // Trim old notifications if we exceed the limit
        if notifications.count > maxNotifications {
            let sortedNotifications = notifications.values.sorted { $0.timestamp < $1.timestamp }
            if let oldestId = sortedNotifications.first?.identifier {
                notifications.removeValue(forKey: oldestId)
            }
        }
    }

    public func removeNotification(identifier: String) async throws {
        notifications.removeValue(forKey: identifier)
    }

    public func removeAllNotifications() async throws {
        notifications.removeAll()
    }

    // MARK: - In-App Specific Methods

    /// Get all current notifications
    public func getAllNotifications() -> [Notification] {
        return Array(notifications.values).sorted { $0.timestamp > $1.timestamp }
    }

    /// Get notification count
    public var count: Int {
        return notifications.count
    }
}

// MARK: - Platform Factory

extension PlatformFactory {
    /// Create the appropriate notification service for the current platform
    public static func createNotificationService() -> any NotificationService {
        #if os(macOS)
        return MacOSNotificationService()
        #else
        return InAppNotificationService()
        #endif
    }
}
