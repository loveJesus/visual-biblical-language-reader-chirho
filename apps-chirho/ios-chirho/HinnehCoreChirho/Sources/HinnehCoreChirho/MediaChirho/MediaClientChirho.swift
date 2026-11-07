// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation

/// Reads a book's small media summary, then verifies only the selected chapter's media file.
/// Mirrors reader-chirho/navigation-chirho/media-client-chirho.ts and domain-chirho/media-chirho.ts.
public actor MediaClientChirho {
    private let remoteChirho: RemoteChirho
    private var chaptersChirho = BoundedCacheChirho<String, MediaChapterChirho>(capacityChirho: 4)

    public init(remoteChirho: RemoteChirho) {
        self.remoteChirho = remoteChirho
    }

    public func verseMediaChirho(_ bookChirho: BookChirho, _ chapterChirho: Int, _ verseChirho: VerseDisplayChirho)
        async throws -> VerseMediaChirho {
        guard let mediaChirho = try await chapterMediaChirho(bookChirho, chapterChirho) else {
            return .emptyChirho
        }
        return MediaRulesChirho.selectChirho(mediaChirho, verseChirho)
    }

    func chapterMediaChirho(_ bookChirho: BookChirho, _ chapterChirho: Int) async throws -> MediaChapterChirho? {
        let keyChirho = "\(bookChirho.idChirho).\(chapterChirho)"
        if let cachedChirho = chaptersChirho.valueChirho(keyChirho) { return cachedChirho }
        // A summary read just before a release may name an older chapter hash: read it once more.
        for attemptChirho in 0..<2 {
            let summaryChirho = try MediaRulesChirho.validSummaryChirho(
                DecodingChirho.decodeChirho(MediaSummaryChirho.self, try await remoteChirho.dataChirho(
                    "/media-chirho/\(bookChirho.slugChirho)/summary-chirho.json", .mediaSummaryChirho)),
                bookChirho)
            guard let entryChirho = summaryChirho.chaptersChirho.first(where: { $0.numberChirho == chapterChirho })
            else { return nil }
            do {
                let dataChirho = try await remoteChirho.verifiedChirho(
                    entryChirho.pathChirho, .mediaChapterChirho, sha256Chirho: entryChirho.sha256Chirho)
                let mediaChirho = try MediaRulesChirho.validChapterChirho(
                    DecodingChirho.decodeChirho(MediaChapterChirho.self, dataChirho), bookChirho, entryChirho)
                chaptersChirho.insertChirho(keyChirho, mediaChirho)
                return mediaChirho
            } catch RemoteErrorChirho.integrityChirho where attemptChirho == 0 {
                continue
            }
        }
        throw RemoteErrorChirho.integrityChirho
    }
}

enum MediaRulesChirho {
    static func validSummaryChirho(_ summaryChirho: MediaSummaryChirho, _ bookChirho: BookChirho) throws
        -> MediaSummaryChirho {
        guard summaryChirho.schemaVersionChirho == 1, summaryChirho.bookIdChirho == bookChirho.idChirho,
              summaryChirho.chaptersChirho.count <= bookChirho.chapterCountChirho,
              summaryChirho.sceneCountChirho >= 0, summaryChirho.iconCountChirho >= 0
        else { throw RemoteErrorChirho.invalidChirho("media summary") }
        var previousChirho = 0
        for entryChirho in summaryChirho.chaptersChirho {
            guard entryChirho.numberChirho > previousChirho,
                  entryChirho.numberChirho <= bookChirho.chapterCountChirho,
                  entryChirho.pathChirho == "/media-chirho/\(bookChirho.slugChirho)/"
                      + bookChirho.chapterFileChirho(entryChirho.numberChirho),
                  DigestChirho.isHexChirho(entryChirho.sha256Chirho),
                  entryChirho.sceneCountChirho >= 0, entryChirho.iconCountChirho >= 0,
                  (0...4096).contains(entryChirho.lemmaIconCountChirho ?? 0)
            else { throw RemoteErrorChirho.invalidChirho("media chapter entry") }
            previousChirho = entryChirho.numberChirho
        }
        guard summaryChirho.chaptersChirho.reduce(0, { $0 + $1.sceneCountChirho }) == summaryChirho.sceneCountChirho,
              summaryChirho.chaptersChirho.reduce(0, { $0 + $1.iconCountChirho }) == summaryChirho.iconCountChirho
        else { throw RemoteErrorChirho.invalidChirho("media totals") }
        return summaryChirho
    }

