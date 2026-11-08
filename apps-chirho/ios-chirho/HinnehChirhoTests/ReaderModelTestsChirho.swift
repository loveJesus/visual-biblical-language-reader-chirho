// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation
import HinnehCoreChirho
import Testing
@testable import Hinneh

/// Serves John 1:1 as the publisher lays it out; the media summary waits until released, to
/// reproduce a slow scene while the reader changes the Greek pronunciation.
actor GatedTransportChirho: TransportChirho {
    static let summaryPathChirho = "/media-chirho/john-chirho/summary-chirho.json"
    private let bodiesChirho: [String: Data]
    private var waitingChirho: [CheckedContinuation<Void, Never>] = []
    private var releasedChirho = false
    private(set) var servedChirho: [String] = []

    init(_ bodiesChirho: [String: Data]) {
        self.bodiesChirho = bodiesChirho
    }

    func releaseChirho() {
        releasedChirho = true
        waitingChirho.forEach { $0.resume() }
        waitingChirho = []
    }

    func getChirho(_ urlChirho: URL, limitChirho: Int) async throws -> Data {
        if urlChirho.path == Self.summaryPathChirho, !releasedChirho {
            await withCheckedContinuation { waitingChirho.append($0) }
        }
        servedChirho.append(urlChirho.path)
        guard let dataChirho = bodiesChirho[urlChirho.path] else { throw RemoteErrorChirho.statusChirho(404) }
        return dataChirho
    }

    static func johnChirho(aspiratesVerseChirho: Bool = true) throws -> GatedTransportChirho {
        func fixtureChirho(_ nameChirho: String) throws -> Any {
            let urlChirho = try #require(Bundle(for: BundleTokenChirho.self).url(
                forResource: nameChirho, withExtension: "json", subdirectory: "FixturesChirho")
                ?? Bundle(for: BundleTokenChirho.self).url(forResource: nameChirho, withExtension: "json"))
            return try JSONSerialization.jsonObject(with: Data(contentsOf: urlChirho))
        }
        func jsonChirho(_ valueChirho: Any) throws -> Data {
            try JSONSerialization.data(withJSONObject: valueChirho, options: [.sortedKeys])
        }
        let chapterPathChirho = "/content-chirho/john-chirho/chapter-01-chirho.json"
        let chapterChirho = try jsonChirho([
            "book_id_chirho": "John", "chapter_chirho": 1, "verses_chirho": [try fixtureChirho("john-1-1-chirho")]
        ] as [String: Any])
        let chapterShaChirho = DigestChirho.sha256HexChirho(chapterChirho)
        let manifestChirho = try jsonChirho([
            "schema_version_chirho": 1, "book_id_chirho": "John", "language_chirho": "grc",
            "chapters_chirho": (1...21).map { numberChirho -> [String: Any] in
                ["number_chirho": numberChirho, "verse_count_chirho": 1, "verse_numbers_chirho": [1],
                 "path_chirho": "/content-chirho/john-chirho/chapter-\(numberChirho < 10 ? "0" : "")\(numberChirho)-chirho.json",
                 "sha256_chirho": numberChirho == 1 ? chapterShaChirho : String(repeating: "0", count: 64)]
            }
        ] as [String: Any])
        let audioPathChirho = "/audio-chirho/john-chirho/chapter-01-chirho.json"
        let clipsChirho = try #require(try fixtureChirho("john-1-1-audio-chirho") as? [[String: Any]])
            .filter { clipChirho in
                aspiratesVerseChirho || !(clipChirho["token_id_chirho"] is NSNull
                    && clipChirho["pronunciation_chirho"] as? String == "modern_greek_aspirates")
            }
        let audioChirho = try jsonChirho([
            "schema_version_chirho": 1, "book_id_chirho": "John", "chapter_chirho": 1,
            "content_path_chirho": chapterPathChirho, "content_sha256_chirho": chapterShaChirho,
            "clips_chirho": clipsChirho
        ] as [String: Any])
        return GatedTransportChirho([
            "/content-chirho/john-chirho/manifest-chirho.json": manifestChirho,
            chapterPathChirho: chapterChirho,
            audioPathChirho: audioChirho,
            "/audio-chirho/manifest-chirho.json": try jsonChirho([
                "schema_version_chirho": 1,
                "books_chirho": ["John": ["chapters_chirho": [[
                    "number_chirho": 1, "path_chirho": audioPathChirho,
                    "sha256_chirho": DigestChirho.sha256HexChirho(audioChirho)
                ]]]]
            ] as [String: Any]),
            summaryPathChirho: try jsonChirho([
                "schema_version_chirho": 1, "book_id_chirho": "John", "scene_count_chirho": 0,
                "icon_count_chirho": 0, "chapters_chirho": [] as [Any]
            ] as [String: Any])
        ])
    }
}

private final class BundleTokenChirho {}

