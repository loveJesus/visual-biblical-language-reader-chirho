// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation

enum ChapterVersesChirho: Sendable {
    case hebrewChirho([HebrewLessonChirho])
    case greekChirho([GreekLessonChirho])
}

/// A chapter whose bytes matched the book manifest and whose verses match their identities.
public struct VerifiedChapterChirho: Sendable {
    public let bookChirho: BookChirho
    public let entryChirho: ChapterEntryChirho
    let versesChirho: ChapterVersesChirho

    /// One verse of this chapter, checked against its reference and canonical spans.
    public func lessonChirho(_ verseChirho: Int) throws -> VerseLessonChirho {
        try ContentRulesChirho.verseChirho(self, verseChirho)
    }
}

/// Fetches one book manifest and one chapter at a time, verified, with a bounded cache.
/// Workflow mirror of the website's bible-chirho/content-client-chirho.ts.
public actor ContentClientChirho {
    private let remoteChirho: RemoteChirho
    private var manifestsChirho: [String: [ChapterEntryChirho]] = [:]
    private var chaptersChirho = BoundedCacheChirho<String, VerifiedChapterChirho>(capacityChirho: 4)

    public init(remoteChirho: RemoteChirho) {
        self.remoteChirho = remoteChirho
    }

    public func chapterEntriesChirho(_ bookChirho: BookChirho) async throws -> [ChapterEntryChirho] {
        if let cachedChirho = manifestsChirho[bookChirho.idChirho] { return cachedChirho }
        let dataChirho = try await remoteChirho.dataChirho(
            bookChirho.manifestPathChirho, .contentManifestChirho)
        let entriesChirho = try ContentRulesChirho.validManifestChirho(
            DecodingChirho.decodeChirho(BookManifestChirho.self, dataChirho), bookChirho)
        manifestsChirho[bookChirho.idChirho] = entriesChirho
        return entriesChirho
    }

    public func chapterChirho(_ bookChirho: BookChirho, _ numberChirho: Int) async throws
        -> VerifiedChapterChirho {
        let keyChirho = "\(bookChirho.idChirho).\(numberChirho)"
        if let cachedChirho = chaptersChirho.valueChirho(keyChirho) { return cachedChirho }
        do {
            return try await fetchChapterChirho(bookChirho, numberChirho, keyChirho)
        } catch RemoteErrorChirho.integrityChirho {
            // A newer release may have replaced the manifest; read it once more, then refuse.
            manifestsChirho[bookChirho.idChirho] = nil
            return try await fetchChapterChirho(bookChirho, numberChirho, keyChirho)
        }
    }

    public func lessonChirho(_ bookChirho: BookChirho, _ chapterNumberChirho: Int, _ verseChirho: Int)
        async throws -> VerseLessonChirho {
        let chapterChirho = try await chapterChirho(bookChirho, chapterNumberChirho)
        return try ContentRulesChirho.verseChirho(chapterChirho, verseChirho)
    }

    private func fetchChapterChirho(_ bookChirho: BookChirho, _ numberChirho: Int, _ keyChirho: String)
        async throws -> VerifiedChapterChirho {
        let entriesChirho = try await chapterEntriesChirho(bookChirho)
        guard numberChirho >= 1, numberChirho <= entriesChirho.count else {
            throw RemoteErrorChirho.invalidChirho("chapter selection")
        }
        let entryChirho = entriesChirho[numberChirho - 1]
        let dataChirho = try await remoteChirho.verifiedChirho(
            entryChirho.pathChirho, .contentChapterChirho, sha256Chirho: entryChirho.sha256Chirho)
        let chapterChirho = try ContentRulesChirho.validChapterChirho(dataChirho, bookChirho, entryChirho)
        chaptersChirho.insertChirho(keyChirho, chapterChirho)
        return chapterChirho
    }
}

