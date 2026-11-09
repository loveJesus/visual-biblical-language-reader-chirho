// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: apps-chirho/ios-chirho/docs-chirho/reader-session-chirho.md.

import Foundation

/// Optional display only. It never changes the source word, admitted recordings or playback.
public enum WordIpaChirho {
    private static let greekGuideChirho: GreekIpaGuideChirho? = {
        guard let manifestChirho = resourceChirho("greek-ipa-manifest-chirho.json") else { return nil }
        return try? GreekIpaGuideChirho(manifestDataChirho: manifestChirho) { nameChirho in
            guard let dataChirho = resourceChirho(nameChirho) else {
                throw RemoteErrorChirho.invalidChirho("missing Greek IPA part")
            }
            return dataChirho
        }
    }()

    /// Hebrew uses only the exact selected word clip. Greek is the shared helper's teaching
    /// guide for this exact spoken form and selected rendition, independently of clip coverage.
    public static func valueChirho(_ wordChirho: WordDisplayChirho, verseChirho: VerseDisplayChirho,
                                  audioChirho: VerseAudioChirho,
                                  renditionChirho: GreekRenditionChirho) -> String? {
        guard !wordChirho.isAramaicChirho else { return nil }
        if verseChirho.scriptChirho == .greekChirho {
            return greekGuideChirho?.valueChirho(wordChirho.spokenTextChirho, renditionChirho)
        }
        guard let clipChirho = audioChirho.wordClipsChirho[wordChirho.idChirho],
              ExactTextChirho.equalChirho(clipChirho.tokenIdChirho ?? "", wordChirho.idChirho),
              ExactTextChirho.equalChirho(clipChirho.lessonIdChirho, verseChirho.idChirho),
              clipChirho.canonicalSha256Chirho == DigestChirho.sha256HexChirho(verseChirho.canonicalTextChirho),
              ExactTextChirho.equalChirho(clipChirho.textChirho, wordChirho.spokenTextChirho),
              clipChirho.pronunciationChirho == "israeli_hebrew",
              AudioRulesChirho.validShapeChirho(clipChirho, greekChirho: false),
              let ipaChirho = clipChirho.ipaChirho,
              !ipaChirho.isEmpty, ipaChirho.utf8.count <= 2048
        else { return nil }
        return ipaChirho
    }

    private static func resourceChirho(_ nameChirho: String) -> Data? {
        // SwiftPM's process rule flattens these globally unique resource filenames.
        let urlChirho = Bundle.module.url(forResource: nameChirho, withExtension: nil)
            ?? Bundle.module.url(forResource: nameChirho, withExtension: nil, subdirectory: "greek-ipa-chirho")
        return urlChirho.flatMap { try? Data(contentsOf: $0, options: .mappedIfSafe) }
    }
}

private struct GreekIpaPartPinChirho: Decodable {
    let partIndexChirho: Int
    let fileChirho: String
    let sha256Chirho: String
    let bytesChirho: Int
    let countChirho: Int
}
private struct GreekIpaManifestChirho: Decodable {
    let schemaVersionChirho: Int
    let recipeIdChirho: String
    let kindChirho: String
    let languageChirho: String
    let profilesChirho: [String]
    let keyAlgorithmChirho: String
    let shardAlgorithmChirho: String
    let partCountChirho: Int
    let formCountChirho: Int
    let inputSha256Chirho: String
    let partsChirho: [GreekIpaPartPinChirho]
}
private struct GreekIpaRowChirho: Decodable, Sendable {
    let textChirho: String
    let ipaChirho: [String: String?]
}
private struct GreekIpaPartChirho: Decodable {
    let schemaVersionChirho: Int
    let recipeIdChirho: String
    let partIndexChirho: Int
    let entriesChirho: [String: GreekIpaRowChirho]
}

/// Validated once per bundled guide. All keys are ASCII SHA-256; Swift's canonically equivalent
/// String equality is never used for source-form identity. There is no phonology implementation.
struct GreekIpaGuideChirho: Sendable {
    private static let recipeChirho = "greek-word-ipa-guide-v1-chirho"
    private static let profilesChirho = ["modern", "modern_aspirates", "erasmian"]
    private let rowsChirho: [String: GreekIpaRowChirho]

