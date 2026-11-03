// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation

/// One item of the reading key, in both interface languages, exported from the website.
public struct LegendItemChirho: Decodable, Sendable, Identifiable, Hashable {
    public let idChirho: String
    public let styleChirho: String
    public let sourceChirho: String?
    public let labelEnChirho: String
    public let helpEnChirho: String
    public let labelEsChirho: String
    public let helpEsChirho: String
    public let spanishAvailableChirho: Bool

    public var id: String { idChirho }

    public func labelChirho(_ localeChirho: LocaleChirho) -> String {
        localeChirho == .spanishChirho && spanishAvailableChirho ? labelEsChirho : labelEnChirho
    }

    public func helpChirho(_ localeChirho: LocaleChirho) -> String {
        localeChirho == .spanishChirho && spanishAvailableChirho ? helpEsChirho : helpEnChirho
    }

    /// The language the item is actually shown in, for VoiceOver.
    public func shownLanguageChirho(_ localeChirho: LocaleChirho) -> String {
        localeChirho == .spanishChirho && spanishAvailableChirho ? "es" : "en"
    }

    enum CodingKeys: String, CodingKey {
        case idChirho = "id_chirho"
        case styleChirho = "style_chirho"
        case sourceChirho = "source_chirho"
        case labelEnChirho = "label_en_chirho"
        case helpEnChirho = "help_en_chirho"
        case labelEsChirho = "label_es_chirho"
        case helpEsChirho = "help_es_chirho"
        case spanishAvailableChirho = "spanish_available_chirho"
    }
}

public struct LegendRowChirho: Decodable, Sendable, Identifiable, Hashable {
    public let labelEnChirho: String
    public let labelEsChirho: String
    public let itemsChirho: [LegendItemChirho]

    public var id: String { labelEnChirho }

    public func labelChirho(_ localeChirho: LocaleChirho) -> String {
        localeChirho == .spanishChirho ? labelEsChirho : labelEnChirho
    }

    enum CodingKeys: String, CodingKey {
        case labelEnChirho = "label_en_chirho"
        case labelEsChirho = "label_es_chirho"
        case itemsChirho = "items_chirho"
    }
}

public struct ConstructionChirho: Decodable, Sendable, Hashable {
    public let formChirho: String
    public let markerChirho: String

    enum CodingKeys: String, CodingKey {
        case formChirho = "form_chirho"
        case markerChirho = "marker_chirho"
    }
}

/// The website's teaching conventions (cue codes, Spanish grammar terms, the reading key),
/// exported by scripts-chirho/export_teaching_chirho.ts. Source grammar values are its keys.
public struct TeachingTablesChirho: Decodable, Sendable {
    public let schemaVersionChirho: Int
    public let hebrewStemsChirho: [String: String]
    public let hebrewFormsChirho: [String: String]
    public let hebrewConstructionsChirho: [String: ConstructionChirho]
    public let greekCuesChirho: [String: [String: String]]
    public let termsEsChirho: [String: String]
    public let legendHebrewChirho: [LegendRowChirho]
    public let legendGreekChirho: [LegendRowChirho]

    enum CodingKeys: String, CodingKey {
        case schemaVersionChirho = "schema_version_chirho"
        case hebrewStemsChirho = "hebrew_stems_chirho"
        case hebrewFormsChirho = "hebrew_forms_chirho"
        case hebrewConstructionsChirho = "hebrew_constructions_chirho"
        case greekCuesChirho = "greek_cues_chirho"
        case termsEsChirho = "terms_es_chirho"
        case legendHebrewChirho = "legend_hebrew_chirho"
        case legendGreekChirho = "legend_greek_chirho"
    }

    public static let sharedChirho: TeachingTablesChirho = {
        // Dictionary keys are source values, so no key conversion strategy is applied.
        guard let urlChirho = Bundle.module.url(forResource: "teaching-chirho", withExtension: "json"),
              let dataChirho = try? Data(contentsOf: urlChirho),
              let tablesChirho = try? JSONDecoder().decode(TeachingTablesChirho.self, from: dataChirho),
              tablesChirho.schemaVersionChirho == 1
        else { preconditionFailure("The exported teaching tables are part of the app build.") }
        return tablesChirho
    }()

    public func legendItemChirho(_ idChirho: String, _ scriptChirho: ScriptChirho) -> LegendItemChirho? {
        let rowsChirho = scriptChirho == .greekChirho ? legendGreekChirho : legendHebrewChirho
        for rowChirho in rowsChirho {
            if let itemChirho = rowChirho.itemsChirho.first(where: { $0.idChirho == idChirho }) {
                return itemChirho
            }
        }
        return nil
    }

    /// A source grammar value in the interface language; unknown values stay as the source gives them.
    public func termChirho(_ valueChirho: String, _ localeChirho: LocaleChirho) -> String {
        localeChirho == .spanishChirho ? (termsEsChirho[valueChirho] ?? valueChirho) : valueChirho
    }

    func greekCodeChirho(_ groupChirho: String, _ valueChirho: String?) -> String {
        guard let valueChirho else { return "" }
        return greekCuesChirho[groupChirho]?[valueChirho] ?? ""
    }
}
