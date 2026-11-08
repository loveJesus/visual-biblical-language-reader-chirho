// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: native-reader spoken parity. Reviewed speech never substitutes the displayed source.
import Foundation

private struct SpokenIdentityChirho: Decodable, Sendable {
    let idChirho: String
    let textChirho: String
    let lemmaIdChirho: String
    let lemmaAugmentChirho: String?
    let rawMorphologyChirho: String
    let qereChirho: [SpokenIdentityChirho]?

    init(_ tokenChirho: HebrewTokenChirho) {
        idChirho = tokenChirho.idChirho
        textChirho = tokenChirho.textChirho
        lemmaIdChirho = tokenChirho.lemmaIdChirho
        lemmaAugmentChirho = tokenChirho.lemmaAugmentChirho
        rawMorphologyChirho = tokenChirho.rawMorphologyChirho
        qereChirho = tokenChirho.qereChirho?.map(Self.init)
    }
    init(_ tokenChirho: QereReadingChirho) {
        idChirho = tokenChirho.idChirho
        textChirho = tokenChirho.textChirho
        lemmaIdChirho = tokenChirho.lemmaIdChirho
        lemmaAugmentChirho = tokenChirho.lemmaAugmentChirho
        rawMorphologyChirho = tokenChirho.rawMorphologyChirho
        qereChirho = nil
    }
    init(_ reviewChirho: SpokenOverrideChirho) {
        idChirho = reviewChirho.tokenIdChirho
        textChirho = reviewChirho.textChirho
        lemmaIdChirho = reviewChirho.lemmaIdChirho
        lemmaAugmentChirho = reviewChirho.lemmaAugmentChirho
        rawMorphologyChirho = reviewChirho.rawMorphologyChirho
        qereChirho = reviewChirho.qereBindingChirho
    }
    func matchesChirho(_ otherChirho: SpokenIdentityChirho) -> Bool {
        let sameAugmentChirho: Bool
        switch (lemmaAugmentChirho, otherChirho.lemmaAugmentChirho) {
        case (nil, nil): sameAugmentChirho = true
        case let (leftChirho?, rightChirho?): sameAugmentChirho = ExactTextChirho.equalChirho(leftChirho, rightChirho)
        default: sameAugmentChirho = false
        }
        let ownQereChirho = qereChirho ?? []
        let otherQereChirho = otherChirho.qereChirho ?? []
        return ExactTextChirho.equalChirho(idChirho, otherChirho.idChirho)
            && ExactTextChirho.equalChirho(textChirho, otherChirho.textChirho)
            && ExactTextChirho.equalChirho(lemmaIdChirho, otherChirho.lemmaIdChirho)
            && sameAugmentChirho
            && ExactTextChirho.equalChirho(rawMorphologyChirho, otherChirho.rawMorphologyChirho)
            && ownQereChirho.count == otherQereChirho.count
            && zip(ownQereChirho, otherQereChirho).allSatisfy { $0.matchesChirho($1) }
    }
}
private struct SpokenOverrideChirho: Decodable, Sendable {
    let tokenIdChirho: String
    let textChirho: String
    let lemmaIdChirho: String
    let lemmaAugmentChirho: String?
    let rawMorphologyChirho: String
    let qereBindingChirho: [SpokenIdentityChirho]?
    let spokenReadingChirho: String
    let writtenGroupChirho: [SpokenIdentityChirho]?
    let canonicalTextChirho: String?

    func matchesChirho(_ tokenChirho: HebrewTokenChirho) -> Bool {
        SpokenIdentityChirho(self).matchesChirho(SpokenIdentityChirho(tokenChirho))
    }
}
private struct SpokenFileChirho: Decodable {
    let schemaVersionChirho: Int
    let wordsChirho: [SpokenOverrideChirho]
}

