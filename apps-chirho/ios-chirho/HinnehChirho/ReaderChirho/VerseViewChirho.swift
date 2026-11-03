// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import HinnehCoreChirho
import SwiftUI

/// The verse in reading order: Hebrew flows right to left, Greek left to right. Source
/// punctuation travels on the text line with the word it follows.
struct VerseViewChirho: View {
    let verseChirho: VerseDisplayChirho
    let modelChirho: ReaderModelChirho
    let openChirho: (WordDisplayChirho) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            FlowLayoutChirho {
                ForEach(verseChirho.wordsChirho) { wordChirho in
                    WordBoxChirho(
                        wordChirho: wordChirho, scriptChirho: verseChirho.scriptChirho,
                        pictureChirho: modelChirho.mediaChirho.picturesChirho[wordChirho.idChirho],
                        clipChirho: modelChirho.audioChirho.wordClipsChirho[wordChirho.idChirho],
                        modelChirho: modelChirho
                    ) { openChirho(wordChirho) }
                }
            }
            .environment(\.layoutDirection,
                         verseChirho.scriptChirho == .hebrewChirho ? .rightToLeft : .leftToRight)
            .frame(maxWidth: .infinity, alignment: verseChirho.scriptChirho == .hebrewChirho ? .trailing : .leading)
            Text(verseChirho.scriptChirho == .hebrewChirho
                 ? modelChirho.messagesChirho.readRightToLeftChirho
                 : modelChirho.messagesChirho.readLeftToRightChirho)
                .font(.footnote)
                .foregroundStyle(PaletteChirho.quietChirho)
        }
        .accessibilityElement(children: .contain)
    }
}
