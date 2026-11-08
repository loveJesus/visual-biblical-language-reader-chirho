// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import XCTest

/// End-to-end checks against the live public resources: the app opens the requested passage,
/// shows its original words as accessible buttons, opens a word card, and moves between verses.
final class ReaderUITestsChirho: XCTestCase {
    override func setUp() {
        continueAfterFailure = false
    }

    @MainActor
    private func launchChirho(_ passageChirho: String, _ localeChirho: String) -> XCUIApplication {
        let appChirho = XCUIApplication()
        appChirho.launchArguments = ["-hinneh-open-chirho", passageChirho, "-hinneh-locale-chirho", localeChirho]
        appChirho.launch()
        return appChirho
    }

    @MainActor
    private func keepChirho(_ appChirho: XCUIApplication, _ nameChirho: String) {
        let attachmentChirho = XCTAttachment(screenshot: appChirho.screenshot())
        attachmentChirho.name = nameChirho
        attachmentChirho.lifetime = .keepAlways
        add(attachmentChirho)
    }

    @MainActor
    func testHebrewVerseOpensItsWordCardChirho() {
        let appChirho = launchChirho("Prov.26.1", "en")
        XCTAssertTrue(appChirho.staticTexts["Proverbs 26:1"].firstMatch.waitForExistence(timeout: 30))
        let wordChirho = appChirho.buttons.matching(
            NSPredicate(format: "label BEGINSWITH %@", "כַּשֶּׁ֤לֶג")).firstMatch
        XCTAssertTrue(wordChirho.waitForExistence(timeout: 30), "the first source word is an accessible button")
        XCTAssertTrue(wordChirho.label.contains("noun; gender"), "its label carries the sourced grammar")
        keepChirho(appChirho, "proverbs-26-1-en")
        // The speaker on the word's upper-right corner plays without opening Look closer.
        let cornerChirho = wordChirho.coordinate(withNormalizedOffset: .zero)
            .withOffset(CGVector(dx: wordChirho.frame.width - 11, dy: 22))
        cornerChirho.tap()
        XCTAssertFalse(appChirho.buttons["Done"].waitForExistence(timeout: 2),
                       "the speaker tap is independent of the word card")
        XCTAssertFalse(appChirho.staticTexts["The recording could not be played."].exists)
        wordChirho.tap()
        XCTAssertTrue(appChirho.buttons["Done"].waitForExistence(timeout: 10))
        XCTAssertTrue(appChirho.staticTexts["Meaning"].exists || appChirho.staticTexts["MEANING"].exists)
        keepChirho(appChirho, "proverbs-26-1-word-card-en")
        // The word's verified recording plays without an error.
        let playChirho = appChirho.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "Play ")).firstMatch
        XCTAssertTrue(playChirho.waitForExistence(timeout: 10))
        playChirho.tap()
        XCTAssertFalse(appChirho.staticTexts["The recording could not be played."].waitForExistence(timeout: 4))
        appChirho.buttons["Done"].tap()
        // The verse reading plays complete to its natural end, then offers itself again.
        let verseChirho = appChirho.buttons["Listen to the verse"].firstMatch
        XCTAssertTrue(verseChirho.waitForExistence(timeout: 20))
        verseChirho.tap()
        XCTAssertTrue(appChirho.buttons["Stop"].waitForExistence(timeout: 20), "the reading started")
        XCTAssertTrue(verseChirho.waitForExistence(timeout: 30), "the reading finished on its own")
        XCTAssertFalse(appChirho.staticTexts["The recording could not be played."].exists)
        let nextChirho = appChirho.buttons["Next verse"]
        XCTAssertTrue(nextChirho.waitForExistence(timeout: 10))
        nextChirho.tap()
        XCTAssertTrue(appChirho.staticTexts["Proverbs 26:2"].firstMatch.waitForExistence(timeout: 30))
    }

    @MainActor
    func testAVerseTheEditionLacksOffersRetryAndNavigationChirho() {
        let appChirho = launchChirho("Prov.1.200", "en")
        XCTAssertTrue(appChirho.staticTexts["This verse could not be loaded or verified."].waitForExistence(timeout: 30))
        XCTAssertTrue(appChirho.buttons["Try again"].exists)
        XCTAssertTrue(appChirho.buttons["Previous verse"].exists)
        keepChirho(appChirho, "absent-verse-en")
    }

    @MainActor
    func testGreekVerseInSpanishShowsApprovedMeaningsChirho() {
        let appChirho = launchChirho("John.3.16", "es")
        XCTAssertTrue(appChirho.staticTexts["Juan 3:16"].firstMatch.waitForExistence(timeout: 30))
        let wordChirho = appChirho.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "Οὕτως")).firstMatch
        XCTAssertTrue(wordChirho.waitForExistence(timeout: 30))
        XCTAssertTrue(wordChirho.label.contains("adverbio"), "Greek grammar is named in Spanish")
        keepChirho(appChirho, "john-3-16-es")
        wordChirho.tap()
        XCTAssertTrue(appChirho.buttons["Listo"].waitForExistence(timeout: 10))
        XCTAssertTrue(appChirho.staticTexts["Significado"].exists || appChirho.staticTexts["SIGNIFICADO"].exists)
        keepChirho(appChirho, "john-3-16-word-card-es")
    }

    @MainActor
    func testVideoStopsOnSwipeAndVerticalScrollingStillWorksChirho() {
        let appChirho = launchChirho("Prov.1.1", "en")
        XCTAssertTrue(appChirho.staticTexts["Proverbs 1:1"].firstMatch.waitForExistence(timeout: 30))
        let playChirho = appChirho.buttons["Listen to the verse"].firstMatch
        XCTAssertTrue(playChirho.waitForExistence(timeout: 30))
        playChirho.tap()
        XCTAssertTrue(appChirho.buttons["Stop"].firstMatch.waitForExistence(timeout: 20))
        keepChirho(appChirho, "proverbs-video-playing-en")
        // The word area accepts horizontal navigation; the video scrubber is excluded.
        let startChirho = appChirho.coordinate(withNormalizedOffset: CGVector(dx: 0.85, dy: 0.85))
        let endChirho = appChirho.coordinate(withNormalizedOffset: CGVector(dx: 0.15, dy: 0.85))
        startChirho.press(forDuration: 0.05, thenDragTo: endChirho)
        XCTAssertTrue(appChirho.staticTexts["Proverbs 1:2"].firstMatch.waitForExistence(timeout: 30))
        XCTAssertFalse(appChirho.buttons["Stop"].exists, "navigation cancels the previous soundtrack")
        appChirho.swipeUp()
        XCTAssertTrue(appChirho.staticTexts["Proverbs 1:2"].firstMatch.exists, "vertical scrolling never steps")
        keepChirho(appChirho, "verse-after-swipe-en")
    }

    @MainActor
    func testBeginningDisablesPreviousAndSettingsOffersNormalChirho() {
        let appChirho = launchChirho("Gen.1.1", "en")
        XCTAssertTrue(appChirho.staticTexts["Genesis 1:1"].firstMatch.waitForExistence(timeout: 30))
        appChirho.buttons["Settings"].tap()
        XCTAssertTrue(appChirho.buttons["Normal · 1×"].waitForExistence(timeout: 5))
        appChirho.buttons["Normal · 1×"].tap()
        appChirho.swipeUp()
        appChirho.swipeUp()
        XCTAssertTrue(appChirho.buttons["Previous verse"].waitForExistence(timeout: 10))
        XCTAssertFalse(appChirho.buttons["Previous verse"].isEnabled)
    }
}
