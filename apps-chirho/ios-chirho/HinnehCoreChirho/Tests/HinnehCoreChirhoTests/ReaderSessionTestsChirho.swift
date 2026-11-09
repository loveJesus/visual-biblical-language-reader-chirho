// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation
import Testing
@testable import HinnehCoreChirho

@MainActor
struct ReaderSessionTestsChirho {
    private let booksChirho = BookListChirho.bundledChirho()
    private let lastChirho = PassageChirho(bookIdChirho: "John", chapterChirho: 3, verseChirho: 16)
    private let otherChirho = PassageChirho(bookIdChirho: "Acts", chapterChirho: 3, verseChirho: 1)

    private func defaultsChirho() throws -> (UserDefaults, String) {
        let nameChirho = "reader-session-tests-\(UUID().uuidString)-chirho"
        return (try #require(UserDefaults(suiteName: nameChirho)), nameChirho)
    }

    @Test func todayDefaultsOnAutoplayOffAndPreferencesSurviveANewSessionChirho() throws {
        let (storeChirho, nameChirho) = try defaultsChirho()
        defer { storeChirho.removePersistentDomain(forName: nameChirho) }
        let firstChirho = ReaderSessionChirho(defaultsChirho: storeChirho)
        #expect(firstChirho.startTodayChirho)
        #expect(!firstChirho.autoplayChirho)
        _ = firstChirho.launchChirho(requestedChirho: nil, booksChirho: booksChirho, versionChirho: "0.1.2")
        firstChirho.finishWelcomeChirho()
        #expect(!firstChirho.consumeAutoplayChirho(firstChirho.beginOpenChirho(.navigationChirho, changedChirho: true)))
        firstChirho.startTodayChirho = false
        firstChirho.autoplayChirho = true
        let secondChirho = ReaderSessionChirho(defaultsChirho: storeChirho)
        #expect(!secondChirho.startTodayChirho)
        #expect(secondChirho.autoplayChirho)
    }

    @Test func dailyAndResumeAreColdLaunchOnlyAndExplicitPassageWinsChirho() throws {
        let (storeChirho, nameChirho) = try defaultsChirho()
        defer { storeChirho.removePersistentDomain(forName: nameChirho) }
        var calendarChirho = Calendar(identifier: .gregorian)
        calendarChirho.timeZone = try #require(TimeZone(secondsFromGMT: 0))
        let dateChirho = try #require(calendarChirho.date(from: DateComponents(year: 2026, month: 11, day: 8)))
        let sessionChirho = ReaderSessionChirho(defaultsChirho: storeChirho)
        sessionChirho.rememberChirho(lastChirho)
        #expect(sessionChirho.launchChirho(requestedChirho: nil, booksChirho: booksChirho,
            versionChirho: "0.1.2", dateChirho: dateChirho, calendarChirho: calendarChirho)?.idChirho == "Prov.8.1")
        #expect(sessionChirho.launchChirho(requestedChirho: otherChirho, booksChirho: booksChirho,
            versionChirho: "0.1.2", dateChirho: dateChirho.addingTimeInterval(86_400)) == nil)
        sessionChirho.startTodayChirho = false
        let resumedChirho = ReaderSessionChirho(defaultsChirho: storeChirho)
        #expect(resumedChirho.launchChirho(requestedChirho: nil, booksChirho: booksChirho,
            versionChirho: "0.1.2") == lastChirho)
        let linkedChirho = ReaderSessionChirho(defaultsChirho: storeChirho)
        #expect(linkedChirho.launchChirho(requestedChirho: otherChirho, booksChirho: booksChirho,
            versionChirho: "0.1.2") == otherChirho)
        storeChirho.set("Unknown.999.1", forKey: ReaderSessionChirho.passageKeyChirho)
        let invalidChirho = ReaderSessionChirho(defaultsChirho: storeChirho)
        #expect(invalidChirho.launchChirho(requestedChirho: nil, booksChirho: booksChirho,
            versionChirho: "0.1.2", dateChirho: dateChirho, calendarChirho: calendarChirho)?.idChirho == "Prov.8.1")
    }

    @Test func welcomeIsOncePerAppVersionNotPerMediaChangeOrForegroundChirho() throws {
        let (storeChirho, nameChirho) = try defaultsChirho()
        defer { storeChirho.removePersistentDomain(forName: nameChirho) }
        let firstChirho = ReaderSessionChirho(defaultsChirho: storeChirho)
        _ = firstChirho.launchChirho(requestedChirho: nil, booksChirho: booksChirho, versionChirho: "0.1.2")
        #expect(firstChirho.welcomePresentedChirho)
        firstChirho.finishWelcomeChirho()
        #expect(!firstChirho.welcomePresentedChirho)
        #expect(firstChirho.launchChirho(requestedChirho: nil, booksChirho: booksChirho, versionChirho: "0.1.3") == nil)
        let sameVersionChirho = ReaderSessionChirho(defaultsChirho: storeChirho)
        _ = sameVersionChirho.launchChirho(requestedChirho: nil, booksChirho: booksChirho, versionChirho: "0.1.2")
        #expect(!sameVersionChirho.welcomePresentedChirho)
        let updateChirho = ReaderSessionChirho(defaultsChirho: storeChirho)
        _ = updateChirho.launchChirho(requestedChirho: nil, booksChirho: booksChirho, versionChirho: "0.1.3")
        #expect(updateChirho.welcomePresentedChirho)
    }

    @Test func onlyAChangedExplicitNavigationMayPlayOnceAfterReadyChirho() throws {
        let (storeChirho, nameChirho) = try defaultsChirho()
        defer { storeChirho.removePersistentDomain(forName: nameChirho) }
        let sessionChirho = ReaderSessionChirho(defaultsChirho: storeChirho)
        sessionChirho.autoplayChirho = true
        _ = sessionChirho.launchChirho(requestedChirho: lastChirho, booksChirho: booksChirho, versionChirho: "0.1.2")
        let welcomeIntentChirho = sessionChirho.beginOpenChirho(.navigationChirho, changedChirho: true)
        #expect(!sessionChirho.consumeAutoplayChirho(welcomeIntentChirho), "the welcome must stay silent even with autoplay opted in")
        sessionChirho.finishWelcomeChirho()
        #expect(!sessionChirho.consumeAutoplayChirho(welcomeIntentChirho), "dismissing welcome never starts an old intent")
        for reasonChirho in [PassageOpenReasonChirho.launchChirho, .deepLinkChirho, .retryChirho] {
            #expect(!sessionChirho.consumeAutoplayChirho(sessionChirho.beginOpenChirho(reasonChirho, changedChirho: true)))
        }
        #expect(!sessionChirho.consumeAutoplayChirho(sessionChirho.beginOpenChirho(.navigationChirho, changedChirho: false)))
        let readyChirho = sessionChirho.beginOpenChirho(.navigationChirho, changedChirho: true)
        var playerChirho = FakeVersePlayerChirho()
        if sessionChirho.consumeAutoplayChirho(readyChirho) { playerChirho.playChirho() }
        if sessionChirho.consumeAutoplayChirho(readyChirho) { playerChirho.playChirho() }
        #expect(playerChirho.playsChirho == 1)
    }

    @Test func staleReadyResultsAndCancellationCannotStartPlaybackChirho() throws {
        let (storeChirho, nameChirho) = try defaultsChirho()
        defer { storeChirho.removePersistentDomain(forName: nameChirho) }
        let sessionChirho = ReaderSessionChirho(defaultsChirho: storeChirho)
        _ = sessionChirho.launchChirho(requestedChirho: nil, booksChirho: booksChirho, versionChirho: "0.1.2")
        sessionChirho.finishWelcomeChirho()
        sessionChirho.autoplayChirho = true
        let oldChirho = sessionChirho.beginOpenChirho(.navigationChirho, changedChirho: true)
        let currentChirho = sessionChirho.beginOpenChirho(.navigationChirho, changedChirho: true)
        #expect(!sessionChirho.consumeAutoplayChirho(oldChirho))
        #expect(sessionChirho.consumeAutoplayChirho(currentChirho))
        let cancelledChirho = sessionChirho.beginOpenChirho(.navigationChirho, changedChirho: true)
        sessionChirho.cancelAutoplayChirho()
        #expect(!sessionChirho.consumeAutoplayChirho(cancelledChirho))
        let disabledChirho = sessionChirho.beginOpenChirho(.navigationChirho, changedChirho: true)
        sessionChirho.autoplayChirho = false
        sessionChirho.autoplayChirho = true
        #expect(!sessionChirho.consumeAutoplayChirho(disabledChirho))
    }

    @Test func onlyKnownPassagesFromTheOwnWebsiteAreHandledChirho() throws {
        #expect(ReaderSessionChirho.linkedPassageChirho(
            try #require(URL(string: "https://hinneh.us/?lang_chirho=es#John.3.16")), booksChirho: booksChirho) == lastChirho)
        for textChirho in ["https://example.com/#John.3.16", "http://hinneh.us/#John.3.16",
                           "https://hinneh.us:8443/#John.3.16", "https://user@hinneh.us/#John.3.16",
                           "https://hinneh.us/about-chirho/#John.3.16", "https://hinneh.us/#Unknown.1.1"] {
            #expect(ReaderSessionChirho.linkedPassageChirho(try #require(URL(string: textChirho)), booksChirho: booksChirho) == nil)
        }
    }
}

private struct FakeVersePlayerChirho {
    private(set) var playsChirho = 0
    mutating func playChirho() { playsChirho += 1 }
}