/// The publisher's structural rules, checked before any word is shown.
enum ContentRulesChirho {
    static func validManifestChirho(_ manifestChirho: BookManifestChirho, _ bookChirho: BookChirho) throws
        -> [ChapterEntryChirho] {
        guard manifestChirho.schemaVersionChirho == 1,
              manifestChirho.bookIdChirho == bookChirho.idChirho,
              manifestChirho.languageChirho == bookChirho.languageChirho,
              manifestChirho.chaptersChirho.count == bookChirho.chapterCountChirho
        else { throw RemoteErrorChirho.invalidChirho("book manifest") }
        for (offsetChirho, entryChirho) in manifestChirho.chaptersChirho.enumerated() {
            let numberChirho = offsetChirho + 1
            guard entryChirho.numberChirho == numberChirho,
                  (1...200).contains(entryChirho.verseCountChirho),
                  entryChirho.pathChirho == "/content-chirho/\(bookChirho.slugChirho)/"
                      + bookChirho.chapterFileChirho(numberChirho),
                  DigestChirho.isHexChirho(entryChirho.sha256Chirho)
            else { throw RemoteErrorChirho.invalidChirho("chapter entry") }
            if let numbersChirho = entryChirho.verseNumbersChirho {
                guard numbersChirho.count == entryChirho.verseCountChirho,
                      numbersChirho.allSatisfy({ (1...200).contains($0) }),
                      zip(numbersChirho, numbersChirho.dropFirst()).allSatisfy({ $0 < $1 })
                else { throw RemoteErrorChirho.invalidChirho("verse numbering") }
            }
        }
        return manifestChirho.chaptersChirho
    }

    static func validChapterChirho(_ dataChirho: Data, _ bookChirho: BookChirho, _ entryChirho: ChapterEntryChirho)
        throws -> VerifiedChapterChirho {
        let headerChirho = try DecodingChirho.decodeChirho(ChapterHeaderChirho.self, dataChirho)
        guard headerChirho.bookIdChirho == bookChirho.idChirho,
              headerChirho.chapterChirho == entryChirho.numberChirho
        else { throw RemoteErrorChirho.invalidChirho("chapter identity") }
        let versesChirho: ChapterVersesChirho
        let idsChirho: [String]
        switch bookChirho.scriptChirho {
        case .hebrewChirho:
            let decodedChirho = try DecodingChirho.decodeChirho(HebrewChapterChirho.self, dataChirho)
            versesChirho = .hebrewChirho(decodedChirho.versesChirho)
            idsChirho = decodedChirho.versesChirho.map(\.idChirho)
        case .greekChirho:
            let decodedChirho = try DecodingChirho.decodeChirho(GreekChapterChirho.self, dataChirho)
            versesChirho = .greekChirho(decodedChirho.versesChirho)
            idsChirho = decodedChirho.versesChirho.map(\.idChirho)
        }
        let expectedChirho = entryChirho.versesChirho.map {
            "\(bookChirho.idChirho).\(entryChirho.numberChirho).\($0)"
        }
        guard idsChirho == expectedChirho else { throw RemoteErrorChirho.invalidChirho("verse identity") }
        return VerifiedChapterChirho(bookChirho: bookChirho, entryChirho: entryChirho, versesChirho: versesChirho)
    }

    static func verseChirho(_ chapterChirho: VerifiedChapterChirho, _ verseChirho: Int) throws
        -> VerseLessonChirho {
        guard let positionChirho = chapterChirho.entryChirho.versesChirho.firstIndex(of: verseChirho) else {
            throw RemoteErrorChirho.invalidChirho("verse absent from this edition")
        }
        let referenceChirho = "\(chapterChirho.bookChirho.labelChirho) "
            + "\(chapterChirho.entryChirho.numberChirho):\(verseChirho)"
        switch chapterChirho.versesChirho {
        case .hebrewChirho(let lessonsChirho):
            let lessonChirho = lessonsChirho[positionChirho]
            try validHebrewChirho(lessonChirho, referenceChirho)
            return .hebrewChirho(lessonChirho)
        case .greekChirho(let lessonsChirho):
            let lessonChirho = lessonsChirho[positionChirho]
            try validGreekChirho(lessonChirho, referenceChirho)
            return .greekChirho(lessonChirho)
        }
    }

    static func validHebrewChirho(_ lessonChirho: HebrewLessonChirho, _ referenceChirho: String) throws {
        guard lessonChirho.schemaVersionChirho == 1, lessonChirho.languageChirho == "he",
              lessonChirho.referenceChirho == referenceChirho,
              (1...200).contains(lessonChirho.tokensChirho.count)
        else { throw RemoteErrorChirho.invalidChirho("Hebrew verse") }
        let spansChirho = try lessonChirho.tokensChirho.map { tokenChirho in
            guard let startChirho = tokenChirho.startChirho, let endChirho = tokenChirho.endChirho else {
                throw RemoteErrorChirho.invalidChirho("Hebrew span")
            }
            return SpanChirho(idChirho: tokenChirho.idChirho, textChirho: tokenChirho.textChirho,
                              segmentsChirho: tokenChirho.segmentsChirho,
                              startChirho: startChirho, endChirho: endChirho)
        }
        try validSpansChirho(spansChirho, lessonChirho.canonicalTextChirho)
        try validSourcesChirho(lessonChirho.sourcesChirho, requiredChirho: [])
    }

