// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation

/// A read form (qere) shown beside its written word.
public struct QereDisplayChirho: Sendable, Hashable, Identifiable {
    public let idChirho: String
    public let textChirho: String
    public let glossChirho: String?
    public let analysisChirho: String
    public var id: String { idChirho }
}

/// Hebrew facts that only the Hebrew word card shows.
public struct HebrewFactsChirho: Sendable, Hashable {
    public let genderChirho: String
    public let numberChirho: String
    public let stateChirho: String
    public let rootTextChirho: String?
    public let rootEntryIdChirho: String?
    public let rootStatusChirho: String
    public let rootNoteChirho: String
    public let verbStemChirho: String?
    public let verbFormChirho: String?
    public let verbConstructionChirho: String?
    public let verbCodeChirho: String?
    public let glossOriginChirho: String?
    public let qereChirho: [QereDisplayChirho]
    public let formNoteChirho: FormNoteChirho?
    public let writtenReadingChirho: Bool
}

/// Greek facts that only the Greek word card shows.
public struct GreekFactsChirho: Sendable, Hashable {
    public let partOfSpeechChirho: String
    public let caseChirho: String
    public let numberChirho: String
    public let genderChirho: String
    public let personChirho: String?
    public let tenseChirho: String?
    public let voiceChirho: String?
    public let moodChirho: String?
    public let rawFormMorphologyChirho: String
    public let rawStrongsChirho: String
}

/// One source word ready to draw: exact text, attached punctuation for display, its spoken form,
/// cues and the facts its card explains.
public struct WordDisplayChirho: Sendable, Hashable, Identifiable {
    public let idChirho: String
    public let positionChirho: Int
    /// The word's span in the canonical text, in the publisher's UTF-16 offsets.
    public let startChirho: Int
    public let endChirho: Int
    public let textChirho: String
    public let surfaceChirho: String
    public let spokenTextChirho: String
    public let lemmaIdChirho: String
    public let lemmaAugmentChirho: String?
    public let lexicalFormChirho: String
    public let glossChirho: String?
    public let analysisChirho: String
    public let sourceNoteChirho: String
    public let rawMorphologyChirho: String
    public let cuesChirho: CueSetChirho
    public let isAramaicChirho: Bool
    public let lemmaReviewPendingChirho: Bool
    public let hebrewChirho: HebrewFactsChirho?
    public let greekChirho: GreekFactsChirho?

    public var id: String { idChirho }
}

public struct VerseDisplayChirho: Sendable, Hashable {
    public let idChirho: String
    public let scriptChirho: ScriptChirho
    public let canonicalTextChirho: String
    public let spokenTextChirho: String
    /// The words in reading order; source punctuation travels in each word's surface.
    public let wordsChirho: [WordDisplayChirho]
    public let translationChirho: String?
    public let glossOriginChirho: String?
    public let kjvVerseIdChirho: String?
    public let sourcesChirho: [SourceRecordChirho]
    public let sourceNotesChirho: [SourceNoteChirho]

    public var hasAramaicChirho: Bool { wordsChirho.contains(where: \.isAramaicChirho) }

    public init(_ lessonChirho: VerseLessonChirho, tablesChirho: TeachingTablesChirho = .sharedChirho) {
        switch lessonChirho {
        case .hebrewChirho(let hebrewChirho): self.init(hebrewChirho: hebrewChirho, tablesChirho)
        case .greekChirho(let greekChirho): self.init(greekChirho: greekChirho, tablesChirho)
        }
    }

