// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation

public enum LocaleChirho: String, Sendable, CaseIterable, Identifiable {
    case englishChirho = "en"
    case spanishChirho = "es"

    public var id: String { rawValue }

    /// The language's own name, shown in the chooser.
    public var nativeNameChirho: String { self == .spanishChirho ? "Español" : "English" }

    /// The device's preferred language when it is Spanish, else English.
    public static func preferredChirho(_ languagesChirho: [String] = Locale.preferredLanguages) -> LocaleChirho {
        languagesChirho.first?.lowercased().hasPrefix("es") == true ? .spanishChirho : .englishChirho
    }
}

/// Every interface string, in both languages. The memberwise initializer makes a missing
/// translation a compile error. Hebrew and Greek source text never appears here.
public struct MessagesChirho: Sendable {
    public let taglineChirho: String
    public let hebrewBadgeChirho: String
    public let greekBadgeChirho: String
    public let spanishOrderNoteChirho: String
    public let choosePassageChirho: String
    public let bookChirho: String
    public let chapterChirho: String
    public let verseChirho: String
    public let languageChirho: String
    public let settingsChirho: String
    public let speedChirho: String
    public let studyAidsChirho: String
    public let studyAidsHelpChirho: String
    public let oldTestamentChirho: String
    public let newTestamentChirho: String
    public let doneChirho: String
    public let previousVerseChirho: String
    public let nextVerseChirho: String
    public let loadingChirho: String
    public let retryChirho: String
    public let verseErrorChirho: String
    public let connectionHintChirho: String
    public let readRightToLeftChirho: String
    public let readLeftToRightChirho: String
    public let showTranslationChirho: String
    public let appGlossNoteChirho: String
    public let gbtOrderNoteChirho: String
    public let bereanOrderNoteChirho: String
    public let lookCloserChirho: String
    public let meaningChirho: String
    public let morphologyChirho: String
    public let glossApprovedChirho: String
    public let glossAppChirho: String
    public let glossUnavailableChirho: String
    public let glossBereanChirho: String
    public let notSeparatelyTranslatedChirho: String
    public let spanishGlossApprovedChirho: String
    public let spanishGlossMissingChirho: String
    public let spanishLayerUnavailableChirho: String
    public let spanishLayerStaleChirho: String
    public let lexicalFormChirho: String
    public let lemmaChirho: String
    public let rootChirho: String
    public let rootTraditionalChirho: String
    public let rootUnresolvedChirho: String
    public let rootNotApplicableChirho: String
    public let sourceMorphologyChirho: String
    public let sourceNoteChirho: String
    public let qereChirho: String
    public let qereNoteChirho: String
    public let aramaicNoteChirho: String
    public let formPatternChirho: String
    public let marksChirho: String
    public let wordPictureChirho: String
    public let contextualPictureChirho: String
    public let generalPictureChirho: String
    public let generalPictureCaveatChirho: String
    public let otherMeaningsChirho: String
    public let artPendingChirho: String
    public let artApprovedChirho: String
    public let pictureUnavailableChirho: String
    public let sceneAwaitingChirho: String
    public let sceneUnavailableChirho: String
    public let sceneCaptionChirho: String
    public let playWordChirho: String
    public let playVerseChirho: String
    public let stopChirho: String
    public let audioAuditionChirho: String
    public let audioApprovedChirho: String
    public let audioUnavailableChirho: String
    public let audioFailedChirho: String
    public let aramaicAudioChirho: String
    public let hebrewVoiceChirho: String
    public let greekVoiceChirho: String
    public let greekAspiratesVoiceChirho: String
    public let erasmianVoiceChirho: String
    public let pronunciationChirho: String
    public let renditionAspiratesChirho: String
    public let renditionModernChirho: String
    public let renditionErasmianChirho: String
    public let renditionMissingChirho: String
    public let readingKeyChirho: String
    public let readingKeyHintChirho: String
    public let grammarCreditChirho: String
    public let grammarReferenceChirho: String
    public let sourcesChirho: String
    public let revisionChirho: String
    public let exactTextChirho: String
    public let exactTextNoteChirho: String
    public let kjvNumberingChirho: String
    public let genderChirho: String
    public let numberChirho: String
    public let stateChirho: String
    public let notApplicableChirho: String
    public let localVerbCodeChirho: String
    public let privacyChirho: String
    public let privacyPolicyChirho: String
    public let aboutSupportChirho: String
    public let sourceCodeChirho: String
    public let opensBrowserChirho: String
    public let closingNoteChirho: String