    static func validGreekChirho(_ lessonChirho: GreekLessonChirho, _ referenceChirho: String) throws {
        guard lessonChirho.schemaVersionChirho == 1, lessonChirho.languageChirho == "grc",
              lessonChirho.glossOriginChirho == "berean_interlinear",
              lessonChirho.referenceChirho == referenceChirho,
              !lessonChirho.tokensChirho.isEmpty,
              lessonChirho.tokensChirho.allSatisfy({ isGreekTokenIdChirho($0.idChirho, lessonChirho.idChirho) })
        else { throw RemoteErrorChirho.invalidChirho("Greek verse") }
        try validSpansChirho(lessonChirho.tokensChirho.map {
            SpanChirho(idChirho: $0.idChirho, textChirho: $0.textChirho, segmentsChirho: $0.segmentsChirho,
                       startChirho: $0.startChirho, endChirho: $0.endChirho)
        }, lessonChirho.canonicalTextChirho)
        try validSourcesChirho(lessonChirho.sourcesChirho, requiredChirho: [
            "nestle1904-morph-chirho", "nestle1904-parsing-chirho", "berean-glosses-chirho"
        ])
    }

    struct SpanChirho {
        let idChirho: String
        let textChirho: String
        let segmentsChirho: [String]
        let startChirho: Int
        let endChirho: Int
    }

    /// Every word must be exactly the canonical text at its span, in order, with no source word
    /// left between or after the words.
    static func validSpansChirho(_ spansChirho: [SpanChirho], _ canonicalChirho: String) throws {
        guard !canonicalChirho.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            throw RemoteErrorChirho.invalidChirho("canonical text")
        }
        var previousEndChirho = 0
        var idsChirho = Set<String>()
        for spanChirho in spansChirho {
            guard idsChirho.insert(spanChirho.idChirho).inserted,
                  spanChirho.startChirho >= previousEndChirho, spanChirho.endChirho > spanChirho.startChirho,
                  let sliceChirho = ExactTextChirho.sliceChirho(
                      canonicalChirho, spanChirho.startChirho, spanChirho.endChirho),
                  ExactTextChirho.equalChirho(sliceChirho, spanChirho.textChirho),
                  !spanChirho.segmentsChirho.isEmpty,
                  spanChirho.segmentsChirho.allSatisfy({ !$0.isEmpty }),
                  ExactTextChirho.equalChirho(spanChirho.segmentsChirho.joined(), spanChirho.textChirho),
                  let gapChirho = ExactTextChirho.sliceChirho(
                      canonicalChirho, previousEndChirho, spanChirho.startChirho),
                  !ExactTextChirho.hasWordCharacterChirho(gapChirho)
            else { throw RemoteErrorChirho.invalidChirho("canonical span \(spanChirho.idChirho)") }
            previousEndChirho = spanChirho.endChirho
        }
        guard let tailChirho = ExactTextChirho.sliceChirho(
            canonicalChirho, previousEndChirho, ExactTextChirho.lengthChirho(canonicalChirho)),
              !ExactTextChirho.hasWordCharacterChirho(tailChirho)
        else { throw RemoteErrorChirho.invalidChirho("final source word") }
    }

    /// Greek word ids are the verse id, "!", then the word's position.
    static func isGreekTokenIdChirho(_ tokenIdChirho: String, _ lessonIdChirho: String) -> Bool {
        let prefixChirho = lessonIdChirho + "!"
        guard tokenIdChirho.hasPrefix(prefixChirho) else { return false }
        let positionChirho = tokenIdChirho.dropFirst(prefixChirho.count)
        return !positionChirho.isEmpty && positionChirho.allSatisfy { ("0"..."9").contains($0) }
    }

    static func validSourcesChirho(_ sourcesChirho: [SourceRecordChirho], requiredChirho: [String]) throws {
        guard !sourcesChirho.isEmpty,
              requiredChirho.allSatisfy({ idChirho in sourcesChirho.contains { $0.idChirho == idChirho } }),
              sourcesChirho.allSatisfy({ sourceChirho in
                  DigestChirho.isHexChirho(sourceChirho.sha256Chirho)
                      && ![sourceChirho.idChirho, sourceChirho.titleChirho, sourceChirho.licenseChirho,
                           sourceChirho.attributionChirho, sourceChirho.revisionChirho]
                          .contains(where: { $0.trimmingCharacters(in: .whitespaces).isEmpty })
              })
        else { throw RemoteErrorChirho.invalidChirho("source evidence") }
    }
}
