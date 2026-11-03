// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation
import Testing
@testable import HinnehCoreChirho

@Suite struct RemoteTestsChirho {
    @Test func trustedPathsResolveOnlyToTheOneOriginChirho() throws {
        let urlChirho = try #require(OriginChirho.urlChirho(
            "/content-chirho/proverbs-chirho/chapter-26-chirho.json", .contentChapterChirho))
        #expect(urlChirho.absoluteString == "https://hinneh.us/content-chirho/proverbs-chirho/chapter-26-chirho.json")
        #expect(OriginChirho.urlChirho("/content-chirho/psalms-chirho/chapter-119-chirho.json",
                                       .contentChapterChirho) != nil)
        #expect(OriginChirho.urlChirho(
            "/assets-chirho/icons-chirho/proverbs-v1-chirho/0000-chirho/cell-07-chirho.webp", .artworkChirho) != nil)
        #expect(OriginChirho.urlChirho("/audio-chirho/sha256-chirho/\(String(repeating: "a", count: 64))-chirho.mp3",
                                       .audioClipChirho) != nil)
    }

    @Test(arguments: [
        ("https://evil.example/content-chirho/proverbs-chirho/chapter-26-chirho.json", ResourceKindChirho.contentChapterChirho),
        ("//evil.example/content-chirho/proverbs-chirho/chapter-26-chirho.json", .contentChapterChirho),
        ("/content-chirho/../media-chirho/proverbs-chirho/chapter-26-chirho.json", .contentChapterChirho),
        ("/content-chirho/proverbs-chirho/chapter-26-chirho.json?x=1", .contentChapterChirho),
        ("/content-chirho/proverbs-chirho/chapter-26-chirho.json#x", .contentChapterChirho),
        ("/content-chirho/proverbs-chirho/chapter-2-chirho.json", .contentChapterChirho),
        ("/assets-chirho/../../etc/passwd.webp", .artworkChirho),
        ("/assets-chirho//x.webp", .artworkChirho),
        ("/assets-chirho/x.png", .artworkChirho),
        ("/assets-chirho/x.webp", .audioClipChirho),
        ("/audio-chirho/sha256-chirho/ABC-chirho.mp3", .audioClipChirho),
        ("javascript:alert(1)", .artworkChirho),
        ("/content-chirho/próverbs-chirho/chapter-26-chirho.json", .contentChapterChirho)
    ])
    func untrustedPathsAreRefusedChirho(pathChirho: String, kindChirho: ResourceKindChirho) {
        #expect(OriginChirho.urlChirho(pathChirho, kindChirho) == nil)
    }

    @Test func bytesMustMatchTheirRecordedHashChirho() async throws {
        let transportChirho = FakeTransportChirho()
        let pathChirho = "/glosses-chirho/es-chirho/manifest-chirho.json"
        await transportChirho.setChirho(pathChirho, Data("{}".utf8))
        let remoteChirho = RemoteChirho(transportChirho: transportChirho)
        let goodChirho = DigestChirho.sha256HexChirho(Data("{}".utf8))
        #expect(try await remoteChirho.verifiedChirho(pathChirho, .glossManifestChirho, sha256Chirho: goodChirho)
                    == Data("{}".utf8))
        await #expect(throws: RemoteErrorChirho.integrityChirho) {
            try await remoteChirho.verifiedChirho(pathChirho, .glossManifestChirho,
                                                  sha256Chirho: String(repeating: "0", count: 64))
        }
        await #expect(throws: RemoteErrorChirho.untrustedPathChirho) {
            try await remoteChirho.dataChirho("/elsewhere-chirho/x.json", .glossManifestChirho)
        }
        #expect(await transportChirho.requestedChirho == [pathChirho, pathChirho])
    }

    @Test func boundedCacheEvictsTheLeastRecentlyUsedChirho() {
        var cacheChirho = BoundedCacheChirho<Int, String>(capacityChirho: 2)
        cacheChirho.insertChirho(1, "a")
        cacheChirho.insertChirho(2, "b")
        _ = cacheChirho.valueChirho(1)
        cacheChirho.insertChirho(3, "c")
        #expect(cacheChirho.valueChirho(2) == nil)
        #expect(cacheChirho.valueChirho(1) == "a")
        #expect(cacheChirho.countChirho == 2)
    }

    @Test func bookListFallsBackToBundledIdentitiesChirho() async throws {
        let bundledChirho = BookListChirho.bundledChirho()
        #expect(bundledChirho.booksChirho.count == 66)
        #expect(bundledChirho.bookChirho("Prov")?.slugChirho == "proverbs-chirho")
        #expect(bundledChirho.bookChirho("John")?.scriptChirho == .greekChirho)
        let missingChirho = await BookListChirho.loadChirho(RemoteChirho(transportChirho: FakeTransportChirho()))
        #expect(missingChirho.booksChirho.map(\.idChirho) == bundledChirho.booksChirho.map(\.idChirho))
        let transportChirho = FakeTransportChirho()
        await transportChirho.setChirho("/library-chirho/books-chirho.json", try FixtureChirho.jsonChirho([
            "schema_version_chirho": 1,
            "books_chirho": [["id_chirho": "Prov", "label_chirho": "Proverbs", "spanish_label_chirho": "Proverbios",
                              "slug_chirho": "../proverbs", "language_chirho": "he", "testament_chirho": "old",
                              "chapter_count_chirho": 31, "featured_chirho": true]]
        ] as [String: Any]))
        let refusedChirho = await BookListChirho.loadChirho(RemoteChirho(transportChirho: transportChirho))
        #expect(refusedChirho.booksChirho.count == 66, "an unsafe slug must not replace the bundled list")
    }
}
