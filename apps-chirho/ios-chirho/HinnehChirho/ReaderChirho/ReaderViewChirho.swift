// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import HinnehCoreChirho
import SwiftUI

/// The reading screen: one verse at a time, original text first, everything else beside it.
struct ReaderViewChirho: View {
    @Bindable var modelChirho: ReaderModelChirho
    @State private var selectedWordChirho: WordDisplayChirho?
    @State private var choosingChirho = false
    @State private var showingKeyChirho = false

    private var messagesChirho: MessagesChirho { modelChirho.messagesChirho }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    headerChirho
                    switch modelChirho.phaseChirho {
                    case .loadingChirho: loadingChirho
                    case .failedChirho: failureChirho
                    case .readyChirho:
                        if let verseChirho = modelChirho.verseChirho { readingChirho(verseChirho) }
                    }
                    footerChirho
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .frame(maxWidth: 820)
                .frame(maxWidth: .infinity)
            }
            .background(PaletteChirho.paperChirho)
            .refreshable { modelChirho.retryChirho() }
            .toolbar { toolbarChirho }
            .navigationBarTitleDisplayMode(.inline)
            .sheet(item: $selectedWordChirho) { wordChirho in
                WordDetailViewChirho(wordChirho: wordChirho,
                                     scriptChirho: modelChirho.verseChirho?.scriptChirho ?? .hebrewChirho,
                                     modelChirho: modelChirho)
            }
            .sheet(isPresented: $choosingChirho) { PassagePickerViewChirho(modelChirho: modelChirho) }
            .sheet(isPresented: $showingKeyChirho) {
                ReadingKeyViewChirho(scriptChirho: modelChirho.bookChirho?.scriptChirho ?? .hebrewChirho,
                                     modelChirho: modelChirho)
            }
        }
        .environment(\.locale, Locale(identifier: modelChirho.localeChirho.rawValue))
    }

    @ToolbarContentBuilder private var toolbarChirho: some ToolbarContent {
        ToolbarItem(placement: .principal) {
            Button { choosingChirho = true } label: {
                HStack(spacing: 4) {
                    Text(modelChirho.referenceChirho).font(.headline)
                    Image(systemName: "chevron.down").font(.caption.weight(.bold)).accessibilityHidden(true)
                }
            }
            .accessibilityLabel(Text("\(messagesChirho.choosePassageChirho), \(modelChirho.referenceChirho)"))
        }
        ToolbarItem(placement: .topBarLeading) {
            Button { showingKeyChirho = true } label: {
                Label(messagesChirho.readingKeyChirho, systemImage: "character.book.closed")
            }
        }
        ToolbarItem(placement: .topBarTrailing) {
            Menu {
                Picker(messagesChirho.languageChirho, selection: $modelChirho.localeChirho) {
                    ForEach(LocaleChirho.allCases) { localeChirho in
                        Text(localeChirho.nativeNameChirho).tag(localeChirho)
                    }
                }
            } label: {
                Label(messagesChirho.languageChirho, systemImage: "globe")
            }
        }
    }

    private var headerChirho: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Hinneh · " + messagesChirho.taglineChirho)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(PaletteChirho.quietChirho)
            Text(modelChirho.referenceChirho)
                .font(.largeTitle.bold())
                .foregroundStyle(PaletteChirho.inkChirho)
                .accessibilityAddTraits(.isHeader)
            if let bookChirho = modelChirho.bookChirho {
                Text(bookChirho.scriptChirho == .hebrewChirho ? messagesChirho.hebrewBadgeChirho
                     : messagesChirho.greekBadgeChirho)
                    .font(.footnote.weight(.medium))
                    .foregroundStyle(PaletteChirho.quietChirho)
            }
            if let kjvChirho = modelChirho.verseChirho?.kjvVerseIdChirho, kjvChirho != modelChirho.verseChirho?.idChirho,
               let passageChirho = PassageChirho.parseChirho(kjvChirho, modelChirho.booksChirho) {
                Text(MessagesChirho.fillChirho(messagesChirho.kjvNumberingChirho, [
                    "reference_chirho": passageChirho.localizedReferenceChirho(modelChirho.booksChirho, .englishChirho)
                ]))
                .font(.footnote)
                .foregroundStyle(.secondary)
            }
        }
    }

    private var loadingChirho: some View {
        HStack(spacing: 10) {
            ProgressView()
            Text(MessagesChirho.fillChirho(messagesChirho.loadingChirho, ["reference_chirho": modelChirho.referenceChirho]))
        }
        .frame(maxWidth: .infinity, minHeight: 240)
        .accessibilityElement(children: .combine)
    }

    private var failureChirho: some View {
        VStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle").font(.largeTitle).foregroundStyle(.orange)
                .accessibilityHidden(true)
            Text(messagesChirho.verseErrorChirho).font(.headline).multilineTextAlignment(.center)
            Text(messagesChirho.connectionHintChirho).font(.callout).foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button(messagesChirho.retryChirho) { modelChirho.retryChirho() }
                .buttonStyle(.borderedProminent)
            navigationRowChirho
        }
        .frame(maxWidth: .infinity, minHeight: 240)
    }

    private func readingChirho(_ verseChirho: VerseDisplayChirho) -> some View {
        VStack(alignment: .leading, spacing: 20) {
            SceneViewChirho(sceneChirho: modelChirho.mediaChirho.sceneChirho, modelChirho: modelChirho)
            VStack(alignment: .leading, spacing: 12) {
                verseAudioChirho(verseChirho)
                VerseViewChirho(verseChirho: verseChirho, modelChirho: modelChirho) { selectedWordChirho = $0 }
            }
            .padding(14)
            .background(PaletteChirho.cardChirho, in: RoundedRectangle(cornerRadius: 14))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(PaletteChirho.ruleChirho))
            translationChirho(verseChirho)
            navigationRowChirho
            SourcesViewChirho(verseChirho: verseChirho, modelChirho: modelChirho)
        }
    }

    @ViewBuilder private func verseAudioChirho(_ verseChirho: VerseDisplayChirho) -> some View {
        if verseChirho.scriptChirho == .greekChirho {
            Picker(messagesChirho.pronunciationChirho, selection: $modelChirho.greekRenditionChirho) {
                ForEach(GreekRenditionChirho.allCases) { renditionChirho in
                    Text(messagesChirho.renditionChirho(renditionChirho)).tag(renditionChirho)
                }
            }
            .pickerStyle(.menu)
            .tint(PaletteChirho.quietChirho)
        }
        if let clipChirho = modelChirho.audioChirho.verseClipChirho {
            let activeChirho = modelChirho.playerChirho.activeIdChirho == "verse"
            VStack(alignment: .leading, spacing: 4) {
                Button { modelChirho.playerChirho.toggleChirho(clipChirho, idChirho: "verse") } label: {
                    Label(activeChirho ? messagesChirho.stopChirho : messagesChirho.playVerseChirho,
                          systemImage: activeChirho ? "stop.fill" : "play.fill")
                }
                .buttonStyle(.bordered)
                Text(messagesChirho.voiceChirho(clipChirho)).font(.caption).foregroundStyle(.secondary)
                if modelChirho.playerChirho.failedIdChirho == "verse" {
                    Text(messagesChirho.audioFailedChirho).font(.caption).foregroundStyle(.red)
                }
            }
        } else if verseChirho.hasAramaicChirho {
            Text(messagesChirho.aramaicAudioChirho).font(.caption).foregroundStyle(.secondary)
        }
    }

    private func translationChirho(_ verseChirho: VerseDisplayChirho) -> some View {
        DisclosureGroup(messagesChirho.showTranslationChirho) {
            VStack(alignment: .leading, spacing: 10) {
                if modelChirho.localeChirho == .spanishChirho,
                   case .readyChirho(let glossesChirho, _) = modelChirho.spanishChirho {
                    Text(TaggedTextChirho.textChirho(verseChirho.wordsChirho.map {
                        (glossesChirho[$0.idChirho] ?? nil) ?? "…"
                    }.joined(separator: " · "), "es"))
                    Text(messagesChirho.spanishOrderNoteChirho).font(.caption).foregroundStyle(.secondary)
                }
                Text(TaggedTextChirho.textChirho(verseChirho.translationChirho
                     ?? verseChirho.wordsChirho.map { $0.glossChirho ?? "…" }.joined(separator: " · "), "en"))
                Text(verseChirho.translationChirho != nil ? messagesChirho.appGlossNoteChirho
                     : verseChirho.scriptChirho == .greekChirho ? messagesChirho.bereanOrderNoteChirho
                     : messagesChirho.gbtOrderNoteChirho)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(.top, 6)
        }
        .tint(PaletteChirho.quietChirho)
    }

    private var navigationRowChirho: some View {
        HStack {
            Button { Task { await modelChirho.stepChirho(.previousChirho) } } label: {
                Label(messagesChirho.previousVerseChirho, systemImage: "chevron.backward")
            }
            Spacer()
            Button { Task { await modelChirho.stepChirho(.nextChirho) } } label: {
                Label(messagesChirho.nextVerseChirho, systemImage: "chevron.forward")
                    .labelStyle(TrailingIconLabelStyleChirho())
            }
        }
        .buttonStyle(.bordered)
    }

    private var footerChirho: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(messagesChirho.closingNoteChirho)
            Text(messagesChirho.privacyChirho)
        }
        .font(.footnote)
        .foregroundStyle(PaletteChirho.quietChirho)
        .padding(.top, 12)
    }
}

