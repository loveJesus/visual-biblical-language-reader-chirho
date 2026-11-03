// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation

public struct SceneRecordChirho: Codable, Sendable, Hashable {
    public let lessonIdChirho: String
    public let assetPathChirho: String
    public let altChirho: String
    public let widthChirho: Int
    public let heightChirho: Int
    public let sha256Chirho: String
    public let artReviewChirho: String
    public let readingNoteChirho: String
    public let variantChirho: String?
}

public struct IconRecordChirho: Codable, Sendable, Hashable, Identifiable {
    public let idChirho: String?
    public let lessonIdChirho: String?
    public let tokenIdChirho: String
    public let lemmaIdChirho: String
    public let lemmaAugmentChirho: String?
    public let lexicalFormChirho: String?
    public let senseIdChirho: String
    public let contextualMeaningChirho: String
    public let assetPathChirho: String
    public let altChirho: String
    public let widthChirho: Int
    public let heightChirho: Int
    public let sha256Chirho: String
    public let senseReviewChirho: String
    public let artReviewChirho: String
    public let evidenceRefsChirho: [String]
    public let displayAuthorityChirho: String?
    public let selectedChirho: Bool?
    public let assignmentChirho: String?
    public let contextTextChirho: String?
    public let contextGlossChirho: String?
    public let contextCanonicalTextChirho: String?

    public var id: String { sha256Chirho + senseIdChirho }
}

struct MediaSummaryEntryChirho: Codable, Sendable {
    let numberChirho: Int
    let pathChirho: String
    let sha256Chirho: String
    let sceneCountChirho: Int
    let iconCountChirho: Int
    let lemmaIconCountChirho: Int?
}

struct MediaSummaryChirho: Codable, Sendable {
    let schemaVersionChirho: Int
    let bookIdChirho: String
    let sceneCountChirho: Int
    let iconCountChirho: Int
    let chaptersChirho: [MediaSummaryEntryChirho]
}

struct MediaChapterChirho: Codable, Sendable {
    let schemaVersionChirho: Int
    let bookIdChirho: String
    let chapterChirho: Int
    let scenesChirho: [SceneRecordChirho]
    let iconsChirho: [IconRecordChirho]
    let lemmaIconsChirho: [IconRecordChirho]?
}

/// How a word's picture was chosen. A general picture never claims this verse's sense.
public enum PictureAssignmentChirho: Sendable, Hashable {
    case contextualChirho
    case generalChirho
}

public struct WordPictureChirho: Sendable, Hashable {
    public let recordChirho: IconRecordChirho
    public let assignmentChirho: PictureAssignmentChirho
    /// Other reviewed meanings of this word, each with its own distinct picture.
    public let alternativesChirho: [IconRecordChirho]
}

/// The verified media for one verse: its scene, if any, and a picture per word that has one.
public struct VerseMediaChirho: Sendable, Hashable {
    public let sceneChirho: SceneRecordChirho?
    public let picturesChirho: [String: WordPictureChirho]

    public static let emptyChirho = VerseMediaChirho(sceneChirho: nil, picturesChirho: [:])
}
