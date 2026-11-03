// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation

/// The sourced grammar of one word, in the interface language, and the reading-key entries that
/// explain each mark drawn on it.
public enum MorphologyChirho {
    /// "noun; gender masculine; number singular; state absolute", term for term in Spanish.
    public static func summaryChirho(_ wordChirho: WordDisplayChirho, _ localeChirho: LocaleChirho,
                                     _ tablesChirho: TeachingTablesChirho = .sharedChirho) -> String {
        let termChirho = { (valueChirho: String) in tablesChirho.termChirho(valueChirho, localeChirho) }
        let messagesChirho = MessagesChirho.forChirho(localeChirho)
        if let greekChirho = wordChirho.greekChirho {
            let valuesChirho = [greekChirho.caseChirho, greekChirho.numberChirho, greekChirho.genderChirho,
                                greekChirho.tenseChirho, greekChirho.voiceChirho, greekChirho.moodChirho,
                                greekChirho.personChirho]
                .compactMap { $0 }
                .filter { !$0.isEmpty && $0 != "na" && $0 != "unknown" }
            return ([greekChirho.partOfSpeechChirho] + valuesChirho).map(termChirho).joined(separator: ", ")
        }
        guard let hebrewChirho = wordChirho.hebrewChirho else { return wordChirho.analysisChirho }
        let shownChirho = { (valueChirho: String) in
            valueChirho == "na" ? messagesChirho.notApplicableChirho : termChirho(valueChirho)
        }
        var partsChirho = [
            termChirho(hebrewPosChirho(wordChirho)),
            "\(messagesChirho.genderChirho) \(shownChirho(hebrewChirho.genderChirho))",
            "\(messagesChirho.numberChirho) \(shownChirho(hebrewChirho.numberChirho))",
            "\(messagesChirho.stateChirho) \(shownChirho(hebrewChirho.stateChirho))"
        ]
        if let formChirho = hebrewChirho.verbFormChirho {
            partsChirho.append("\(hebrewChirho.verbStemChirho ?? "") "
                + "\(hebrewChirho.verbConstructionChirho ?? formChirho)")
        } else if let codeChirho = hebrewChirho.verbCodeChirho {
            partsChirho.append("\(messagesChirho.localVerbCodeChirho) \(codeChirho)")
        }
        return partsChirho.joined(separator: "; ")
    }

    /// Reading-key entries for the marks this word carries, in the order they are drawn.
    public static func legendChirho(_ wordChirho: WordDisplayChirho,
                                    _ tablesChirho: TeachingTablesChirho = .sharedChirho) -> [LegendItemChirho] {
        let scriptChirho: ScriptChirho = wordChirho.greekChirho == nil ? .hebrewChirho : .greekChirho
        return legendIdsChirho(wordChirho, tablesChirho).compactMap {
            tablesChirho.legendItemChirho($0, scriptChirho)
        }
    }