    static func validChapterChirho(_ mediaChirho: MediaChapterChirho, _ bookChirho: BookChirho,
                                   _ entryChirho: MediaSummaryEntryChirho) throws -> MediaChapterChirho {
        let prefixChirho = "\(bookChirho.idChirho).\(entryChirho.numberChirho)."
        guard mediaChirho.schemaVersionChirho == 1, mediaChirho.bookIdChirho == bookChirho.idChirho,
              mediaChirho.chapterChirho == entryChirho.numberChirho,
              mediaChirho.scenesChirho.count == entryChirho.sceneCountChirho,
              mediaChirho.iconsChirho.count == entryChirho.iconCountChirho,
              (mediaChirho.lemmaIconsChirho?.count ?? 0) == (entryChirho.lemmaIconCountChirho ?? 0),
              mediaChirho.scenesChirho.allSatisfy({ $0.lessonIdChirho.hasPrefix(prefixChirho) }),
              mediaChirho.iconsChirho.allSatisfy({ $0.lessonIdChirho?.hasPrefix(prefixChirho) == true })
        else { throw RemoteErrorChirho.invalidChirho("media chapter") }
        return mediaChirho
    }

    static func selectChirho(_ mediaChirho: MediaChapterChirho, _ verseChirho: VerseDisplayChirho)
        -> VerseMediaChirho {
        let sceneChirho = mediaChirho.scenesChirho.first { sceneChirho in
            sceneChirho.lessonIdChirho == verseChirho.idChirho && (sceneChirho.variantChirho ?? "standard") == "standard"
                && validSceneChirho(sceneChirho)
        }
        var picturesChirho = generalPicturesChirho(mediaChirho.lemmaIconsChirho ?? [], verseChirho)
        for (tokenIdChirho, pictureChirho) in contextualPicturesChirho(mediaChirho.iconsChirho, verseChirho) {
            picturesChirho[tokenIdChirho] = pictureChirho
        }
        let videoChirho = sceneChirho.flatMap { sceneValueChirho in
            mediaChirho.videosChirho?.prefix(400).first { $0.validChirho(verseChirho, sceneValueChirho) }
        }
        return VerseMediaChirho(sceneChirho: sceneChirho, picturesChirho: picturesChirho, videoChirho: videoChirho)
    }

    static func validSceneChirho(_ sceneChirho: SceneRecordChirho) -> Bool {
        OriginChirho.urlChirho(sceneChirho.assetPathChirho, .artworkChirho) != nil
            && DigestChirho.isHexChirho(sceneChirho.sha256Chirho)
            && ["pending", "approved"].contains(sceneChirho.artReviewChirho)
            && !sceneChirho.altChirho.trimmingCharacters(in: .whitespaces).isEmpty
            && (1...4096).contains(sceneChirho.widthChirho) && (1...4096).contains(sceneChirho.heightChirho)
    }

    static func validIconChirho(_ iconChirho: IconRecordChirho) -> Bool {
        OriginChirho.urlChirho(iconChirho.assetPathChirho, .artworkChirho) != nil
            && DigestChirho.isHexChirho(iconChirho.sha256Chirho)
            && ["agent_reviewed", "human_reviewed"].contains(iconChirho.senseReviewChirho)
            && ["pending", "approved"].contains(iconChirho.artReviewChirho)
            && ![iconChirho.senseIdChirho, iconChirho.contextualMeaningChirho, iconChirho.altChirho]
                .contains(where: { $0.trimmingCharacters(in: .whitespaces).isEmpty })
            && !iconChirho.evidenceRefsChirho.isEmpty
            && (1...128).contains(iconChirho.widthChirho) && (1...128).contains(iconChirho.heightChirho)
    }

