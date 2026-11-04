// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import XCTest

/// The privacy policy remains reachable even when a verse cannot be loaded.
final class PolicyUITestsChirho: XCTestCase {
    override func setUp() { continueAfterFailure = false }

    @MainActor
    private func openChirho(_ localeChirho: String) -> XCUIApplication {
        let appChirho = XCUIApplication()
        appChirho.launchArguments = ["-hinneh-open-chirho", "Prov.1.200", "-hinneh-locale-chirho", localeChirho]
        appChirho.launch()
        return appChirho
    }

    @MainActor
    private func linkChirho(_ appChirho: XCUIApplication, _ titleChirho: String) -> XCUIElement {
        appChirho.descendants(matching: .any).matching(NSPredicate(format: "label == %@", titleChirho)).firstMatch
    }

    @MainActor
    func testPrivacyLinkOpensPolicyChirho() {
        let appChirho = openChirho("en")
        let privacyChirho = linkChirho(appChirho, "Privacy policy")
        XCTAssertTrue(privacyChirho.waitForExistence(timeout: 15))
        for _ in 0..<4 {
            if privacyChirho.isHittable { break }
            appChirho.swipeUp()
        }
        XCTAssertTrue(privacyChirho.isHittable)
        privacyChirho.tap()
        let safariChirho = XCUIApplication(bundleIdentifier: "com.apple.mobilesafari")
        XCTAssertTrue(safariChirho.wait(for: .runningForeground, timeout: 15))
        XCTAssertTrue(safariChirho.webViews.firstMatch.waitForExistence(timeout: 30))
        XCTAssertTrue(safariChirho.webViews.staticTexts["Privacy"].firstMatch.waitForExistence(timeout: 30))
    }

    @MainActor
    func testSpanishPolicyAndSourceLinksAreAvailableWithoutAVerseChirho() {
        let appChirho = openChirho("es")
        for titleChirho in ["Política de privacidad", "Acerca de y soporte", "Código fuente"] {
            XCTAssertTrue(linkChirho(appChirho, titleChirho).waitForExistence(timeout: 15))
        }
    }
}
