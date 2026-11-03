// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import HinnehCoreChirho
import SwiftUI

/// The exact source text and every source behind what is shown, with its license and revision.
struct SourcesViewChirho: View {
    let verseChirho: VerseDisplayChirho
    let modelChirho: ReaderModelChirho

    private var messagesChirho: MessagesChirho { modelChirho.messagesChirho }

    private var sourcesChirho: [SourceRecordChirho] {
        guard modelChirho.localeChirho == .spanishChirho,
              case .readyChirho(_, let spanishSourceChirho) = modelChirho.spanishChirho
        else { return verseChirho.sourcesChirho }
        return verseChirho.sourcesChirho + [spanishSourceChirho]
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            DisclosureGroup(messagesChirho.exactTextChirho) {
                VStack(alignment: .leading, spacing: 8) {
                    Text(TaggedTextChirho.sourceChirho(verseChirho.canonicalTextChirho, verseChirho.scriptChirho))
                        .font(.system(.title2, design: verseChirho.scriptChirho == .hebrewChirho ? .serif : .default))
                        .multilineTextAlignment(verseChirho.scriptChirho == .hebrewChirho ? .trailing : .leading)
                        .frame(maxWidth: .infinity,
                               alignment: verseChirho.scriptChirho == .hebrewChirho ? .trailing : .leading)
                        .environment(\.layoutDirection,
                                     verseChirho.scriptChirho == .hebrewChirho ? .rightToLeft : .leftToRight)
                        .textSelection(.enabled)
                    Text(messagesChirho.exactTextNoteChirho).font(.footnote).foregroundStyle(.secondary)
                }
                .padding(.top, 6)
            }
            DisclosureGroup(messagesChirho.sourcesChirho) {
                VStack(alignment: .leading, spacing: 12) {
                    ForEach(sourcesChirho) { sourceChirho in
                        VStack(alignment: .leading, spacing: 3) {
                            if let linkChirho = sourceChirho.safeLinkChirho {
                                Link(sourceChirho.titleChirho, destination: linkChirho)
                            } else {
                                Text(sourceChirho.titleChirho).bold()
                            }
                            Text(TaggedTextChirho.textChirho(
                                sourceChirho.attributionChirho + " · " + sourceChirho.licenseChirho, "en"))
                                .font(.footnote)
                            Text(MessagesChirho.fillChirho(messagesChirho.revisionChirho,
                                                           ["revision_chirho": sourceChirho.revisionChirho])
                                 + " · SHA-256 " + sourceChirho.sha256Chirho)
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                                .textSelection(.enabled)
                        }
                    }
                    if verseChirho.scriptChirho == .hebrewChirho {
                        GrammarCreditViewChirho(messagesChirho: messagesChirho)
                    }
                    ForEach(Array(verseChirho.sourceNotesChirho.enumerated()), id: \.offset) { _, noteChirho in
                        Text(TaggedTextChirho.textChirho(noteChirho.textChirho, "en"))
                            .font(.footnote)
                    }
                }
                .padding(.top, 6)
            }
        }
        .tint(PaletteChirho.quietChirho)
    }
}