    public static func forChirho(_ localeChirho: LocaleChirho) -> MessagesChirho {
        localeChirho == .spanishChirho ? spanishChirho : englishChirho
    }

    /// The pronunciation profile and review state of one recording, as the listener should know them.
    public func voiceChirho(_ clipChirho: ClipChirho) -> String {
        if clipChirho.readingSourceChirho != nil { return clipChirho.voiceNameChirho }
        let profileChirho = switch clipChirho.pronunciationChirho {
        case "israeli_hebrew": hebrewVoiceChirho
        case "modern_greek_aspirates": greekAspiratesVoiceChirho
        case "erasmian_greek": erasmianVoiceChirho
        default: greekVoiceChirho
        }
        return profileChirho + ". " + (clipChirho.isApprovedChirho ? audioApprovedChirho : audioAuditionChirho)
    }

    public func renditionChirho(_ renditionChirho: GreekRenditionChirho) -> String {
        switch renditionChirho {
        case .modernAspiratesChirho: renditionAspiratesChirho
        case .modernChirho: renditionModernChirho
        case .erasmianChirho: renditionErasmianChirho
        }
    }

    /// Fills a {name} placeholder; an unknown placeholder stays visible rather than guessed.
    public static func fillChirho(_ templateChirho: String, _ valuesChirho: [String: String]) -> String {
        valuesChirho.reduce(templateChirho) { textChirho, pairChirho in
            textChirho.replacingOccurrences(of: "{\(pairChirho.key)}", with: pairChirho.value)
        }
    }

