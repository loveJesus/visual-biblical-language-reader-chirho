// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import HinnehCoreChirho
import SwiftUI

/// One word's meaning, lexical form, grammar, pictures and saved pronunciation.
struct WordDetailViewChirho: View {
    let wordChirho: WordDisplayChirho
    let scriptChirho: ScriptChirho
    let modelChirho: ReaderModelChirho
    @Environment(\.dismiss) private var dismissChirho

    private var messagesChirho: MessagesChirho { modelChirho.messagesChirho }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Text(sourceChirho(wordChirho.textChirho))
                        .font(.system(.largeTitle, design: scriptChirho == .hebrewChirho ? .serif : .default))
                        .frame(maxWidth: .infinity, alignment: .center)
                        .textSelection(.enabled)
                    if let clipChirho = modelChirho.audioChirho.wordClipsChirho[wordChirho.idChirho] {
                        audioRowChirho(clipChirho)
                    } else {
                        Text(wordChirho.isAramaicChirho ? messagesChirho.aramaicAudioChirho
                             : scriptChirho == .greekChirho ? messagesChirho.renditionMissingChirho
                             : messagesChirho.audioUnavailableChirho)
                            .font(.footnote).foregroundStyle(.secondary)
                    }
                }
                meaningSectionChirho
                morphologySectionChirho
                pictureSectionChirho
                marksSectionChirho
                Section {
                    Link(messagesChirho.studyAidsChirho,
                         destination: URL(string: "https://hinneh.us/about-chirho/?lang_chirho=\(modelChirho.localeChirho.rawValue)#study-aids-chirho")!)
                }
            }
            .navigationTitle(wordChirho.textChirho)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button(messagesChirho.doneChirho) { dismissChirho() }
                }
            }
        }
    }

    private func audioRowChirho(_ clipChirho: ClipChirho) -> some View {
        let activeChirho = modelChirho.playerChirho.activeIdChirho == wordChirho.idChirho
        return VStack(alignment: .leading, spacing: 4) {
            Button {
                modelChirho.playerChirho.toggleChirho(clipChirho, idChirho: wordChirho.idChirho)
            } label: {
                Label(activeChirho ? messagesChirho.stopChirho
                      : MessagesChirho.fillChirho(messagesChirho.playWordChirho, ["word_chirho": wordChirho.textChirho]),
                      systemImage: activeChirho ? "stop.circle" : "speaker.wave.2")
            }
            if modelChirho.playerChirho.failedIdChirho == wordChirho.idChirho {
                Text(messagesChirho.audioFailedChirho).font(.footnote).foregroundStyle(.red)
            }
        }
    }

    private var meaningSectionChirho: some View {
        Section(messagesChirho.meaningChirho) {
            if modelChirho.localeChirho == .spanishChirho { spanishRowChirho }
            VStack(alignment: .leading, spacing: 4) {
                switch wordChirho.glossChirho {
                case nil: Text(messagesChirho.glossUnavailableChirho)
                case "-": Text(messagesChirho.notSeparatelyTranslatedChirho)
                case let glossChirho?: Text(TaggedTextChirho.textChirho(glossChirho, "en")).font(.title3)
                }
            }
        }
    }

    @ViewBuilder private var spanishRowChirho: some View {
        VStack(alignment: .leading, spacing: 4) {
            switch modelChirho.spanishChirho {
            case .readyChirho(let glossesChirho, _):
                if let glossChirho = glossesChirho[wordChirho.idChirho] ?? nil {
                    Text(TaggedTextChirho.textChirho(glossChirho, "es")).font(.title3)
                } else {
                    Text(messagesChirho.spanishGlossMissingChirho)
                }
            case .staleChirho: Text(messagesChirho.spanishLayerStaleChirho)
            case .absentChirho: Text(messagesChirho.spanishLayerUnavailableChirho)
            case nil: ProgressView()
            }
        }
    }

    private var morphologySectionChirho: some View {
        Section(messagesChirho.morphologyChirho) {
            Text(MorphologyChirho.summaryChirho(wordChirho, modelChirho.localeChirho))
            LabeledContent(messagesChirho.lexicalFormChirho) {
                Text(sourceChirho(wordChirho.lexicalFormChirho)).textSelection(.enabled)
            }
            LabeledContent(messagesChirho.lemmaChirho, value: wordChirho.lemmaIdChirho
                           + (wordChirho.lemmaAugmentChirho.map { " (\($0))" } ?? ""))
            if let hebrewChirho = wordChirho.hebrewChirho {
                ForEach(hebrewChirho.qereChirho) { qereChirho in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(messagesChirho.qereChirho).font(.headline)
                        Text(sourceChirho(qereChirho.textChirho)).font(.title2)
                        if let glossChirho = qereChirho.glossChirho { Text(TaggedTextChirho.textChirho(glossChirho, "en")) }
                        Text(messagesChirho.qereNoteChirho).font(.footnote).foregroundStyle(.secondary)
                    }
                }
            }
            if wordChirho.isAramaicChirho { Text(messagesChirho.aramaicNoteChirho) }
        }
    }

    @ViewBuilder private var pictureSectionChirho: some View {
        Section(messagesChirho.wordPictureChirho) {
            if let pictureChirho = modelChirho.mediaChirho.picturesChirho[wordChirho.idChirho] {
                HStack(alignment: .top, spacing: 14) {
                    VerifiedImageChirho(
                        pathChirho: pictureChirho.recordChirho.assetPathChirho,
                        sha256Chirho: pictureChirho.recordChirho.sha256Chirho,
                        altChirho: pictureChirho.recordChirho.altChirho, storeChirho: modelChirho.artworkChirho
                    ) { _ in Text("◇") }
                        .frame(width: 96, height: 96)
                    VStack(alignment: .leading, spacing: 6) {
                        Text(MessagesChirho.fillChirho(
                            pictureChirho.assignmentChirho == .contextualChirho
                                ? messagesChirho.contextualPictureChirho : messagesChirho.generalPictureChirho,
                            ["meaning_chirho": pictureChirho.recordChirho.contextualMeaningChirho]))
                        if pictureChirho.assignmentChirho == .generalChirho {
                            Text(messagesChirho.generalPictureCaveatChirho).font(.footnote)
                        }
                    }
                }
                if !pictureChirho.alternativesChirho.isEmpty {
                    Text(messagesChirho.otherMeaningsChirho).font(.headline)
                    ScrollView(.horizontal) {
                        HStack(spacing: 12) {
                            ForEach(pictureChirho.alternativesChirho) { alternativeChirho in
                                VStack {
                                    VerifiedImageChirho(
                                        pathChirho: alternativeChirho.assetPathChirho,
                                        sha256Chirho: alternativeChirho.sha256Chirho,
                                        altChirho: alternativeChirho.altChirho, storeChirho: modelChirho.artworkChirho
                                    ) { _ in Text("◇") }
                                        .frame(width: 64, height: 64)
                                    Text(alternativeChirho.contextualMeaningChirho).font(.caption)
                                }
                                .frame(width: 96)
                            }
                        }
                    }
                }
            } else {
                Text(messagesChirho.pictureUnavailableChirho).foregroundStyle(.secondary)
            }
        }
    }

    private var marksSectionChirho: some View {
        Section {
            ForEach(MorphologyChirho.legendChirho(wordChirho)) { itemChirho in
                let languageChirho = itemChirho.shownLanguageChirho(modelChirho.localeChirho)
                VStack(alignment: .leading, spacing: 4) {
                    Text(TaggedTextChirho.textChirho(itemChirho.labelChirho(modelChirho.localeChirho), languageChirho))
                        .font(.headline)
                    Text(TaggedTextChirho.textChirho(itemChirho.helpChirho(modelChirho.localeChirho), languageChirho))
                        .font(.callout)
                }
            }
        } header: {
            Text(messagesChirho.marksChirho)
        } footer: {
            if scriptChirho == .hebrewChirho { GrammarCreditViewChirho(messagesChirho: messagesChirho) }
        }
    }

    private func sourceChirho(_ textChirho: String) -> AttributedString {
        TaggedTextChirho.sourceChirho(textChirho, scriptChirho)
    }
}
