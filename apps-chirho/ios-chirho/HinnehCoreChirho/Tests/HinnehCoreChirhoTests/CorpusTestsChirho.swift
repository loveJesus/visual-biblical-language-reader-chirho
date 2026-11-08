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

private struct SpokenOracleEntryChirho: Decodable {
    let bookIdChirho: String
    let numberChirho: Int
    let pathChirho: String
    let sha256Chirho: String
    let contentSha256Chirho: String
    let audioSha256Chirho: String
}
private struct SpokenOracleIndexChirho: Decodable {
    let audioManifestSha256Chirho: String
    let chaptersChirho: [SpokenOracleEntryChirho]
    let versesChirho: Int
    let humanReadingsChirho: Int
    let wordClipsChirho: Int
}
private struct SpokenOracleVerseChirho: Decodable {
    let lessonIdChirho: String
    let spokenVerseChirho: String
    let spokenWordsChirho: [String: String]
    let wordClipsChirho: [String: String]
    let humanSha256Chirho: String?
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
        let manifestChirho = try DecodingChirho.decodeChirho(AudioManifestChirho.self,
            Data(contentsOf: rootChirho.appendingPathComponent("audio-chirho/manifest-chirho.json")))
        var expectedChirho = 0
        var checkedChirho = 0
        for bookChirho in BookListChirho.bundledChirho().booksChirho {
            for entryChirho in manifestChirho.booksChirho[bookChirho.idChirho]?.chaptersChirho ?? [] {
                let catalogueBytesChirho = try Data(contentsOf:
                    rootChirho.appendingPathComponent(String(entryChirho.pathChirho.dropFirst())))
                #expect(DigestChirho.sha256HexChirho(catalogueBytesChirho) == entryChirho.sha256Chirho)
                let catalogueChirho = try DecodingChirho.decodeChirho(AudioChapterChirho.self, catalogueBytesChirho)
                let readingsChirho = catalogueChirho.readingsChirho ?? []
                if readingsChirho.isEmpty { continue }
                #expect(catalogueChirho.clipsChirho.allSatisfy { $0.readingSourceChirho == nil })
                let chapterChirho = try await contentChirho.chapterChirho(bookChirho, entryChirho.numberChirho)
                #expect(catalogueChirho.contentPathChirho == chapterChirho.entryChirho.pathChirho)
                #expect(catalogueChirho.contentSha256Chirho == chapterChirho.entryChirho.sha256Chirho)
                #expect(catalogueChirho.bookIdChirho == bookChirho.idChirho && catalogueChirho.chapterChirho == entryChirho.numberChirho)
                #expect(catalogueChirho.schemaVersionChirho == 1 && catalogueChirho.clipsChirho.count + readingsChirho.count <= 2000)
                expectedChirho += readingsChirho.count
                // Bound work to one verified chapter and one verse's clips, rather than repeatedly
                // scanning and decoding the full chapter through an actor for every reading.
                let byLessonChirho = Dictionary(grouping: catalogueChirho.clipsChirho + readingsChirho,
                    by: \.lessonIdChirho)
                for readingChirho in readingsChirho {
                    let numberChirho = try #require(Int(readingChirho.lessonIdChirho.split(separator: ".").last ?? ""))
                    let verseChirho = VerseDisplayChirho(try chapterChirho.lessonChirho(numberChirho))
                    let selectedChirho = AudioRulesChirho.selectChirho(
                        byLessonChirho[readingChirho.lessonIdChirho] ?? [], verseChirho, .modernAspiratesChirho)
                    #expect(selectedChirho.verseClipChirho?.sha256Chirho == readingChirho.sha256Chirho,
                        "Human reading \(readingChirho.lessonIdChirho)")
                    #expect(selectedChirho.verseClipChirho?.readingSourceChirho?.readerIdChirho == "rdb-chirho")
                    checkedChirho += 1
                }
            }
        }
        #expect(checkedChirho == expectedChirho && expectedChirho > 0)
        print("iOS human reading contract: \(checkedChirho)/\(expectedChirho) source-bound verse selections")
    }

    /// Cold oracle generated by the actual web selector; all reads remain local and chapter-bounded.
    @Test(.enabled(if: ProcessInfo.processInfo.environment["HINNEH_WEB_SPOKEN_ROOT_CHIRHO"] != nil))
    func reviewedSpokenCorpusMatchesWebChirho() async throws {
        let rootChirho = URL(fileURLWithPath: try #require(ProcessInfo.processInfo.environment["HINNEH_STATIC_ROOT_CHIRHO"]))
        let oracleRootChirho = URL(fileURLWithPath: try #require(ProcessInfo.processInfo.environment["HINNEH_WEB_SPOKEN_ROOT_CHIRHO"]))
        let indexChirho = try DecodingChirho.decodeChirho(SpokenOracleIndexChirho.self,
            Data(contentsOf: oracleRootChirho.appendingPathComponent("index-chirho.json")))
        #expect(DigestChirho.sha256HexChirho(try Data(contentsOf: rootChirho.appendingPathComponent("audio-chirho/manifest-chirho.json"))) == indexChirho.audioManifestSha256Chirho)
        let contentChirho = ContentClientChirho(remoteChirho: RemoteChirho(transportChirho: CorpusTransportChirho(rootChirho: rootChirho)))
        var checkedVersesChirho = 0
        var checkedHumansChirho = 0
        var checkedWordsChirho = 0
        var mismatchesChirho: [String] = []
        for entryChirho in indexChirho.chaptersChirho {
            let bookChirho = FixtureChirho.bookChirho(entryChirho.bookIdChirho)
            let chapterChirho = try await contentChirho.chapterChirho(bookChirho,entryChirho.numberChirho)
            #expect(chapterChirho.entryChirho.sha256Chirho == entryChirho.contentSha256Chirho)
            let audioPathChirho = "audio-chirho/\(bookChirho.slugChirho)/" + bookChirho.chapterFileChirho(entryChirho.numberChirho)
            let audioBytesChirho = try Data(contentsOf: rootChirho.appendingPathComponent(audioPathChirho))
            #expect(DigestChirho.sha256HexChirho(audioBytesChirho) == entryChirho.audioSha256Chirho)
            let catalogueChirho = try DecodingChirho.decodeChirho(AudioChapterChirho.self,audioBytesChirho)
            let byLessonChirho = Dictionary(grouping: catalogueChirho.clipsChirho + (catalogueChirho.readingsChirho ?? []),by: \.lessonIdChirho)
            let oracleBytesChirho = try Data(contentsOf: oracleRootChirho.appendingPathComponent(entryChirho.pathChirho))
            #expect(DigestChirho.sha256HexChirho(oracleBytesChirho) == entryChirho.sha256Chirho)
            let rowsChirho = try DecodingChirho.decodeChirho([SpokenOracleVerseChirho].self,oracleBytesChirho)
            for rowChirho in rowsChirho {
                let numberChirho = try #require(Int(rowChirho.lessonIdChirho.split(separator: ".").last ?? ""))
                let verseChirho = VerseDisplayChirho(try chapterChirho.lessonChirho(numberChirho))
                if !ExactTextChirho.equalChirho(AudioRulesChirho.spokenVerseTextChirho(verseChirho),rowChirho.spokenVerseChirho) { mismatchesChirho.append("spoken verse \(rowChirho.lessonIdChirho)") }
                for wordChirho in verseChirho.wordsChirho {
                    let expectedChirho = try #require(rowChirho.spokenWordsChirho[wordChirho.idChirho])
                    if !ExactTextChirho.equalChirho(wordChirho.spokenTextChirho,expectedChirho) { mismatchesChirho.append("spoken word \(wordChirho.idChirho)") }
                }
                let selectedChirho = AudioRulesChirho.selectChirho(byLessonChirho[rowChirho.lessonIdChirho] ?? [],verseChirho)
                let actualWordsChirho = selectedChirho.wordClipsChirho.mapValues(\.sha256Chirho)
                if actualWordsChirho != rowChirho.wordClipsChirho { mismatchesChirho.append("word clips \(rowChirho.lessonIdChirho)") }
                if let expectedHumanChirho = rowChirho.humanSha256Chirho {
                    if selectedChirho.verseClipChirho?.sha256Chirho != expectedHumanChirho { mismatchesChirho.append("human \(rowChirho.lessonIdChirho)") }
                    else { checkedHumansChirho += 1 }
                }
                checkedWordsChirho += actualWordsChirho.count
                checkedVersesChirho += 1
            }
        }
        print("iOS spoken parity: \(checkedVersesChirho) verses; \(checkedHumansChirho)/\(indexChirho.humanReadingsChirho) human; \(checkedWordsChirho)/\(indexChirho.wordClipsChirho) words; mismatches \(mismatchesChirho)")
        #expect(mismatchesChirho.isEmpty)
        #expect(checkedVersesChirho == indexChirho.versesChirho)
        #expect(checkedHumansChirho == indexChirho.humanReadingsChirho)
        #expect(checkedWordsChirho == indexChirho.wordClipsChirho)
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