    public static let englishChirho = MessagesChirho(
        taglineChirho: "See. Notice. Read.",
        hebrewBadgeChirho: "Biblical Hebrew",
        greekBadgeChirho: "Biblical Greek",
        spanishOrderNoteChirho: "Spanish word glosses approved in the Global Bible Tools export, in source order. Not a sentence translation.",
        choosePassageChirho: "Choose a passage",
        bookChirho: "Book",
        chapterChirho: "Chapter",
        verseChirho: "Verse",
        languageChirho: "Language",
        settingsChirho: "Settings",
        speedChirho: "Playback speed",
        studyAidsChirho: "About meanings & study aids",
        studyAidsHelpChirho: "Word meanings and grammar come from the credited editions. Pictures illustrate a possible sense, not an etymological root. Artwork and synthesized recordings are AI-assisted study aids that may contain errors and are still being reviewed. Human Hebrew readings are by Rabbi Dan Be’eri under CC BY-SA 3.0; the exact recording credit and license are in each verse’s Sources. About explains coverage, sources and corrections.",
        oldTestamentChirho: "Old Testament · Hebrew",
        newTestamentChirho: "New Testament · Greek",
        doneChirho: "Done",
        previousVerseChirho: "Previous verse",
        nextVerseChirho: "Next verse",
        loadingChirho: "Loading {reference_chirho}…",
        retryChirho: "Try again",
        verseErrorChirho: "This verse could not be loaded or verified.",
        connectionHintChirho: "Check your connection, then try again.",
        readRightToLeftChirho: "Read from right to left. Take your time.",
        readLeftToRightChirho: "Read from left to right. Take your time.",
        showTranslationChirho: "Show translation",
        appGlossNoteChirho: "App-authored English learning gloss.",
        gbtOrderNoteChirho: "Word glosses in Hebrew order, approved in the Global Bible Tools export. Not a sentence translation.",
        bereanOrderNoteChirho: "Berean Interlinear word glosses in Greek order. Not a sentence translation.",
        lookCloserChirho: "Look closer",
        meaningChirho: "Meaning",
        morphologyChirho: "Morphology",
        glossApprovedChirho: "Approved in the Global Bible Tools export",
        glossAppChirho: "App-authored learning gloss",
        glossUnavailableChirho: "A reviewed word meaning is not available yet.",
        glossBereanChirho: "Berean Interlinear Bible gloss, via biblicalhumanities.org",
        notSeparatelyTranslatedChirho: "Not separately translated",
        spanishGlossApprovedChirho: "Spanish gloss approved in the Global Bible Tools export",
        spanishGlossMissingChirho: "No approved Spanish gloss for this word in the pinned export.",
        spanishLayerUnavailableChirho: "Spanish glosses are not available for this chapter.",
        spanishLayerStaleChirho: "Spanish glosses are withheld for this chapter: its text changed after they were prepared.",
        lexicalFormChirho: "Lexical form",
        lemmaChirho: "Lemma",
        rootChirho: "Root",
        rootTraditionalChirho: "Traditional lexical relationship, not a claim of certain historical origin.",
        rootUnresolvedChirho: "Unresolved",
        rootNotApplicableChirho: "Not applicable",
        sourceMorphologyChirho: "Source morphology",
        sourceNoteChirho: "Source note",
        qereChirho: "Reading (qere)",
        qereNoteChirho: "The reading is kept separately from the written text (ketiv).",
        aramaicNoteChirho: "This word is marked as Aramaic in the source.",
        formPatternChirho: "Form pattern",
        marksChirho: "The marks on this word",
        wordPictureChirho: "Word picture",
        contextualPictureChirho: "Picture for this verse: {meaning_chirho}",
        generalPictureChirho: "General word picture: {meaning_chirho}",
        generalPictureCaveatChirho: "This verse's meaning may call for a different picture.",
        otherMeaningsChirho: "Other reviewed meanings",
        artPendingChirho: "AI-generated artwork, awaiting review.",
        artApprovedChirho: "Artwork reviewed.",
        pictureUnavailableChirho: "No picture for this word yet.",
        sceneAwaitingChirho: "An illustration is being prepared for this passage.",
        sceneUnavailableChirho: "The illustration is unavailable right now.",
        sceneCaptionChirho: "An imaginative learning aid: a visual reflection on the verse.",
        playWordChirho: "Play {word_chirho}",
        playVerseChirho: "Listen to the verse",
        stopChirho: "Stop",
        audioAuditionChirho: "AI voice recording, pronunciation awaiting review.",
        audioApprovedChirho: "Recording reviewed.",
        audioUnavailableChirho: "No recording for this word yet.",
        audioFailedChirho: "The recording could not be played.",
        aramaicAudioChirho: "Aramaic words are not read with a Hebrew voice.",
        hebrewVoiceChirho: "Israeli Hebrew pronunciation",
        greekVoiceChirho: "Modern Greek pronunciation, not a reconstruction of Koine",
        greekAspiratesVoiceChirho: "Modern Greek with historical aspirates",
        erasmianVoiceChirho: "Erasmian pronunciation, a teaching convention, not a reconstruction",
        pronunciationChirho: "Pronunciation",
        renditionAspiratesChirho: "Modern with aspirates",
        renditionModernChirho: "Modern",
        renditionErasmianChirho: "Erasmian",
        renditionMissingChirho: "No recording of this word in the chosen pronunciation yet.",
        readingKeyChirho: "Reading key",
        readingKeyHintChirho: "Small marks, useful clues. The colours, numbers and letters are Hinneh teaching conventions.",
        grammarCreditChirho: "Grammar explanations adapt unfoldingWord Hebrew Grammar, © 2021 unfoldingWord, under {license_chirho}. They are condensed and reworded; the adapted explanations are shared under the same license. The numeric and letter codes, colors and layout are Hinneh’s teaching conventions. No endorsement is implied.",
        grammarReferenceChirho: "Grammar reference",
        sourcesChirho: "Sources and licenses",
        revisionChirho: "Revision {revision_chirho}",
        exactTextChirho: "Exact source text",
        exactTextNoteChirho: "The preserved source text, without teaching marks. Select it to copy.",
        kjvNumberingChirho: "Hebrew verse numbering · English Bibles: {reference_chirho}",
        genderChirho: "gender",
        numberChirho: "number",
        stateChirho: "state",
        notApplicableChirho: "not applicable",
        localVerbCodeChirho: "local verb code",
        privacyChirho: "No accounts · No tracking",
        privacyPolicyChirho: "Privacy policy",
        aboutSupportChirho: "About and support",
        sourceCodeChirho: "Source code",
        opensBrowserChirho: "Opens in your browser.",
        closingNoteChirho: "A small beginning in the language of Scripture."
    )

