// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation

/// Word class as the reading key draws it (icon outline colour and shape).
public enum CategoryChirho: String, Sendable, Hashable {
    case nounChirho, verbChirho, adjectiveChirho, particleChirho, pronounChirho, articleChirho, unknownChirho
}

public enum ShadeChirho: Sendable, Hashable {
    case masculineChirho, feminineChirho, neuterChirho
}

public enum UnderlineChirho: Sendable, Hashable {
    case pluralChirho, dualChirho
}

public enum PatternChirho: Sendable, Hashable {
    case noneChirho, dottedChirho, solidChirho
}

/// The compact marks drawn around one word. Positions are physical (left/centre/right), as in the
/// website's key: Hebrew stem LEFT and conjugation RIGHT; Greek tense+voice left, person+mood right.
public struct CueSetChirho: Sendable, Hashable {
    public var shadeChirho: ShadeChirho?
    public var underlineChirho: UnderlineChirho?
    public var categoryChirho: CategoryChirho
    public var leftChirho = ""
    public var centerChirho = ""
    public var rightChirho = ""
    public var patternChirho = PatternChirho.noneChirho
}

/// Display annotations derived from the verified source analysis only; nothing is inferred from
/// spelling or a root. Mirrors domain-chirho/cues-chirho.ts and greek-cues-chirho.ts.
public enum CuesChirho {
    public static func hebrewChirho(_ tokenChirho: HebrewTokenChirho,
                                    _ tablesChirho: TeachingTablesChirho = .sharedChirho) -> CueSetChirho {
        let posChirho = tokenChirho.posChirho
        var cuesChirho = CueSetChirho(categoryChirho: hebrewCategoryChirho(posChirho))
        cuesChirho.shadeChirho = switch tokenChirho.genderChirho {
        case "masculine": .masculineChirho
        case "feminine": .feminineChirho
        default: nil
        }
        cuesChirho.underlineChirho = switch tokenChirho.numberChirho {
        case "plural": .pluralChirho
        case "dual": .dualChirho
        default: nil
        }
        if posChirho == "noun" {
            cuesChirho.centerChirho = switch tokenChirho.stateChirho {
            case "absolute": "i"
            case "construct": "ii"
            default: ""
            }
        }
        if posChirho == "verb" {
            let codeChirho = tokenChirho.verbCodeChirho.flatMap { codeChirho in
                codeChirho.wholeMatch(of: /[1-7][PIMACB]/) != nil ? Array(codeChirho) : nil
            }
            let stemChirho = tokenChirho.verbStemChirho.flatMap { tablesChirho.hebrewStemsChirho[$0] } ?? ""
            cuesChirho.leftChirho = stemChirho.isEmpty ? codeChirho.map { String($0[0]) } ?? "" : stemChirho
            let formChirho = formMarkerChirho(
                tokenChirho.verbFormChirho, tokenChirho.verbConstructionChirho, tablesChirho)
            cuesChirho.rightChirho = formChirho.isEmpty ? codeChirho.map { String($0[1]) } ?? "" : formChirho
        }
        if let noteChirho = tokenChirho.formNoteChirho,
           !noteChirho.textChirho.trimmingCharacters(in: .whitespaces).isEmpty,
           let sourceChirho = URL(string: noteChirho.sourceChirho),
           ["https", "http"].contains(sourceChirho.scheme ?? ""), sourceChirho.user == nil,
           sourceChirho.password == nil {
            cuesChirho.patternChirho = switch noteChirho.kindChirho {
            case "predictable_weak": .dottedChirho
            case "exceptional", "suppletive": .solidChirho
            default: .noneChirho
            }
        }
        return cuesChirho
    }

    /// The local teaching letter for a sourced verb form; a construction needs its own source.
    public static func formMarkerChirho(_ formChirho: String?, _ constructionChirho: String?,
                                        _ tablesChirho: TeachingTablesChirho = .sharedChirho) -> String {
        if let constructionChirho {
            guard let recordChirho = tablesChirho.hebrewConstructionsChirho[constructionChirho],
                  recordChirho.formChirho == formChirho else { return "" }
            return recordChirho.markerChirho
        }
        guard let formChirho else { return "" }
        return tablesChirho.hebrewFormsChirho[formChirho] ?? ""
    }

    public static func greekChirho(_ tokenChirho: GreekTokenChirho,
                                   _ tablesChirho: TeachingTablesChirho = .sharedChirho) -> CueSetChirho {
        let verbChirho = tokenChirho.partOfSpeechChirho == "verb"
        var cuesChirho = CueSetChirho(categoryChirho: greekCategoryChirho(tokenChirho.partOfSpeechChirho))
        cuesChirho.shadeChirho = switch tokenChirho.genderChirho {
        case "masculine": .masculineChirho
        case "feminine": .feminineChirho
        case "neuter": .neuterChirho
        default: nil
        }
        cuesChirho.underlineChirho = tokenChirho.numberChirho == "plural" ? .pluralChirho : nil
        if verbChirho {
            cuesChirho.leftChirho = tablesChirho.greekCodeChirho("tense_chirho", tokenChirho.tenseChirho)
                + tablesChirho.greekCodeChirho("voice_chirho", tokenChirho.voiceChirho)
        }
        cuesChirho.centerChirho = tablesChirho.greekCodeChirho("case_chirho", tokenChirho.caseChirho)
        cuesChirho.rightChirho = tablesChirho.greekCodeChirho("person_chirho", tokenChirho.personChirho)
            + (verbChirho ? tablesChirho.greekCodeChirho("mood_chirho", tokenChirho.moodChirho) : "")
        return cuesChirho
    }

    static func hebrewCategoryChirho(_ posChirho: String) -> CategoryChirho {
        switch posChirho {
        case "noun": .nounChirho
        case "verb": .verbChirho
        case "adjective": .adjectiveChirho
        case "particle": .particleChirho
        default: .unknownChirho
        }
    }

    public static func greekCategoryChirho(_ partChirho: String) -> CategoryChirho {
        if partChirho == "article" { return .articleChirho }
        if partChirho.hasSuffix(" pronoun") { return .pronounChirho }
        if partChirho == "noun" || partChirho == "proper noun indeclinable" { return .nounChirho }
        if partChirho == "verb" { return .verbChirho }
        if partChirho == "adjective" { return .adjectiveChirho }
        if ["particle", "preposition", "conjunction", "adverb", "cond"].contains(partChirho) {
            return .particleChirho
        }
        return .unknownChirho
    }
}