@MainActor
@Suite(.serialized)
struct ReaderModelTestsChirho {
    func waitChirho(_ conditionChirho: () async -> Bool) async throws {
        for _ in 0..<500 {
            if await conditionChirho() { return }
            try await Task.sleep(for: .milliseconds(20))
        }
        Issue.record("condition not reached within 10 seconds")
    }

    @Test func aRenditionChosenWhileMediaLoadsIsNeverOverwrittenByTheOldChoiceChirho() async throws {
        let transportChirho = try GatedTransportChirho.johnChirho()
        let modelChirho = ReaderModelChirho(
            passageChirho: PassageChirho(bookIdChirho: "John", chapterChirho: 1, verseChirho: 1),
            remoteChirho: RemoteChirho(transportChirho: transportChirho))
        let previousChirho = modelChirho.greekRenditionChirho
        defer { modelChirho.greekRenditionChirho = previousChirho }
        modelChirho.greekRenditionChirho = .modernAspiratesChirho
        modelChirho.openChirho(modelChirho.passageChirho)
        try await waitChirho { modelChirho.verseChirho != nil }
        // The scene is still loading when the reader switches to plain Modern.
        modelChirho.greekRenditionChirho = .modernChirho
        try await waitChirho { modelChirho.audioChirho.verseClipChirho?.pronunciationChirho == "modern_greek" }
        await transportChirho.releaseChirho()
        try await waitChirho { await transportChirho.servedChirho.contains(GatedTransportChirho.summaryPathChirho) }
        try await Task.sleep(for: .milliseconds(300))
        #expect(modelChirho.phaseChirho == .readyChirho)
        #expect(modelChirho.audioChirho.verseClipChirho?.pronunciationChirho == "modern_greek",
                "the slow load must not restore recordings chosen for the previous rendition")
        #expect(modelChirho.audioChirho.wordClipsChirho.count == modelChirho.verseChirho?.wordsChirho.count,
                "plain Modern has a recording for every word, including the rough-breathing ὁ")
    }

    @Test func automaticModernFallbackDoesNotSaveOrOverrideAReadersChoiceChirho() async throws {
        let defaultsChirho = UserDefaults.standard
        let savedChirho = defaultsChirho.object(forKey: ReaderModelChirho.renditionKeyChirho)
        defer {
            if let savedChirho { defaultsChirho.set(savedChirho, forKey: ReaderModelChirho.renditionKeyChirho) }
            else { defaultsChirho.removeObject(forKey: ReaderModelChirho.renditionKeyChirho) }
        }
        defaultsChirho.removeObject(forKey: ReaderModelChirho.renditionKeyChirho)
        let transportChirho = try GatedTransportChirho.johnChirho(aspiratesVerseChirho: false)
        await transportChirho.releaseChirho()
        let modelChirho = ReaderModelChirho(
            passageChirho: PassageChirho(bookIdChirho: "John", chapterChirho: 1, verseChirho: 1),
            remoteChirho: RemoteChirho(transportChirho: transportChirho))
        modelChirho.openChirho(modelChirho.passageChirho)
        try await waitChirho { modelChirho.audioChirho.verseClipChirho != nil }
        #expect(modelChirho.greekRenditionChirho == .modernChirho)
        #expect(defaultsChirho.object(forKey: ReaderModelChirho.renditionKeyChirho) == nil)
        modelChirho.greekRenditionChirho = .modernAspiratesChirho
        try await waitChirho { modelChirho.audioChirho.verseClipChirho == nil }
        #expect(defaultsChirho.string(forKey: ReaderModelChirho.renditionKeyChirho)
                == GreekRenditionChirho.modernAspiratesChirho.rawValue)
        modelChirho.retryChirho()
        try await waitChirho { modelChirho.phaseChirho == .readyChirho }
        try await Task.sleep(for: .milliseconds(100))
        #expect(modelChirho.greekRenditionChirho == .modernAspiratesChirho)
        #expect(modelChirho.audioChirho.verseClipChirho == nil)
    }

    @Test func navigationHonoursTheEditionAndStopsTheOldPlayChirho() async throws {
        let transportChirho = try GatedTransportChirho.johnChirho()
        await transportChirho.releaseChirho()
        let modelChirho = ReaderModelChirho(
            passageChirho: PassageChirho(bookIdChirho: "John", chapterChirho: 1, verseChirho: 1),
            remoteChirho: RemoteChirho(transportChirho: transportChirho))
        modelChirho.openChirho(modelChirho.passageChirho)
        try await waitChirho { modelChirho.nextPassageChirho != nil }
        #expect(modelChirho.nextPassageChirho?.idChirho == "John.2.1")
        let oldChirho = modelChirho.playerChirho.beginChirho("verse")
        await modelChirho.stepChirho(.nextChirho)
        #expect(modelChirho.passageChirho.idChirho == "John.2.1")
        #expect(modelChirho.playerChirho.activeIdChirho == nil)
        modelChirho.playerChirho.completeChirho(oldChirho, failedChirho: true)
        #expect(modelChirho.playerChirho.failedIdChirho == nil)
    }
}