    /// Full-lemma identity: Hebrew lemma plus augment; Greek lemma plus its exact lexical form.
    /// The key is the UTF-8 bytes, because a Swift String key would hash canonically equivalent
    /// forms (oxia and tonos, NFC and NFD) as the same lemma.
    static func lemmaKeyChirho(lemmaIdChirho: String, augmentChirho: String?, lexicalFormChirho: String?,
                               greekChirho: Bool) -> Data? {
        guard lemmaIdChirho.wholeMatch(of: /(?:[HG][1-9][0-9]{0,4}|oshb:[bcdiklms])/) != nil else { return nil }
        if greekChirho {
            guard lemmaIdChirho.hasPrefix("G"), augmentChirho == nil, let formChirho = lexicalFormChirho,
                  !formChirho.trimmingCharacters(in: .whitespaces).isEmpty
            else { return nil }
            return Data((lemmaIdChirho + "\u{1F}" + formChirho).utf8)
        }
        if let augmentChirho, augmentChirho.wholeMatch(of: /[a-z]{1,2}/) == nil { return nil }
        return Data((lemmaIdChirho + "\u{1F}" + (augmentChirho ?? "")).utf8)
    }

    /// General pictures per full lemma; a word whose lemma assignment awaits review gets none.
    static func generalPicturesChirho(_ defaultsChirho: [IconRecordChirho], _ verseChirho: VerseDisplayChirho)
        -> [String: WordPictureChirho] {
        let greekChirho = verseChirho.scriptChirho == .greekChirho
        var byLemmaChirho: [Data: IconRecordChirho] = [:]
        for iconChirho in defaultsChirho.prefix(4096) where validIconChirho(iconChirho) {
            guard let keyChirho = lemmaKeyChirho(
                lemmaIdChirho: iconChirho.lemmaIdChirho, augmentChirho: iconChirho.lemmaAugmentChirho,
                lexicalFormChirho: iconChirho.lexicalFormChirho, greekChirho: greekChirho),
                  byLemmaChirho[keyChirho] == nil
            else { continue }
            byLemmaChirho[keyChirho] = iconChirho
        }
        var picturesChirho: [String: WordPictureChirho] = [:]
        for wordChirho in verseChirho.wordsChirho where !wordChirho.lemmaReviewPendingChirho {
            guard let keyChirho = lemmaKeyChirho(
                lemmaIdChirho: wordChirho.lemmaIdChirho, augmentChirho: wordChirho.lemmaAugmentChirho,
                lexicalFormChirho: greekChirho ? wordChirho.lexicalFormChirho : nil, greekChirho: greekChirho),
                  let iconChirho = byLemmaChirho[keyChirho]
            else { continue }
            picturesChirho[wordChirho.idChirho] = WordPictureChirho(
                recordChirho: iconChirho, assignmentChirho: .generalChirho, alternativesChirho: [])
        }
        return picturesChirho
    }

    /// Reviewed contextual pictures for this verse's own words, while their reviewed context holds.
    static func contextualPicturesChirho(_ iconsChirho: [IconRecordChirho], _ verseChirho: VerseDisplayChirho)
        -> [String: WordPictureChirho] {
        let greekChirho = verseChirho.scriptChirho == .greekChirho
        let wordsChirho = Dictionary(uniqueKeysWithValues: verseChirho.wordsChirho.map { ($0.idChirho, $0) })
        let sourceIdsChirho = Set(verseChirho.sourcesChirho.map(\.idChirho))
        var groupsChirho: [String: [IconRecordChirho]] = [:]
        for iconChirho in iconsChirho where iconChirho.lessonIdChirho == verseChirho.idChirho {
            guard let wordChirho = wordsChirho[iconChirho.tokenIdChirho],
                  iconChirho.assignmentChirho == nil || iconChirho.assignmentChirho == "contextual",
                  validIconChirho(iconChirho),
                  iconChirho.evidenceRefsChirho.allSatisfy(sourceIdsChirho.contains),
                  lemmaMatchesChirho(iconChirho, wordChirho, greekChirho),
                  contextMatchesChirho(iconChirho, wordChirho, verseChirho)
            else { continue }
            groupsChirho[iconChirho.tokenIdChirho, default: []].append(iconChirho)
        }
        var picturesChirho: [String: WordPictureChirho] = [:]
        for (tokenIdChirho, groupChirho) in groupsChirho {
            let selectedChirho = groupChirho.filter { $0.selectedChirho != false }
            guard selectedChirho.count == 1, let chosenChirho = selectedChirho.first else { continue }
            picturesChirho[tokenIdChirho] = WordPictureChirho(
                recordChirho: chosenChirho, assignmentChirho: .contextualChirho,
                alternativesChirho: distinctAlternativesChirho(chosenChirho, groupChirho))
        }
        return picturesChirho
    }

