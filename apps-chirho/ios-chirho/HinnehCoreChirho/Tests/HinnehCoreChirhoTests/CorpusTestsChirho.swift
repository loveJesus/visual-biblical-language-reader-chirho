// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: hosting-chirho/native-readers-chirho.md. Offline contract check through the real client.
import Foundation
import Testing
@testable import HinnehCoreChirho

private struct CorpusTransportChirho: TransportChirho {
    let rootChirho: URL

    func getChirho(_ urlChirho: URL, limitChirho: Int) async throws -> Data {
        try Task.checkCancellation()
        let fileChirho = rootChirho.appendingPathComponent(String(urlChirho.path.dropFirst()))
            .standardizedFileURL
        guard fileChirho.path.hasPrefix(rootChirho.standardizedFileURL.path + "/") else {
            throw RemoteErrorChirho.untrustedPathChirho
        }
        let dataChirho = try Data(contentsOf: fileChirho)
        guard dataChirho.count <= limitChirho else { throw RemoteErrorChirho.tooLargeChirho }
        return dataChirho
    }
}

/// Set HINNEH_STATIC_ROOT_CHIRHO to the repository's static directory. This never uses the network,
/// rewrites source files, or infers verse presence from a count rather than the edition's manifest.
@Suite(.enabled(if: ProcessInfo.processInfo.environment["HINNEH_STATIC_ROOT_CHIRHO"] != nil))
struct CorpusTestsChirho {
    @Test func localGreekVerseRecordingsRetainTheirSourceAndRenditionChirho() async throws {
        let pathChirho = try #require(ProcessInfo.processInfo.environment["HINNEH_STATIC_ROOT_CHIRHO"])
        let rootChirho = URL(fileURLWithPath: pathChirho, isDirectory: true)
        let remoteChirho = RemoteChirho(transportChirho: CorpusTransportChirho(rootChirho: rootChirho))
        let contentChirho = ContentClientChirho(remoteChirho: remoteChirho)
        let audioChirho = AudioClientChirho(remoteChirho: remoteChirho)
        let manifestChirho = try DecodingChirho.decodeChirho(AudioManifestChirho.self,
            Data(contentsOf: rootChirho.appendingPathComponent("audio-chirho/manifest-chirho.json")))
        var expectedChirho = 0
        var checkedChirho = 0
        for bookChirho in BookListChirho.bundledChirho().booksChirho where bookChirho.languageChirho == "grc" {
            for entryChirho in manifestChirho.booksChirho[bookChirho.idChirho]?.chaptersChirho ?? [] {
                let catalogueChirho = try DecodingChirho.decodeChirho(AudioChapterChirho.self,
                    Data(contentsOf: rootChirho.appendingPathComponent(String(entryChirho.pathChirho.dropFirst()))))
                let clipsChirho = catalogueChirho.clipsChirho.filter {
                    $0.recipeIdChirho == "chatterbox-v3-modern-greek-verse-v1-chirho"
                }
                if clipsChirho.isEmpty { continue }
                let chapterChirho = try await contentChirho.chapterChirho(bookChirho, entryChirho.numberChirho)
                expectedChirho += clipsChirho.count
                for clipChirho in clipsChirho {
                    let numberChirho = try #require(Int(clipChirho.lessonIdChirho.split(separator: ".").last ?? ""))
                    let verseChirho = VerseDisplayChirho(try chapterChirho.lessonChirho(numberChirho))
                    let modernChirho = try await audioChirho.verseAudioChirho(chapterChirho, verseChirho, .modernChirho)
                    let aspiratesChirho = try await audioChirho.verseAudioChirho(chapterChirho, verseChirho, .modernAspiratesChirho)
                    let erasmianChirho = try await audioChirho.verseAudioChirho(chapterChirho, verseChirho, .erasmianChirho)
                    #expect(modernChirho.verseClipChirho?.sha256Chirho == clipChirho.sha256Chirho)
                    #expect(aspiratesChirho.verseClipChirho?.sha256Chirho ==
                        (GreekRenditionChirho.hasRoughBreathingChirho(verseChirho.canonicalTextChirho) ? nil : clipChirho.sha256Chirho))
                    #expect(erasmianChirho.verseClipChirho == nil)
                    checkedChirho += 1
                }
            }
        }
        #expect(checkedChirho == expectedChirho && expectedChirho > 0)
        print("iOS local Greek verse contract: \(checkedChirho)/\(expectedChirho) exact source and rendition selections")
    }

    @Test func publishedVerseVideosMatchTheirSceneAndSelectedHumanReadingChirho() async throws {
        let pathChirho = try #require(ProcessInfo.processInfo.environment["HINNEH_STATIC_ROOT_CHIRHO"])
        let rootChirho = URL(fileURLWithPath: pathChirho, isDirectory: true)
        let remoteChirho = RemoteChirho(transportChirho: CorpusTransportChirho(rootChirho: rootChirho))
        let contentChirho = ContentClientChirho(remoteChirho: remoteChirho)
        let mediaChirho = MediaClientChirho(remoteChirho: remoteChirho)
        let audioChirho = AudioClientChirho(remoteChirho: remoteChirho)
        let bookChirho = try #require(BookListChirho.bundledChirho().booksChirho.first { $0.idChirho == "Prov" })
        var expectedChirho = 0
        var checkedChirho = 0
        for numberChirho in 1...bookChirho.chapterCountChirho {
            guard let chapterMediaChirho = try await mediaChirho.chapterMediaChirho(bookChirho, numberChirho),
                  let videosChirho = chapterMediaChirho.videosChirho, !videosChirho.isEmpty else { continue }
            let chapterChirho = try await contentChirho.chapterChirho(bookChirho, numberChirho)
            expectedChirho += videosChirho.count
            for videoChirho in videosChirho {
                let verseNumberChirho = try #require(Int(videoChirho.lessonIdChirho.split(separator: ".").last ?? ""))
                let verseChirho = VerseDisplayChirho(try chapterChirho.lessonChirho(verseNumberChirho))
                let selectedChirho = try await mediaChirho.verseMediaChirho(bookChirho, numberChirho, verseChirho)
                let readingChirho = try await audioChirho.verseAudioChirho(chapterChirho, verseChirho, .modernAspiratesChirho)
                let clipChirho = try #require(readingChirho.verseClipChirho)
                #expect(selectedChirho.videoChirho?.sha256Chirho == videoChirho.sha256Chirho)
                #expect(videoChirho.carriesChirho(clipChirho))
                checkedChirho += 1
            }
        }
        #expect(checkedChirho == expectedChirho && expectedChirho > 0)
        print("iOS published video contract: \(checkedChirho)/\(expectedChirho) scene and human-reading selections")
    }

    @Test func humanReadingsSelectFromTheirSeparateSourceBoundArrayChirho() async throws {
        let pathChirho = try #require(ProcessInfo.processInfo.environment["HINNEH_STATIC_ROOT_CHIRHO"])
        let rootChirho = URL(fileURLWithPath: pathChirho, isDirectory: true).standardizedFileURL
        let remoteChirho = RemoteChirho(transportChirho: CorpusTransportChirho(rootChirho: rootChirho))
        let contentChirho = ContentClientChirho(remoteChirho: remoteChirho)
        let audioChirho = AudioClientChirho(remoteChirho: remoteChirho)
        let manifestChirho = try DecodingChirho.decodeChirho(AudioManifestChirho.self,
            Data(contentsOf: rootChirho.appendingPathComponent("audio-chirho/manifest-chirho.json")))
        var expectedChirho = 0
        var checkedChirho = 0
        for bookChirho in BookListChirho.bundledChirho().booksChirho {
            for entryChirho in manifestChirho.booksChirho[bookChirho.idChirho]?.chaptersChirho ?? [] {
                let catalogueChirho = try DecodingChirho.decodeChirho(AudioChapterChirho.self,
                    Data(contentsOf: rootChirho.appendingPathComponent(String(entryChirho.pathChirho.dropFirst()))))
                let readingsChirho = catalogueChirho.readingsChirho ?? []
                if readingsChirho.isEmpty { continue }
                #expect(catalogueChirho.clipsChirho.allSatisfy { $0.readingSourceChirho == nil })
                let chapterChirho = try await contentChirho.chapterChirho(bookChirho, entryChirho.numberChirho)
                expectedChirho += readingsChirho.count
                for readingChirho in readingsChirho {
                    let numberChirho = try #require(Int(readingChirho.lessonIdChirho.split(separator: ".").last ?? ""))
                    let verseChirho = VerseDisplayChirho(try chapterChirho.lessonChirho(numberChirho))
                    let selectedChirho = try await audioChirho.verseAudioChirho(chapterChirho, verseChirho, .modernAspiratesChirho)
                    #expect(selectedChirho.verseClipChirho?.sha256Chirho == readingChirho.sha256Chirho)
                    #expect(selectedChirho.verseClipChirho?.readingSourceChirho?.readerIdChirho == "rdb-chirho")
                    checkedChirho += 1
                }
            }
        }
        #expect(checkedChirho == expectedChirho && expectedChirho > 0)
        print("iOS human reading contract: \(checkedChirho)/\(expectedChirho) source-bound verse selections")
    }

    @Test func everyPublishedVerseValidatesAndPreservesItsVisibleSourceChirho() async throws {
        let pathChirho = try #require(ProcessInfo.processInfo.environment["HINNEH_STATIC_ROOT_CHIRHO"])
        let rootChirho = URL(fileURLWithPath: pathChirho, isDirectory: true).standardizedFileURL
        let clientChirho = ContentClientChirho(remoteChirho: RemoteChirho(
            transportChirho: CorpusTransportChirho(rootChirho: rootChirho)))
        var expectedChirho = 0
        var checkedChirho = 0
        var failuresChirho: [String] = []
        let booksChirho = BookListChirho.bundledChirho().booksChirho
        for bookChirho in booksChirho {
            let entriesChirho = try await clientChirho.chapterEntriesChirho(bookChirho)
            for entryChirho in entriesChirho {
                expectedChirho += entryChirho.versesChirho.count
                do {
                    let chapterChirho = try await clientChirho.chapterChirho(bookChirho, entryChirho.numberChirho)
                    for numberChirho in entryChirho.versesChirho {
                        let idChirho = "\(bookChirho.idChirho).\(entryChirho.numberChirho).\(numberChirho)"
                        do {
                            let verseChirho = VerseDisplayChirho(try chapterChirho.lessonChirho(numberChirho))
                            let shownChirho = verseChirho.wordsChirho.map(\.surfaceChirho).joined()
                            let originalChirho = verseChirho.canonicalTextChirho.unicodeScalars
                                .filter { !$0.properties.isWhitespace }
                            let visibleChirho = shownChirho.unicodeScalars
                                .filter { !$0.properties.isWhitespace }
                            guard !verseChirho.wordsChirho.isEmpty,
                                  originalChirho.elementsEqual(visibleChirho) else {
                                throw RemoteErrorChirho.invalidChirho("visible source order")
                            }
                            checkedChirho += 1
                        } catch {
                            failuresChirho.append("\(idChirho): \(error)")
                        }
                    }
                } catch {
                    failuresChirho.append("\(bookChirho.idChirho).\(entryChirho.numberChirho): \(error)")
                }
            }
        }
        print("iOS corpus contract: \(booksChirho.count) books; \(checkedChirho)/\(expectedChirho) verses; \(failuresChirho.count) failures")
        #expect(failuresChirho.isEmpty, "\(failuresChirho.prefix(12).joined(separator: "\n"))")
        #expect(checkedChirho == expectedChirho && expectedChirho > 0)
    }
}
