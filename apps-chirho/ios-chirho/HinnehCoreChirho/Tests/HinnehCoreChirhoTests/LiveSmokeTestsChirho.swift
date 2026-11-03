// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation
import Testing
@testable import HinnehCoreChirho

/// Read-only checks against the live public site; run with HINNEH_LIVE_CHIRHO=1.
@Suite(.enabled(if: ProcessInfo.processInfo.environment["HINNEH_LIVE_CHIRHO"] == "1"))
struct LiveSmokeTestsChirho {
    let remoteChirho = RemoteChirho(transportChirho: URLSessionTransportChirho())

    @Test func theLiveBootstrapValidatesAsPublishedChirho() async throws {
        let dataChirho = try await remoteChirho.dataChirho("/library-chirho/books-chirho.json", .bookListChirho)
        let listChirho = try BookListChirho(
            validatingChirho: DecodingChirho.decodeChirho(BookListPayloadChirho.self, dataChirho))
        print("live bootstrap: \(dataChirho.count) bytes, sha256 \(DigestChirho.sha256HexChirho(dataChirho)), "
              + "\(listChirho.booksChirho.count) books")
        #expect(listChirho.booksChirho.count == 66)
        #expect(listChirho.booksChirho.map(\.idChirho) == BookListChirho.bundledChirho().booksChirho.map(\.idChirho))
    }

    @Test(arguments: ["Prov.26.1", "John.3.16", "Ps.119.176", "Dan.2.4", "Gen.1.1", "Rev.22.21"])
    func liveVersesLoadVerifiedWithTheirOptionalLayersChirho(_ passageTextChirho: String) async throws {
        let booksChirho = await BookListChirho.loadChirho(remoteChirho)
        let passageChirho = try #require(PassageChirho.parseChirho(passageTextChirho, booksChirho))
        let bookChirho = try #require(booksChirho.bookChirho(passageChirho.bookIdChirho))
        let contentChirho = ContentClientChirho(remoteChirho: remoteChirho)
        let chapterChirho = try await contentChirho.chapterChirho(bookChirho, passageChirho.chapterChirho)
        let verseChirho = VerseDisplayChirho(try chapterChirho.lessonChirho(passageChirho.verseChirho))
        #expect(!verseChirho.wordsChirho.isEmpty)
        let mediaChirho = try await MediaClientChirho(remoteChirho: remoteChirho)
            .verseMediaChirho(bookChirho, passageChirho.chapterChirho, verseChirho)
        let audioChirho = try await AudioClientChirho(remoteChirho: remoteChirho)
            .verseAudioChirho(chapterChirho, verseChirho, .modernChirho)
        let spanishChirho = try await GlossClientChirho(remoteChirho: remoteChirho).spanishChirho(chapterChirho)
        if let pictureChirho = mediaChirho.picturesChirho.values.first {
            _ = try await remoteChirho.verifiedChirho(pictureChirho.recordChirho.assetPathChirho, .artworkChirho,
                                                      sha256Chirho: pictureChirho.recordChirho.sha256Chirho)
        }
        if let clipChirho = audioChirho.wordClipsChirho.values.first {
            let mp3Chirho = try await remoteChirho.verifiedChirho(clipChirho.assetPathChirho, .audioClipChirho,
                                                                  sha256Chirho: clipChirho.sha256Chirho)
            #expect(mp3Chirho.count == clipChirho.bytesChirho)
        }
        let spanishStateChirho: String = switch spanishChirho {
        case .readyChirho(let glossesChirho, _): "ready \(glossesChirho.values.compactMap { $0 }.count)"
        case .absentChirho: "absent"
        case .staleChirho: "stale"
        }
        print("\(passageTextChirho): \(verseChirho.wordsChirho.count) words, scene \(mediaChirho.sceneChirho != nil), "
              + "pictures \(mediaChirho.picturesChirho.count), word clips \(audioChirho.wordClipsChirho.count), "
              + "verse clip \(audioChirho.verseClipChirho?.pronunciationChirho ?? "none"), "
              + "aramaic \(verseChirho.hasAramaicChirho), Spanish \(spanishStateChirho)")
    }
}