    public static let spanishChirho = MessagesChirho(
        taglineChirho: "Mira. Observa. Lee.",
        hebrewBadgeChirho: "Hebreo bíblico",
        greekBadgeChirho: "Griego bíblico",
        spanishOrderNoteChirho: "Glosas en español por palabra, aprobadas en la exportación de Global Bible Tools, en el orden de la fuente. No es una traducción de la oración.",
        choosePassageChirho: "Elegir un pasaje",
        bookChirho: "Libro",
        chapterChirho: "Capítulo",
        verseChirho: "Versículo",
        languageChirho: "Idioma",
        settingsChirho: "Ajustes",
        speedChirho: "Velocidad de reproducción",
        studyAidsChirho: "Significados y ayudas de estudio",
        studyAidsHelpChirho: "Los significados y la gramática proceden de las ediciones acreditadas. Las imágenes ilustran un sentido posible, no una raíz etimológica. Las ilustraciones y grabaciones sintetizadas son ayudas con IA que pueden contener errores y siguen en revisión. Las lecturas hebreas humanas son del rabino Dan Be’eri bajo CC BY-SA 3.0; el crédito exacto y la licencia están en las Fuentes de cada versículo. Acerca de explica la cobertura, las fuentes y las correcciones.",
        oldTestamentChirho: "Antiguo Testamento · Hebreo",
        newTestamentChirho: "Nuevo Testamento · Griego",
        doneChirho: "Listo",
        previousVerseChirho: "Versículo anterior",
        nextVerseChirho: "Versículo siguiente",
        loadingChirho: "Cargando {reference_chirho}…",
        retryChirho: "Reintentar",
        verseErrorChirho: "No se pudo cargar ni verificar este versículo.",
        connectionHintChirho: "Revise su conexión e inténtelo de nuevo.",
        readRightToLeftChirho: "Lea de derecha a izquierda. Tómese su tiempo.",
        readLeftToRightChirho: "Lea de izquierda a derecha. Tómese su tiempo.",
        showTranslationChirho: "Mostrar traducción",
        appGlossNoteChirho: "Glosa de aprendizaje en inglés escrita por la aplicación.",
        gbtOrderNoteChirho: "Glosas por palabra en el orden del hebreo, aprobadas en la exportación de Global Bible Tools. No es una traducción de la oración.",
        bereanOrderNoteChirho: "Glosas por palabra de la Berean Interlinear en el orden del griego. No es una traducción de la oración.",
        lookCloserChirho: "Mire más de cerca",
        meaningChirho: "Significado",
        morphologyChirho: "Morfología",
        glossApprovedChirho: "Aprobado en la exportación de Global Bible Tools",
        glossAppChirho: "Glosa de aprendizaje escrita por la aplicación",
        glossUnavailableChirho: "Todavía no hay un significado revisado para esta palabra.",
        glossBereanChirho: "Glosa en inglés de la Berean Interlinear Bible, mediante biblicalhumanities.org",
        notSeparatelyTranslatedChirho: "No se traduce por separado",
        spanishGlossApprovedChirho: "Glosa en español aprobada en la exportación de Global Bible Tools",
        spanishGlossMissingChirho: "No hay una glosa en español aprobada para esta palabra en la exportación fijada.",
        spanishLayerUnavailableChirho: "Las glosas en español no están disponibles para este capítulo.",
        spanishLayerStaleChirho: "Las glosas en español se retienen en este capítulo: su texto cambió después de prepararlas.",
        lexicalFormChirho: "Forma léxica",
        lemmaChirho: "Lema",
        rootChirho: "Raíz",
        rootTraditionalChirho: "Relación léxica tradicional; no afirma un origen histórico seguro.",
        rootUnresolvedChirho: "Sin resolver",
        rootNotApplicableChirho: "No aplica",
        sourceMorphologyChirho: "Morfología de la fuente",
        sourceNoteChirho: "Nota de la fuente",
        qereChirho: "Lectura (qere)",
        qereNoteChirho: "La lectura se conserva aparte del texto escrito (ketiv).",
        aramaicNoteChirho: "La fuente marca esta palabra como aramea.",
        formPatternChirho: "Patrón de forma",
        marksChirho: "Las marcas de esta palabra",
        wordPictureChirho: "Imagen de la palabra",
        contextualPictureChirho: "Imagen para este versículo: {meaning_chirho}",
        generalPictureChirho: "Imagen general de la palabra: {meaning_chirho}",
        generalPictureCaveatChirho: "El significado en este versículo puede pedir otra imagen.",
        otherMeaningsChirho: "Otros significados revisados",
        artPendingChirho: "Ilustración generada por IA, pendiente de revisión.",
        artApprovedChirho: "Ilustración revisada.",
        pictureUnavailableChirho: "Todavía no hay imagen para esta palabra.",
        sceneAwaitingChirho: "Se está preparando una ilustración para este pasaje.",
        sceneUnavailableChirho: "La ilustración no está disponible en este momento.",
        sceneCaptionChirho: "Una ayuda imaginativa para aprender: una reflexión visual sobre el versículo.",
        playWordChirho: "Reproducir {word_chirho}",
        playVerseChirho: "Escuchar el versículo",
        stopChirho: "Detener",
        audioAuditionChirho: "Grabación con voz de IA; la pronunciación está pendiente de revisión.",
        audioApprovedChirho: "Grabación revisada.",
        audioUnavailableChirho: "Todavía no hay grabación para esta palabra.",
        audioFailedChirho: "No se pudo reproducir la grabación.",
        aramaicAudioChirho: "Las palabras arameas no se leen con una voz hebrea.",
        hebrewVoiceChirho: "Pronunciación del hebreo israelí",
        greekVoiceChirho: "Pronunciación del griego moderno; no es una reconstrucción del koiné",
        greekAspiratesVoiceChirho: "Griego moderno con aspiradas históricas",
        erasmianVoiceChirho: "Pronunciación erasmiana, una convención didáctica; no es una reconstrucción",
        pronunciationChirho: "Pronunciación",
        renditionAspiratesChirho: "Moderna con aspiradas",
        renditionModernChirho: "Moderna",
        renditionErasmianChirho: "Erasmiana",
        renditionMissingChirho: "Todavía no hay grabación de esta palabra en la pronunciación elegida.",
        readingKeyChirho: "Clave de lectura",
        readingKeyHintChirho: "Marcas pequeñas, pistas útiles. Los colores, números y letras son convenciones didácticas de Hinneh.",
        grammarCreditChirho: "Las explicaciones gramaticales adaptan la unfoldingWord Hebrew Grammar, © 2021 unfoldingWord, bajo {license_chirho}. Están resumidas y redactadas de nuevo; las explicaciones adaptadas se comparten bajo la misma licencia. Los códigos numéricos y de letras, los colores y la disposición son convenciones didácticas de Hinneh. No se implica ningún respaldo.",
        grammarReferenceChirho: "Referencia gramatical (en inglés)",
        sourcesChirho: "Fuentes y licencias",
        revisionChirho: "Revisión {revision_chirho}",
        exactTextChirho: "Texto fuente exacto",
        exactTextNoteChirho: "El texto fuente preservado, sin marcas didácticas. Selecciónelo para copiarlo.",
        kjvNumberingChirho: "Numeración hebrea del versículo · Biblias en inglés: {reference_chirho}",
        genderChirho: "género",
        numberChirho: "número",
        stateChirho: "estado",
        notApplicableChirho: "no aplica",
        localVerbCodeChirho: "código verbal local",
        privacyChirho: "Sin cuentas · Sin rastreo",
        privacyPolicyChirho: "Política de privacidad",
        aboutSupportChirho: "Acerca de y soporte",
        sourceCodeChirho: "Código fuente",
        opensBrowserChirho: "Se abre en el navegador.",
        closingNoteChirho: "Un pequeño comienzo en el idioma de las Escrituras."
    )
}
