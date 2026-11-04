// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import HinnehCoreChirho
import SwiftUI

/// The reader's fixed information links: the privacy policy, About (which carries the contact
/// address) and the public source code. Every destination is a constant HTTPS address, on the
/// trusted origin or the public GitHub project; nothing is built from remote data. The website
/// pages open in the interface language.
struct PolicyLinksViewChirho: View {
    let messagesChirho: MessagesChirho
    let localeChirho: LocaleChirho

    static let sourceCodeLinkChirho = URL(string: "https://github.com/loveJesus/visual-biblical-language-reader-chirho")

    /// One of the website's own pages, in the given interface language.
    static func pageLinkChirho(_ slugChirho: String, _ localeChirho: LocaleChirho) -> URL? {
        URL(string: OriginChirho.baseChirho + "/\(slugChirho)/?lang_chirho=\(localeChirho.rawValue)")
    }

    var body: some View {
        // One discreet row, or a column when larger text no longer fits across.
        ViewThatFits(in: .horizontal) {
            HStack(spacing: 18) { linksChirho }
            VStack(alignment: .leading, spacing: 0) { linksChirho }
        }
        .font(.footnote)
        .tint(PaletteChirho.quietChirho)
    }

    @ViewBuilder private var linksChirho: some View {
        linkChirho(messagesChirho.privacyPolicyChirho, Self.pageLinkChirho("privacy-chirho", localeChirho))
        linkChirho(messagesChirho.aboutSupportChirho, Self.pageLinkChirho("about-chirho", localeChirho))
        linkChirho(messagesChirho.sourceCodeChirho, Self.sourceCodeLinkChirho)
    }

    /// Underlined so a link is told apart without colour, and at least 44 points tall to tap.
    @ViewBuilder private func linkChirho(_ titleChirho: String, _ destinationChirho: URL?) -> some View {
        if let destinationChirho {
            Link(destination: destinationChirho) {
                Text(titleChirho)
                    .underline()
                    .frame(minHeight: 44)
                    .contentShape(Rectangle())
            }
            .accessibilityHint(Text(messagesChirho.opensBrowserChirho))
        }
    }
}