/// The verse scene when one exists, else a quiet placeholder; the text never waits for it.
struct SceneViewChirho: View {
    let sceneChirho: SceneRecordChirho?
    let modelChirho: ReaderModelChirho

    var body: some View {
        if let sceneChirho {
            VStack(alignment: .leading, spacing: 6) {
                VerifiedImageChirho(pathChirho: sceneChirho.assetPathChirho, sha256Chirho: sceneChirho.sha256Chirho,
                                    altChirho: sceneChirho.altChirho, storeChirho: modelChirho.artworkChirho) { failedChirho in
                    placeholderChirho(failedChirho ? modelChirho.messagesChirho.sceneUnavailableChirho
                                      : modelChirho.messagesChirho.sceneAwaitingChirho)
                }
                .aspectRatio(CGFloat(sceneChirho.widthChirho) / CGFloat(max(1, sceneChirho.heightChirho)),
                             contentMode: .fit)
                .clipShape(RoundedRectangle(cornerRadius: 14))
                Text(modelChirho.messagesChirho.sceneCaptionChirho + " "
                     + (sceneChirho.artReviewChirho == "approved" ? modelChirho.messagesChirho.artApprovedChirho
                        : modelChirho.messagesChirho.artPendingChirho))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private func placeholderChirho(_ textChirho: String) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: 14).fill(PaletteChirho.cardChirho)
            Text(textChirho).font(.callout).foregroundStyle(.secondary).padding()
        }
    }
}

struct TrailingIconLabelStyleChirho: LabelStyle {
    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 6) {
            configuration.title
            configuration.icon
        }
    }
}