    private init(hebrewChirho lessonChirho: HebrewLessonChirho, _ tablesChirho: TeachingTablesChirho) {
        let canonicalChirho = lessonChirho.canonicalTextChirho
        // Punctuation between words (maqaf, paseq, sof pasuq) stays on the text line with the word
        // it follows, so it can never wrap onto a line of its own or float beside the pictures.
        var surfacesChirho = lessonChirho.tokensChirho.map(\.textChirho)
        var markCursorChirho = 0
        for (indexChirho, tokenChirho) in lessonChirho.tokensChirho.enumerated() {
            let startChirho = tokenChirho.startChirho ?? markCursorChirho
            let markChirho = Self.markChirho(canonicalChirho, markCursorChirho, startChirho)
            if indexChirho == 0 {
                surfacesChirho[0] = markChirho.trimmingCharacters(in: .whitespaces) + surfacesChirho[0]
            } else {
                surfacesChirho[indexChirho - 1] += markChirho
            }
            markCursorChirho = tokenChirho.endChirho ?? startChirho
        }
        if let lastChirho = surfacesChirho.indices.last {
            surfacesChirho[lastChirho] += Self.markChirho(
                canonicalChirho, markCursorChirho, ExactTextChirho.lengthChirho(canonicalChirho))
        }
        var cursorChirho = 0
        var wordsChirho: [WordDisplayChirho] = []
        for (indexChirho, tokenChirho) in lessonChirho.tokensChirho.enumerated() {
            let startChirho = tokenChirho.startChirho ?? cursorChirho
            cursorChirho = tokenChirho.endChirho ?? startChirho
            let qereChirho = (tokenChirho.qereChirho ?? []).map {
                QereDisplayChirho(idChirho: $0.idChirho, textChirho: $0.textChirho,
                                  glossChirho: $0.glossChirho, analysisChirho: $0.analysisChirho)
            }
            wordsChirho.append(WordDisplayChirho(
                idChirho: tokenChirho.idChirho, positionChirho: indexChirho,
                startChirho: startChirho, endChirho: tokenChirho.endChirho ?? startChirho,
                textChirho: tokenChirho.textChirho, surfaceChirho: surfacesChirho[indexChirho],
                spokenTextChirho: SpokenOverridesChirho.wordChirho(tokenChirho),
                lemmaIdChirho: tokenChirho.lemmaIdChirho, lemmaAugmentChirho: tokenChirho.lemmaAugmentChirho,
                lexicalFormChirho: tokenChirho.lexicalFormChirho, glossChirho: tokenChirho.glossChirho,
                analysisChirho: tokenChirho.analysisChirho, sourceNoteChirho: tokenChirho.sourceNoteChirho,
                rawMorphologyChirho: tokenChirho.rawMorphologyChirho,
                cuesChirho: CuesChirho.hebrewChirho(tokenChirho, tablesChirho),
                isAramaicChirho: tokenChirho.sourceLanguageChirho == "arc",
                lemmaReviewPendingChirho: tokenChirho.lemmaAssignmentStatusChirho == "source_review_required",
                hebrewChirho: HebrewFactsChirho(
                    genderChirho: tokenChirho.genderChirho, numberChirho: tokenChirho.numberChirho,
                    stateChirho: tokenChirho.stateChirho, rootTextChirho: tokenChirho.rootTextChirho,
                    rootEntryIdChirho: tokenChirho.rootEntryIdChirho,
                    rootStatusChirho: tokenChirho.rootStatusChirho, rootNoteChirho: tokenChirho.rootNoteChirho,
                    verbStemChirho: tokenChirho.verbStemChirho, verbFormChirho: tokenChirho.verbFormChirho,
                    verbConstructionChirho: tokenChirho.verbConstructionChirho,
                    verbCodeChirho: tokenChirho.verbCodeChirho,
                    glossOriginChirho: tokenChirho.glossOriginChirho ?? lessonChirho.glossOriginChirho,
                    qereChirho: qereChirho, formNoteChirho: tokenChirho.formNoteChirho,
                    writtenReadingChirho: !qereChirho.isEmpty),
                greekChirho: nil))
        }
        self.init(idChirho: lessonChirho.idChirho, scriptChirho: .hebrewChirho,
                  canonicalTextChirho: canonicalChirho, wordsChirho: wordsChirho,
                  translationChirho: lessonChirho.translationChirho,
                  glossOriginChirho: lessonChirho.glossOriginChirho,
                  kjvVerseIdChirho: lessonChirho.kjvVerseIdChirho, sourcesChirho: lessonChirho.sourcesChirho,
                  sourceNotesChirho: lessonChirho.sourceNotesChirho ?? [],
                  spokenTextChirho: SpokenOverridesChirho.verseChirho(lessonChirho))
    }

