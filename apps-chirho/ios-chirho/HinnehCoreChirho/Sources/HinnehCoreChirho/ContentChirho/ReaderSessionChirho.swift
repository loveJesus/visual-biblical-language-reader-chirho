// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: apps-chirho/ios-chirho/docs-chirho/reader-session-chirho.md.

import Foundation
import Observation

/// Why a passage opens matters: restoring, retrying or following a link must remain quiet.
public enum PassageOpenReasonChirho: Sendable {
    case launchChirho
    case navigationChirho
    case deepLinkChirho
    case retryChirho
}

/// Local preferences and one cold-launch session. No media, network or account is created here.
/// The caller consumes a navigation intent only after its existing verified media selection settles.
@MainActor @Observable
public final class ReaderSessionChirho {
    public static let todayKeyChirho = "hinneh-start-today-chirho"
    public static let autoplayKeyChirho = "hinneh-autoplay-verse-chirho"
    public static let showIpaKeyChirho = "hinneh-show-ipa-chirho"
    public static let passageKeyChirho = "hinneh-last-passage-chirho"
    public static let welcomeVersionKeyChirho = "hinneh-welcome-version-chirho"

    public var startTodayChirho: Bool {
        didSet { defaultsChirho.set(startTodayChirho, forKey: Self.todayKeyChirho) }
    }
    public var autoplayChirho: Bool {
        didSet {
            defaultsChirho.set(autoplayChirho, forKey: Self.autoplayKeyChirho)
            if !autoplayChirho { pendingAutoplayChirho = nil }
        }
    }
    public var showIpaChirho: Bool {
        didSet { defaultsChirho.set(showIpaChirho, forKey: Self.showIpaKeyChirho) }
    }
    public private(set) var welcomePresentedChirho = false
    public private(set) var startedChirho = false
    @ObservationIgnored private let defaultsChirho: UserDefaults
    @ObservationIgnored private var versionChirho = ""
    @ObservationIgnored private var pendingAutoplayChirho: UUID?

    public init(defaultsChirho: UserDefaults = .standard) {
        self.defaultsChirho = defaultsChirho
        startTodayChirho = defaultsChirho.object(forKey: Self.todayKeyChirho) as? Bool ?? true
        autoplayChirho = defaultsChirho.object(forKey: Self.autoplayKeyChirho) as? Bool ?? true
        showIpaChirho = defaultsChirho.object(forKey: Self.showIpaKeyChirho) as? Bool ?? false
    }

    /// Runs once for this app/model lifetime, never again on foreground activation or view reappearance.
    public func launchChirho(requestedChirho: PassageChirho?, booksChirho: BookListChirho,
                             versionChirho: String, dateChirho: Date = Date(),
                             calendarChirho: Calendar = .current) -> PassageChirho? {
        guard !startedChirho else { return nil }
        startedChirho = true
        self.versionChirho = versionChirho
        welcomePresentedChirho = !versionChirho.isEmpty
            && defaultsChirho.string(forKey: Self.welcomeVersionKeyChirho) != versionChirho
        let dailyChirho = PassageChirho.dailyChirho(dateChirho, calendarChirho: calendarChirho)
        let savedChirho = defaultsChirho.string(forKey: Self.passageKeyChirho)
            .flatMap { PassageChirho.parseChirho($0, booksChirho) }
        return requestedChirho ?? (startTodayChirho ? dailyChirho : savedChirho ?? dailyChirho)
    }

    /// Persist only a passage whose source text actually loaded and passed validation.
    public func rememberChirho(_ passageChirho: PassageChirho) {
        defaultsChirho.set(passageChirho.idChirho, forKey: Self.passageKeyChirho)
    }

    public func finishWelcomeChirho() {
        guard welcomePresentedChirho else { return }
        welcomePresentedChirho = false
        defaultsChirho.set(versionChirho, forKey: Self.welcomeVersionKeyChirho)
        pendingAutoplayChirho = nil
    }

    /// Every open replaces the old intent, even if a previous loader ignores cancellation.
    public func beginOpenChirho(_ reasonChirho: PassageOpenReasonChirho, changedChirho: Bool) -> UUID {
        let identityChirho = UUID()
        pendingAutoplayChirho = startedChirho && changedChirho && reasonChirho == .navigationChirho
            && autoplayChirho && !welcomePresentedChirho ? identityChirho : nil
        return identityChirho
    }

    /// A matching ready result may start once. Stale callbacks cannot consume a newer intent.
    public func consumeAutoplayChirho(_ identityChirho: UUID) -> Bool {
        guard pendingAutoplayChirho == identityChirho else { return false }
        pendingAutoplayChirho = nil
        return autoplayChirho && !welcomePresentedChirho
    }

    /// Used for backgrounding, manual audio actions, changing rendition and opening Info.
    public func cancelAutoplayChirho() { pendingAutoplayChirho = nil }

    /// Handles a delivered website URL without enabling a new URL scheme or universal-link entitlement.
    public static func linkedPassageChirho(_ urlChirho: URL, booksChirho: BookListChirho) -> PassageChirho? {
        guard urlChirho.scheme == "https", urlChirho.host == "hinneh.us",
              urlChirho.user == nil, urlChirho.password == nil,
              urlChirho.port == nil || urlChirho.port == 443,
              urlChirho.path.isEmpty || urlChirho.path == "/",
              let fragmentChirho = urlChirho.fragment else { return nil }
        return PassageChirho.parseChirho(fragmentChirho, booksChirho)
    }
}
