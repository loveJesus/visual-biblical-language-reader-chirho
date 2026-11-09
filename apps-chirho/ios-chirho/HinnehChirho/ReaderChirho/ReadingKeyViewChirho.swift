// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import HinnehCoreChirho
import SwiftUI

/// The full reading key for the verse's language, as the website explains it.
struct ReadingKeyViewChirho: View {
    let scriptChirho: ScriptChirho
    let modelChirho: ReaderModelChirho
    @Environment(\.dismiss) private var dismissChirho

    private var rowsChirho: [LegendRowChirho] {
        scriptChirho == .greekChirho
            ? TeachingTablesChirho.sharedChirho.legendGreekChirho : TeachingTablesChirho.sharedChirho.legendHebrewChirho
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Text(modelChirho.messagesChirho.readingKeyHintChirho).font(.callout)
                    if let tourLinkChirho = PolicyLinksViewChirho.pageLinkChirho("tutorial-chirho", modelChirho.localeChirho) {
                        Link(destination: tourLinkChirho) {
                            Label(modelChirho.messagesChirho.watchTourChirho, systemImage: "play.rectangle")
                        }
                        .accessibilityHint(modelChirho.messagesChirho.opensBrowserChirho)
                    }
                }
                ForEach(rowsChirho) { rowChirho in
                    Section(rowChirho.labelChirho(modelChirho.localeChirho)) {
                        ForEach(rowChirho.itemsChirho) { itemChirho in
                            let languageChirho = itemChirho.shownLanguageChirho(modelChirho.localeChirho)
                            VStack(alignment: .leading, spacing: 4) {
                                Text(TaggedTextChirho.textChirho(itemChirho.labelChirho(modelChirho.localeChirho),
                                                                 languageChirho))
                                    .font(.headline)
                                Text(TaggedTextChirho.textChirho(itemChirho.helpChirho(modelChirho.localeChirho),
                                                                 languageChirho))
                                    .font(.callout)
                                if scriptChirho == .hebrewChirho,
                                   let referenceChirho = GrammarCreditViewChirho.referenceChirho(itemChirho) {
                                    Link(modelChirho.messagesChirho.grammarReferenceChirho + " ↗",
                                         destination: referenceChirho)
                                        .font(.footnote)
                                }
                            }
                        }
                    }
                }
                if scriptChirho == .hebrewChirho {
                    Section { GrammarCreditViewChirho(messagesChirho: modelChirho.messagesChirho) }
                }
                Section(modelChirho.messagesChirho.studyAidsChirho) {
                    Text(modelChirho.messagesChirho.studyAidsHelpChirho)
                    PolicyLinksViewChirho(messagesChirho: modelChirho.messagesChirho,
                                          localeChirho: modelChirho.localeChirho)
                }
            }
            .navigationTitle(modelChirho.messagesChirho.readingKeyChirho)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button(modelChirho.messagesChirho.doneChirho) { dismissChirho() }
                }
            }
        }
    }
}