    private init(greekChirho lessonChirho: GreekLessonChirho, _ tablesChirho: TeachingTablesChirho) {
        let canonicalChirho = lessonChirho.canonicalTextChirho
        let tokensChirho = lessonChirho.tokensChirho
        // Punctuation joins the word it touches, as on the website; spaces separate words.
        var surfacesChirho = tokensChirho.map(\.textChirho)
        var endChirho = 0
        for (indexChirho, tokenChirho) in tokensChirho.enumerated() {
            let gapChirho = ExactTextChirho.sliceChirho(canonicalChirho, endChirho, tokenChirho.startChirho) ?? ""
            if indexChirho == 0 {
                surfacesChirho[0] = gapChirho.trimmingCharacters(in: .whitespacesAndNewlines) + surfacesChirho[0]
            } else {
                let (trailingChirho, leadingChirho) = Self.splitGapChirho(gapChirho)
                surfacesChirho[indexChirho - 1] += trailingChirho
                surfacesChirho[indexChirho] = leadingChirho + surfacesChirho[indexChirho]
            }
            endChirho = tokenChirho.endChirho
        }
        if let lastChirho = surfacesChirho.indices.last {
            let tailChirho = ExactTextChirho.sliceChirho(
                canonicalChirho, endChirho, ExactTextChirho.lengthChirho(canonicalChirho)) ?? ""
            surfacesChirho[lastChirho] += tailChirho.trimmingCharacters(in: .whitespacesAndNewlines)
        }
        let wordsChirho = tokensChirho.enumerated().map { indexChirho, tokenChirho in
            WordDisplayChirho(
                idChirho: tokenChirho.idChirho, positionChirho: indexChirho,
                startChirho: tokenChirho.startChirho, endChirho: tokenChirho.endChirho,
                textChirho: tokenChirho.textChirho,
                surfaceChirho: surfacesChirho[indexChirho], spokenTextChirho: tokenChirho.textChirho,
                lemmaIdChirho: tokenChirho.lemmaIdChirho, lemmaAugmentChirho: nil,
                lexicalFormChirho: tokenChirho.lexicalFormChirho, glossChirho: tokenChirho.glossChirho,
                analysisChirho: tokenChirho.analysisChirho, sourceNoteChirho: tokenChirho.sourceNoteChirho,
                rawMorphologyChirho: tokenChirho.rawMorphologyChirho,
                cuesChirho: CuesChirho.greekChirho(tokenChirho, tablesChirho),
                isAramaicChirho: false, lemmaReviewPendingChirho: false, hebrewChirho: nil,
                greekChirho: GreekFactsChirho(
                    partOfSpeechChirho: tokenChirho.partOfSpeechChirho, caseChirho: tokenChirho.caseChirho,
                    numberChirho: tokenChirho.numberChirho, genderChirho: tokenChirho.genderChirho,
                    personChirho: tokenChirho.personChirho, tenseChirho: tokenChirho.tenseChirho,
                    voiceChirho: tokenChirho.voiceChirho, moodChirho: tokenChirho.moodChirho,
                    rawFormMorphologyChirho: tokenChirho.rawFormMorphologyChirho,
                    rawStrongsChirho: tokenChirho.rawStrongsChirho))
        }
        self.init(idChirho: lessonChirho.idChirho, scriptChirho: .greekChirho,
                  canonicalTextChirho: canonicalChirho, wordsChirho: wordsChirho, translationChirho: nil,
                  glossOriginChirho: lessonChirho.glossOriginChirho, kjvVerseIdChirho: nil,
                  sourcesChirho: lessonChirho.sourcesChirho, sourceNotesChirho: lessonChirho.sourceNotesChirho ?? [])
    }

    private init(idChirho: String, scriptChirho: ScriptChirho, canonicalTextChirho: String,
                 wordsChirho: [WordDisplayChirho], translationChirho: String?,
                 glossOriginChirho: String?, kjvVerseIdChirho: String?, sourcesChirho: [SourceRecordChirho],
                 sourceNotesChirho: [SourceNoteChirho], spokenTextChirho: String? = nil) {
        self.idChirho = idChirho
        self.scriptChirho = scriptChirho
        self.canonicalTextChirho = canonicalTextChirho
        self.spokenTextChirho = spokenTextChirho ?? canonicalTextChirho
        self.wordsChirho = wordsChirho
        self.translationChirho = translationChirho
        self.glossOriginChirho = glossOriginChirho
        self.kjvVerseIdChirho = kjvVerseIdChirho
        self.sourcesChirho = sourcesChirho
        self.sourceNotesChirho = sourceNotesChirho
    }

    /// The punctuation in a Hebrew gap, with one space where the source sets it apart from the
    /// word before (as with paseq) and none where it is joined (maqaf, sof pasuq).
    static func markChirho(_ canonicalChirho: String, _ fromChirho: Int, _ toChirho: Int) -> String {
        guard toChirho > fromChirho,
              let gapChirho = ExactTextChirho.sliceChirho(canonicalChirho, fromChirho, toChirho)
        else { return "" }
        let markChirho = gapChirho.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !markChirho.isEmpty else { return "" }
        return (gapChirho.unicodeScalars.first?.properties.isWhitespace == true ? " " : "") + markChirho
    }

    /// Splits a Greek gap into the part that closes the previous word and the part that opens
    /// the next one, around the separating whitespace.
    static func splitGapChirho(_ gapChirho: String) -> (String, String) {
        let scalarsChirho = Array(gapChirho.unicodeScalars)
        guard let firstSpaceChirho = scalarsChirho.firstIndex(where: \.properties.isWhitespace),
              let lastSpaceChirho = scalarsChirho.lastIndex(where: \.properties.isWhitespace)
        else { return (gapChirho, "") }
        var trailingChirho = String.UnicodeScalarView()
        trailingChirho.append(contentsOf: scalarsChirho[..<firstSpaceChirho])
        var leadingChirho = String.UnicodeScalarView()
        leadingChirho.append(contentsOf: scalarsChirho[(lastSpaceChirho + 1)...])
        return (String(trailingChirho), String(leadingChirho))
    }
}
