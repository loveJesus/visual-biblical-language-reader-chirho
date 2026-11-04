// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import XCTest
import UIKit

/// Opt-in store capture. The workflow copies this file into an isolated project, never the
/// ordinary test target. See spec-chirho/workflows-chirho/native-chirho/store-assets-chirho.md.
final class StoreCaptureChirho: XCTestCase {
    override func setUp() {
        continueAfterFailure = false
    }

    @MainActor
    private func openChirho(_ passageChirho: String, _ localeChirho: String) -> XCUIApplication {
        let appChirho = XCUIApplication()
        appChirho.launchArguments = ["-hinneh-open-chirho", passageChirho,
                                    "-hinneh-locale-chirho", localeChirho,
                                    "-AppleInterfaceStyle", "Light"]
        appChirho.launch()
        return appChirho
    }

    @MainActor
    private func wordChirho(_ appChirho: XCUIApplication, _ prefixChirho: String) -> XCUIElement {
        appChirho.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", prefixChirho)).firstMatch
    }

    @MainActor
    private func keepChirho(_ appChirho: XCUIApplication, _ nameChirho: String) {
        // Remote image decoding is asynchronous after the verified text is ready. The renderer
        // still requires a human inspection; this delay is not proof of image completeness.
        let settledChirho = expectation(description: "settle verified media")
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) { settledChirho.fulfill() }
        wait(for: [settledChirho], timeout: 8)
        let attachmentChirho = XCTAttachment(screenshot: appChirho.screenshot())
        attachmentChirho.name = nameChirho
        attachmentChirho.lifetime = .keepAlways
        add(attachmentChirho)
    }

    @MainActor
    private func captureChirho(_ localeChirho: String) {
        let spanishChirho = localeChirho == "es"
        var appChirho = openChirho("Gen.1.1", localeChirho)
        let firstChirho = wordChirho(appChirho, "בְּרֵאשִׁ֖ית")
        XCTAssertTrue(firstChirho.waitForExistence(timeout: 45))
        keepChirho(appChirho, "01-behold-\(localeChirho)-chirho")

        // Scroll only if necessary, keeping the actual word and its corner speaker in view.
        if !firstChirho.isHittable { appChirho.swipeUp() }
        firstChirho.tap()
        XCTAssertTrue(appChirho.navigationBars[spanishChirho ? "Mire más de cerca" : "Look closer"]
            .waitForExistence(timeout: 10))
        keepChirho(appChirho, "02-meaning-\(localeChirho)-chirho")
        appChirho.buttons[spanishChirho ? "Listo" : "Done"].tap()

        appChirho = openChirho("John.1.1", localeChirho)
        let greekChirho = wordChirho(appChirho, "Ἐν")
        XCTAssertTrue(greekChirho.waitForExistence(timeout: 45))
        // A reading screenshot must show words, not merely a full-height scene.
        appChirho.swipeUp()
        if UIDevice.current.userInterfaceIdiom == .phone {
            // The phone's short viewport otherwise stops with the first Greek row above the
            // navigation bar. Bring the opening words back into view without changing the UI.
            appChirho.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.34))
                .press(forDuration: 0.1, thenDragTo: appChirho.coordinate(
                    withNormalizedOffset: CGVector(dx: 0.5, dy: 0.49)))
        }
        keepChirho(appChirho, "03-greek-\(localeChirho)-chirho")

        appChirho = openChirho("Prov.26.1", localeChirho)
        XCTAssertTrue(wordChirho(appChirho, "כַּשֶּׁ֤לֶג").waitForExistence(timeout: 45))
        appChirho.swipeUp()
        keepChirho(appChirho, "04-hebrew-\(localeChirho)-chirho")

        let keyChirho = appChirho.buttons[spanishChirho ? "Clave de lectura" : "Reading key"]
        XCTAssertTrue(keyChirho.waitForExistence(timeout: 10))
        keyChirho.tap()
        XCTAssertTrue(appChirho.navigationBars[spanishChirho ? "Clave de lectura" : "Reading key"]
            .waitForExistence(timeout: 10))
        keepChirho(appChirho, "05-grammar-\(localeChirho)-chirho")
        appChirho.buttons[spanishChirho ? "Listo" : "Done"].tap()

        let passageChirho = appChirho.buttons.matching(NSPredicate(format: "label BEGINSWITH %@",
            spanishChirho ? "Elegir un pasaje" : "Choose a passage")).firstMatch
        XCTAssertTrue(passageChirho.waitForExistence(timeout: 10))
        passageChirho.tap()
        keepChirho(appChirho, "06-library-\(localeChirho)-chirho")
        appChirho.terminate()
    }

    @MainActor func testEnglishChirho() { captureChirho("en") }
    @MainActor func testSpanishChirho() { captureChirho("es") }
}