    init(manifestDataChirho: Data, partDataChirho: (String) throws -> Data) throws {
        guard manifestDataChirho.count <= 131_072 else { throw Self.invalidChirho() }
        let manifestChirho = try DecodingChirho.decodeChirho(GreekIpaManifestChirho.self, manifestDataChirho)
        guard manifestChirho.schemaVersionChirho == 1,
              manifestChirho.recipeIdChirho == Self.recipeChirho,
              manifestChirho.kindChirho == "teaching_guide", manifestChirho.languageChirho == "grc",
              manifestChirho.profilesChirho == Self.profilesChirho,
              manifestChirho.keyAlgorithmChirho == "sha256-utf8-exact-chirho",
              manifestChirho.shardAlgorithmChirho == "first-sha256-byte-and-7-chirho",
              manifestChirho.partCountChirho == 8, manifestChirho.partsChirho.count == 8,
              (1...25_000).contains(manifestChirho.formCountChirho),
              DigestChirho.isHexChirho(manifestChirho.inputSha256Chirho)
        else { throw Self.invalidChirho() }
        var totalBytesChirho = manifestDataChirho.count
        var rowsChirho: [String: GreekIpaRowChirho] = [:]
        for (indexChirho, pinChirho) in manifestChirho.partsChirho.enumerated() {
            let nameChirho = String(format: "greek-ipa-part-%02d-chirho.json", indexChirho)
            guard pinChirho.partIndexChirho == indexChirho, pinChirho.fileChirho == nameChirho,
                  (1...1_048_576).contains(pinChirho.bytesChirho),
                  (0...4096).contains(pinChirho.countChirho), DigestChirho.isHexChirho(pinChirho.sha256Chirho)
            else { throw Self.invalidChirho() }
            let dataChirho = try partDataChirho(nameChirho)
            guard dataChirho.count == pinChirho.bytesChirho,
                  DigestChirho.sha256HexChirho(dataChirho) == pinChirho.sha256Chirho
            else { throw Self.invalidChirho() }
            totalBytesChirho += dataChirho.count
            guard totalBytesChirho <= 9_437_184 else { throw Self.invalidChirho() }
            let partChirho = try DecodingChirho.decodeChirho(GreekIpaPartChirho.self, dataChirho)
            guard partChirho.schemaVersionChirho == 1, partChirho.recipeIdChirho == Self.recipeChirho,
                  partChirho.partIndexChirho == indexChirho,
                  partChirho.entriesChirho.count == pinChirho.countChirho
            else { throw Self.invalidChirho() }
            for (keyChirho, rowChirho) in partChirho.entriesChirho {
                guard let shardChirho = Self.shardChirho(keyChirho), shardChirho == indexChirho,
                      rowsChirho[keyChirho] == nil,
                      rowChirho.textChirho.utf8.count <= 1024,
                      DigestChirho.sha256HexChirho(rowChirho.textChirho) == keyChirho,
                      Set(rowChirho.ipaChirho.keys) == Set(Self.profilesChirho),
                      rowChirho.ipaChirho.values.allSatisfy({ $0 == nil || $0!.utf8.count <= 2048 })
                else { throw Self.invalidChirho() }
                rowsChirho[keyChirho] = rowChirho
            }
        }
        guard rowsChirho.count == manifestChirho.formCountChirho else { throw Self.invalidChirho() }
        self.rowsChirho = rowsChirho
    }

    func valueChirho(_ textChirho: String, _ renditionChirho: GreekRenditionChirho) -> String? {
        guard textChirho.utf8.count <= 1024,
              let rowChirho = rowsChirho[DigestChirho.sha256HexChirho(textChirho)],
              ExactTextChirho.equalChirho(rowChirho.textChirho, textChirho)
        else { return nil }
        return rowChirho.ipaChirho[renditionChirho.rawValue] ?? nil
    }

    private static func shardChirho(_ keyChirho: String) -> Int? {
        guard DigestChirho.isHexChirho(keyChirho), let byteChirho = UInt8(keyChirho.prefix(2), radix: 16) else { return nil }
        return Int(byteChirho & 7)
    }
    private static func invalidChirho() -> RemoteErrorChirho { .invalidChirho("Greek IPA guide binding") }
}