/// Exact port of the web's reviewed word and consecutive-group playback semantics.
enum SpokenOverridesChirho {
    private static let wordsChirho: [String: SpokenOverrideChirho] = {
        guard let urlChirho = Bundle.module.url(forResource: "spoken-overrides-chirho", withExtension: "json"),
              let dataChirho = try? Data(contentsOf: urlChirho),
              let fileChirho = try? DecodingChirho.decodeChirho(SpokenFileChirho.self, dataChirho),
              fileChirho.schemaVersionChirho == 1,
              Set(fileChirho.wordsChirho.map(\.tokenIdChirho)).count == fileChirho.wordsChirho.count
        else { preconditionFailure("Reviewed spoken overrides are exported with the app build.") }
        return Dictionary(uniqueKeysWithValues: fileChirho.wordsChirho.map { ($0.tokenIdChirho, $0) })
    }()
    private static func reviewChirho(_ tokenChirho: HebrewTokenChirho) -> SpokenOverrideChirho? {
        guard let noteChirho = wordsChirho[tokenChirho.idChirho], noteChirho.matchesChirho(tokenChirho) else { return nil }
        return noteChirho
    }
    static func sourceWordChirho(_ tokenChirho: HebrewTokenChirho) -> String {
        guard let qereChirho = tokenChirho.qereChirho, !qereChirho.isEmpty else { return tokenChirho.textChirho }
        return qereChirho.map(\.textChirho).joined(separator: " ")
    }
    static func wordChirho(_ tokenChirho: HebrewTokenChirho) -> String {
        // Explicit attached qere takes priority, exactly as spokenWordChirho on the website.
        if tokenChirho.qereChirho?.isEmpty == false { return sourceWordChirho(tokenChirho) }
        return reviewChirho(tokenChirho)?.spokenReadingChirho ?? tokenChirho.textChirho
    }
    static func verseChirho(_ lessonChirho: HebrewLessonChirho) -> String {
        var textChirho = ""
        var cursorChirho = 0
        let tokensChirho = lessonChirho.tokensChirho
        let canonicalChirho = lessonChirho.canonicalTextChirho
        for tokenChirho in tokensChirho {
            let noteChirho = reviewChirho(tokenChirho)
            var startChirho = tokenChirho.startChirho ?? cursorChirho
            let endChirho = tokenChirho.endChirho ?? startChirho
            var spokenChirho = noteChirho?.spokenReadingChirho ?? sourceWordChirho(tokenChirho)
            if let noteChirho, let groupChirho = noteChirho.writtenGroupChirho, !groupChirho.isEmpty {
                let firstChirho = tokensChirho.firstIndex { ExactTextChirho.equalChirho($0.idChirho, groupChirho[0].idChirho) }
                let matchesChirho = firstChirho.map { firstChirho in
                    noteChirho.canonicalTextChirho.map { ExactTextChirho.equalChirho($0, canonicalChirho) } == true
                        && firstChirho + groupChirho.count <= tokensChirho.count
                        && groupChirho.enumerated().allSatisfy { offsetChirho, memberChirho in
                            memberChirho.matchesChirho(SpokenIdentityChirho(tokensChirho[firstChirho + offsetChirho]))
                        }
                } ?? false
                if matchesChirho, let firstChirho {
                    if !ExactTextChirho.equalChirho(tokenChirho.idChirho, groupChirho.last!.idChirho) { continue }
                    startChirho = tokensChirho[firstChirho].startChirho ?? startChirho
                } else {
                    // A changed group keeps every source word, without borrowing its old shared reading.
                    spokenChirho = sourceWordChirho(tokenChirho)
                }
            }
            textChirho += ExactTextChirho.sliceChirho(canonicalChirho, cursorChirho, startChirho) ?? ""
            textChirho += spokenChirho
            cursorChirho = endChirho
        }
        return textChirho + (ExactTextChirho.sliceChirho(canonicalChirho, cursorChirho,
            ExactTextChirho.lengthChirho(canonicalChirho)) ?? "")
    }
}
