// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import HinnehCoreChirho
import SwiftUI

/// The required credit for the Hebrew reading-key explanations, which adapt unfoldingWord Hebrew
/// Grammar under CC BY-SA 4.0. It accompanies the adapted text wherever it is shown.
struct GrammarCreditViewChirho: View {
    let messagesChirho: MessagesChirho

    static let grammarLinkChirho = URL(string: "https://uhg.readthedocs.io/en/stable/")
    static let licenseLinkChirho = URL(string: "https://creativecommons.org/licenses/by-sa/4.0/")

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(MessagesChirho.fillChirho(messagesChirho.grammarCreditChirho, ["license_chirho": "CC BY-SA 4.0"]))
                .font(.footnote)
                .foregroundStyle(.secondary)
            HStack(spacing: 16) {
                if let grammarChirho = Self.grammarLinkChirho {
                    Link("unfoldingWord Hebrew Grammar", destination: grammarChirho)
                }
                if let licenseChirho = Self.licenseLinkChirho {
                    Link("CC BY-SA 4.0", destination: licenseChirho)
                }
            }
            .font(.footnote)
        }
    }

    /// A legend item's own reference page, only when it is plain HTTPS.
    static func referenceChirho(_ itemChirho: LegendItemChirho) -> URL? {
        guard let textChirho = itemChirho.sourceChirho, let urlChirho = URL(string: textChirho),
              urlChirho.scheme == "https", urlChirho.user == nil, urlChirho.password == nil,
              urlChirho.host?.isEmpty == false
        else { return nil }
        return urlChirho
    }
}