    static func lemmaMatchesChirho(_ iconChirho: IconRecordChirho, _ wordChirho: WordDisplayChirho,
                                   _ greekChirho: Bool) -> Bool {
        if greekChirho {
            return iconChirho.lemmaIdChirho == wordChirho.lemmaIdChirho && iconChirho.lemmaAugmentChirho == nil
                && iconChirho.lexicalFormChirho.map { ExactTextChirho.equalChirho($0, wordChirho.lexicalFormChirho) }
                    == true
        }
        return iconChirho.lemmaIdChirho == wordChirho.lemmaIdChirho
            && iconChirho.lemmaAugmentChirho == wordChirho.lemmaAugmentChirho
    }

    /// Reused art stays attached only while the reviewed word, gloss and verse are unchanged.
    static func contextMatchesChirho(_ iconChirho: IconRecordChirho, _ wordChirho: WordDisplayChirho,
                                     _ verseChirho: VerseDisplayChirho) -> Bool {
        let pinsChirho = [iconChirho.contextTextChirho, iconChirho.contextGlossChirho,
                          iconChirho.contextCanonicalTextChirho]
        if pinsChirho.allSatisfy({ $0 == nil }) { return true }
        guard let textChirho = iconChirho.contextTextChirho, let glossChirho = iconChirho.contextGlossChirho,
              let canonicalChirho = iconChirho.contextCanonicalTextChirho, let wordGlossChirho = wordChirho.glossChirho
        else { return false }
        return ExactTextChirho.equalChirho(textChirho, wordChirho.textChirho)
            && ExactTextChirho.equalChirho(glossChirho, wordGlossChirho)
            && ExactTextChirho.equalChirho(canonicalChirho, verseChirho.canonicalTextChirho)
    }

    /// One picture per other reviewed meaning: repeated senses, labels, files or hashes fold away.
    static func distinctAlternativesChirho(_ chosenChirho: IconRecordChirho, _ groupChirho: [IconRecordChirho])
        -> [IconRecordChirho] {
        func meaningKeyChirho(_ textChirho: String) -> String {
            textChirho.split(whereSeparator: \.isWhitespace).joined(separator: " ").lowercased()
        }
        var sensesChirho: Set = [chosenChirho.senseIdChirho]
        var meaningsChirho: Set = [meaningKeyChirho(chosenChirho.contextualMeaningChirho)]
        var pathsChirho: Set = [chosenChirho.assetPathChirho]
        var hashesChirho: Set = [chosenChirho.sha256Chirho]
        var resultChirho: [IconRecordChirho] = []
        for candidateChirho in groupChirho {
            let meaningChirho = meaningKeyChirho(candidateChirho.contextualMeaningChirho)
            guard !sensesChirho.contains(candidateChirho.senseIdChirho), !meaningsChirho.contains(meaningChirho),
                  !pathsChirho.contains(candidateChirho.assetPathChirho),
                  !hashesChirho.contains(candidateChirho.sha256Chirho)
            else { continue }
            sensesChirho.insert(candidateChirho.senseIdChirho)
            meaningsChirho.insert(meaningChirho)
            pathsChirho.insert(candidateChirho.assetPathChirho)
            hashesChirho.insert(candidateChirho.sha256Chirho)
            resultChirho.append(candidateChirho)
        }
        return resultChirho
    }
}