    static func legendIdsChirho(_ wordChirho: WordDisplayChirho, _ tablesChirho: TeachingTablesChirho)
        -> [String] {
        if let greekChirho = wordChirho.greekChirho {
            var idsChirho: [String] = []
            if wordChirho.cuesChirho.categoryChirho != .unknownChirho {
                idsChirho.append("greek-\(categoryNameChirho(wordChirho.cuesChirho.categoryChirho))-chirho")
            }
            idsChirho.append(greekGenderIdChirho(greekChirho.genderChirho))
            idsChirho.append(greekChirho.numberChirho == "plural" ? "greek-plural-chirho" : "greek-other-number-chirho")
            let codesChirho: [(String, String?)] = [
                ("case", greekChirho.caseChirho), ("tense", greekChirho.tenseChirho),
                ("voice", greekChirho.voiceChirho), ("person", greekChirho.personChirho),
                ("mood", greekChirho.moodChirho)
            ]
            for (groupChirho, valueChirho) in codesChirho {
                let codeChirho = tablesChirho.greekCodeChirho("\(groupChirho)_chirho", valueChirho)
                if !codeChirho.isEmpty { idsChirho.append("greek-\(groupChirho)-\(codeChirho.lowercased())-chirho") }
            }
            return idsChirho
        }
        guard let hebrewChirho = wordChirho.hebrewChirho else { return [] }
        var idsChirho = [hebrewGenderIdChirho(hebrewChirho.genderChirho),
                         hebrewNumberIdChirho(hebrewChirho.numberChirho)]
        if wordChirho.cuesChirho.centerChirho == "i" { idsChirho.append("absolute-chirho") }
        if wordChirho.cuesChirho.centerChirho == "ii" { idsChirho.append("construct-chirho") }
        if let stemChirho = hebrewChirho.verbStemChirho, tablesChirho.hebrewStemsChirho[stemChirho] != nil {
            idsChirho.append("\(stemChirho)-chirho")
        }
        if let formIdChirho = hebrewFormLegendIdChirho(hebrewChirho) { idsChirho.append(formIdChirho) }
        idsChirho.append(hebrewOutlineIdChirho(wordChirho.cuesChirho.categoryChirho))
        switch wordChirho.cuesChirho.patternChirho {
        case .solidChirho: idsChirho.append("exceptional-chirho")
        case .dottedChirho: idsChirho.append("weak-chirho")
        case .noneChirho: break
        }
        return idsChirho
    }

    static func greekGenderIdChirho(_ genderChirho: String) -> String {
        switch genderChirho {
        case "masculine": "greek-masculine-chirho"
        case "feminine": "greek-feminine-chirho"
        case "neuter": "greek-neuter-chirho"
        default: "greek-no-gender-chirho"
        }
    }

    static func hebrewGenderIdChirho(_ genderChirho: String) -> String {
        switch genderChirho {
        case "masculine": "masculine-chirho"
        case "feminine": "feminine-chirho"
        case "common": "clear-chirho"
        default: "unknown-gender-chirho"
        }
    }

    static func hebrewNumberIdChirho(_ numberChirho: String) -> String {
        switch numberChirho {
        case "plural": "plural-chirho"
        case "dual": "dual-chirho"
        default: "unmarked-chirho"
        }
    }

    static func hebrewOutlineIdChirho(_ categoryChirho: CategoryChirho) -> String {
        switch categoryChirho {
        case .nounChirho: "noun-chirho"
        case .verbChirho: "verb-chirho"
        case .adjectiveChirho: "adjective-chirho"
        case .particleChirho: "particle-chirho"
        default: "unknown-pos-chirho"
        }
    }

    static func hebrewFormLegendIdChirho(_ hebrewChirho: HebrewFactsChirho) -> String? {
        if let constructionChirho = hebrewChirho.verbConstructionChirho {
            return switch constructionChirho {
            case "weyiqtol": "weyiqtol-chirho"
            case "qatal_copulative": "qatal-copulative-chirho"
            default: nil
            }
        }
        return switch hebrewChirho.verbFormChirho {
        case "participle_active", "participle_passive": "participle-chirho"
        case "infinitive_construct": "infinitive-construct-chirho"
        case "infinitive_absolute": "infinitive-absolute-chirho"
        case .some(let formChirho): "\(formChirho)-chirho"
        case .none: nil
        }
    }

    static func hebrewPosChirho(_ wordChirho: WordDisplayChirho) -> String {
        switch wordChirho.cuesChirho.categoryChirho {
        case .nounChirho: "noun"
        case .verbChirho: "verb"
        case .adjectiveChirho: "adjective"
        case .particleChirho: "particle"
        default: "unknown"
        }
    }

    static func categoryNameChirho(_ categoryChirho: CategoryChirho) -> String {
        switch categoryChirho {
        case .nounChirho: "noun"
        case .verbChirho: "verb"
        case .adjectiveChirho: "adjective"
        case .particleChirho: "particle"
        case .pronounChirho: "pronoun"
        case .articleChirho: "article"
        case .unknownChirho: "unknown"
        }
    }
}
