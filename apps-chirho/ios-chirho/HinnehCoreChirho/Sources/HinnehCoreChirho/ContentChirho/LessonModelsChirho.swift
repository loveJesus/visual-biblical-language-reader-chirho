// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation

// The public content contract, field for field (see the website's domain-chirho/lesson-chirho.ts
// and greek-chirho.ts). Grammar values stay strings: an unfamiliar value is shown as unknown,
// never guessed, and never stops the original text from showing.

public struct SourceRecordChirho: Codable, Sendable, Hashable, Identifiable {
    public let idChirho: String
    public let titleChirho: String
    public let urlChirho: String?
    public let revisionChirho: String
    public let sha256Chirho: String
    public let licenseChirho: String
    public let attributionChirho: String

    public var id: String { idChirho }

    /// The source link, only when it is plain HTTPS without embedded credentials.
    public var safeLinkChirho: URL? {
        guard let textChirho = urlChirho, let linkChirho = URL(string: textChirho),
              linkChirho.scheme == "https", linkChirho.user == nil, linkChirho.password == nil,
              linkChirho.host?.isEmpty == false
        else { return nil }
        return linkChirho
    }
}

public struct SourceNoteChirho: Codable, Sendable, Hashable {
    public let kindChirho: String
    public let codeChirho: String?
    public let textChirho: String
    public let beforeTokenIdChirho: String?
}

public struct FormNoteChirho: Codable, Sendable, Hashable {
    public let kindChirho: String
    public let textChirho: String
    public let sourceChirho: String
}

public struct HebrewTokenChirho: Codable, Sendable {
    public let idChirho: String
    public let textChirho: String
    public let segmentsChirho: [String]
    public let startChirho: Int?
    public let endChirho: Int?
    public let rawMorphologyChirho: String
    public let lemmaIdChirho: String
    public let lemmaAugmentChirho: String?
    public let lexicalFormChirho: String
    public let posChirho: String
    public let genderChirho: String
    public let numberChirho: String
    public let stateChirho: String
    public let rootTextChirho: String?
    public let rootEntryIdChirho: String?
    public let rootStatusChirho: String
    public let rootNoteChirho: String
    public let glossChirho: String?
    public let analysisChirho: String
    public let sourceNoteChirho: String
    public let verbCodeChirho: String?
    public let verbStemChirho: String?
    public let verbFormChirho: String?
    public let verbConstructionChirho: String?
    public let glossOriginChirho: String?
    public let sourceLanguageChirho: String?
    public let analysisStatusChirho: String?
    public let lemmaAssignmentStatusChirho: String?
    public let qereChirho: [QereReadingChirho]?
    public let formNoteChirho: FormNoteChirho?
}

/// A read form (qere) kept beside the written word; it is spoken, never substituted in the text.
public struct QereReadingChirho: Codable, Sendable {
    public let idChirho: String
    public let textChirho: String
    public let segmentsChirho: [String]
    public let rawMorphologyChirho: String
    public let lemmaIdChirho: String
    public let lemmaAugmentChirho: String?
    public let lexicalFormChirho: String
    public let posChirho: String
    public let genderChirho: String
    public let numberChirho: String
    public let stateChirho: String
    public let glossChirho: String?
    public let analysisChirho: String
}

public struct HebrewLessonChirho: Codable, Sendable {
    public let schemaVersionChirho: Int
    public let idChirho: String
    public let languageChirho: String
    public let referenceChirho: String
    public let canonicalTextChirho: String
    public let translationChirho: String?
    public let kjvVerseIdChirho: String?
    public let sourceNotesChirho: [SourceNoteChirho]?
    public let glossOriginChirho: String?
    public let tokensChirho: [HebrewTokenChirho]
    public let sourcesChirho: [SourceRecordChirho]
}

public struct GreekTokenChirho: Codable, Sendable {
    public let idChirho: String
    public let textChirho: String
    public let segmentsChirho: [String]
    public let startChirho: Int
    public let endChirho: Int
    public let rawMorphologyChirho: String
    public let rawFormMorphologyChirho: String
    public let rawStrongsChirho: String
    public let lemmaIdChirho: String
    public let lexicalFormChirho: String
    public let partOfSpeechChirho: String
    public let caseChirho: String
    public let numberChirho: String
    public let genderChirho: String
    public let personChirho: String?
    public let tenseChirho: String?
    public let voiceChirho: String?
    public let moodChirho: String?
    public let glossChirho: String?
    public let analysisChirho: String
    public let sourceNoteChirho: String
}

public struct GreekLessonChirho: Codable, Sendable {
    public let schemaVersionChirho: Int
    public let idChirho: String
    public let languageChirho: String
    public let referenceChirho: String
    public let canonicalTextChirho: String
    public let glossOriginChirho: String
    public let tokensChirho: [GreekTokenChirho]
    public let sourcesChirho: [SourceRecordChirho]
    public let sourceNotesChirho: [SourceNoteChirho]?
}

/// One book manifest entry; explicit verse numbers win over the count.
public struct ChapterEntryChirho: Codable, Sendable, Hashable {
    public let numberChirho: Int
    public let verseCountChirho: Int
    public let verseNumbersChirho: [Int]?
    public let pathChirho: String
    public let sha256Chirho: String

    /// The verses this source edition actually has, in order. Gaps are preserved.
    public var versesChirho: [Int] { verseNumbersChirho ?? Array(1...max(1, verseCountChirho)) }
}

struct BookManifestChirho: Decodable {
    let schemaVersionChirho: Int
    let bookIdChirho: String
    let languageChirho: String
    let chaptersChirho: [ChapterEntryChirho]
}

struct ChapterHeaderChirho: Decodable {
    let bookIdChirho: String
    let chapterChirho: Int
}

struct HebrewChapterChirho: Decodable {
    let versesChirho: [HebrewLessonChirho]
}

struct GreekChapterChirho: Decodable {
    let versesChirho: [GreekLessonChirho]
}

/// A verified verse in either original language.
public enum VerseLessonChirho: Sendable {
    case hebrewChirho(HebrewLessonChirho)
    case greekChirho(GreekLessonChirho)

    public var idChirho: String {
        switch self {
        case .hebrewChirho(let lessonChirho): lessonChirho.idChirho
        case .greekChirho(let lessonChirho): lessonChirho.idChirho
        }
    }

    public var canonicalTextChirho: String {
        switch self {
        case .hebrewChirho(let lessonChirho): lessonChirho.canonicalTextChirho
        case .greekChirho(let lessonChirho): lessonChirho.canonicalTextChirho
        }
    }

    public var sourcesChirho: [SourceRecordChirho] {
        switch self {
        case .hebrewChirho(let lessonChirho): lessonChirho.sourcesChirho
        case .greekChirho(let lessonChirho): lessonChirho.sourcesChirho
        }
    }
}
