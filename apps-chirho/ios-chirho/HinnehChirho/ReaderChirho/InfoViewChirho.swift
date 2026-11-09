// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import HinnehCoreChirho
import SwiftUI

/// One brief welcome; the fuller explanation and credits remain available from Settings → Info.
struct InfoViewChirho: View {
    let modelChirho: ReaderModelChirho
    var welcomeChirho = false
    @State private var detailsChirho = false
    @Environment(\.dismiss) private var dismissChirho
    @Environment(\.dynamicTypeSize) private var typeSizeChirho

    private var messagesChirho: MessagesChirho { modelChirho.messagesChirho }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    if welcomeChirho {
                        welcomeContentChirho
                    } else {
                        Text("Hinneh")
                            .font(.largeTitle.bold())
                            .foregroundStyle(PaletteChirho.inkChirho)
                            .accessibilityAddTraits(.isHeader)
                        Text(messagesChirho.welcomeIntroChirho).font(.title3)
                        Text(messagesChirho.welcomeUseChirho)
                        Text(messagesChirho.welcomeFutureChirho).foregroundStyle(PaletteChirho.quietChirho)
                        tourChirho
                    }
                    if !welcomeChirho {
                        detailsContentChirho
                    }
                }
                .frame(maxWidth: 620, alignment: .leading)
                .padding(24)
                .frame(maxWidth: .infinity)
            }
            .safeAreaInset(edge: .bottom) {
                if welcomeChirho { welcomeActionsChirho }
            }
            .background(PaletteChirho.paperChirho)
            .navigationTitle(welcomeChirho ? "" : messagesChirho.infoChirho)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                if !welcomeChirho {
                    ToolbarItem(placement: .confirmationAction) {
                        Button(messagesChirho.doneChirho) { closeChirho() }
                    }
                }
            }
            .sheet(isPresented: $detailsChirho) { InfoViewChirho(modelChirho: modelChirho) }
        }
        .environment(\.locale, Locale(identifier: modelChirho.localeChirho.rawValue))
    }

    private var welcomeContentChirho: some View {
        VStack(alignment: .leading, spacing: 12) {
            Image("WelcomeHeroChirho")
                .resizable()
                .scaledToFill()
                .frame(height: 170)
                .clipped()
                .clipShape(RoundedRectangle(cornerRadius: 20))
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 8) {
                Text("HINNEH").font(.caption.weight(.bold)).tracking(2.4)
                    .foregroundStyle(PaletteChirho.quietChirho)
                Text(messagesChirho.welcomeHeadlineChirho)
                    .font(.system(.largeTitle, design: .serif, weight: .semibold))
                    .foregroundStyle(PaletteChirho.inkChirho)
                    .accessibilityAddTraits(.isHeader)
                Text(messagesChirho.welcomeIntroChirho).fixedSize(horizontal: false, vertical: true)
            }
            if let verseChirho = modelChirho.verseChirho {
                VStack(alignment: .leading, spacing: 8) {
                    Text(messagesChirho.readerPreviewChirho + " · " + modelChirho.referenceChirho)
                        .font(.caption.weight(.medium))
                        .foregroundStyle(PaletteChirho.quietChirho)
                    FlowLayoutChirho {
                        ForEach(Array(verseChirho.wordsChirho.prefix(3))) { wordChirho in
                            previewWordChirho(wordChirho, verseChirho.scriptChirho)
                        }
                    }
                    .environment(\.layoutDirection, verseChirho.scriptChirho == .hebrewChirho ? .rightToLeft : .leftToRight)
                }
                .padding(14)
                .background(PaletteChirho.cardChirho, in: RoundedRectangle(cornerRadius: 16))
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(PaletteChirho.ruleChirho))
            }
            VStack(alignment: .leading, spacing: 8) {
                Text(messagesChirho.welcomeFutureChirho)
                Text(messagesChirho.reopenTourChirho)
            }
            .font(.footnote)
            .foregroundStyle(PaletteChirho.quietChirho)
            if typeSizeChirho.isAccessibilitySize {
                welcomeSecondaryChirho
                Text(messagesChirho.openMaterialsChirho)
                    .font(.footnote)
                    .foregroundStyle(PaletteChirho.quietChirho)
            }
        }
    }

    private var welcomeActionsChirho: some View {
        VStack(spacing: 6) {
            Button(action: closeChirho) {
                Text(messagesChirho.startReadingChirho)
                    .font(.headline)
                    .frame(maxWidth: .infinity, minHeight: 48)
            }
            .buttonStyle(.borderedProminent)
            .tint(PaletteChirho.nounChirho)
            if !typeSizeChirho.isAccessibilitySize {
                welcomeSecondaryChirho
                Text(messagesChirho.openMaterialsChirho)
                    .font(.caption2)
                    .foregroundStyle(PaletteChirho.quietChirho)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(.horizontal, 24)
        .padding(.top, 12)
        .padding(.bottom, 8)
        .frame(maxWidth: 668)
        .frame(maxWidth: .infinity)
        .background(PaletteChirho.paperChirho)
    }

    private var welcomeSecondaryChirho: some View {
        let layoutChirho = typeSizeChirho.isAccessibilitySize
            ? AnyLayout(VStackLayout(alignment: .leading, spacing: 8))
            : AnyLayout(HStackLayout(spacing: 12))
        return layoutChirho {
            tourChirho.frame(maxWidth: .infinity, alignment: typeSizeChirho.isAccessibilitySize ? .leading : .center)
            Button { detailsChirho = true } label: {
                Label {
                    Text(messagesChirho.infoChirho).fixedSize(horizontal: false, vertical: true)
                } icon: { Image(systemName: "info.circle").accessibilityHidden(true) }
                .frame(maxWidth: .infinity, minHeight: 44, alignment: typeSizeChirho.isAccessibilitySize ? .leading : .center)
            }
            .font(.subheadline)
        }
        .multilineTextAlignment(typeSizeChirho.isAccessibilitySize ? .leading : .center)
        .tint(PaletteChirho.quietChirho)
    }

    /// Read-only words from the verified passage, without speaker, image fetch or button traits.
    private func previewWordChirho(_ wordChirho: WordDisplayChirho, _ scriptChirho: ScriptChirho) -> some View {
        VStack(spacing: 5) {
            Text(TaggedTextChirho.sourceChirho(wordChirho.surfaceChirho, scriptChirho))
                .font(.title2)
                .foregroundStyle(PaletteChirho.inkChirho)
                .padding(.horizontal, 8)
                .padding(.vertical, 5)
                .background(PaletteChirho.shadeChirho(wordChirho.cuesChirho.shadeChirho), in: RoundedRectangle(cornerRadius: 6))
                .overlay(alignment: .bottom) {
                    Rectangle().fill(PaletteChirho.underlineChirho(wordChirho.cuesChirho.underlineChirho)).frame(height: 3)
                }
            if modelChirho.localeChirho == .spanishChirho,
               case .readyChirho(let glossesChirho, _) = modelChirho.spanishChirho,
               let glossChirho = glossesChirho[wordChirho.idChirho] ?? nil {
                Text(TaggedTextChirho.textChirho(glossChirho, "es")).font(.caption)
            } else if modelChirho.localeChirho == .englishChirho, let glossChirho = wordChirho.glossChirho {
                Text(TaggedTextChirho.textChirho(glossChirho, "en")).font(.caption)
            }
        }
        .foregroundStyle(PaletteChirho.quietChirho)
        .environment(\.layoutDirection, .leftToRight)
        .accessibilityElement(children: .combine)
    }

    @ViewBuilder private var tourChirho: some View {
        if let tourLinkChirho = PolicyLinksViewChirho.pageLinkChirho("tutorial-chirho", modelChirho.localeChirho) {
            Link(destination: tourLinkChirho) {
                Label {
                    Text(messagesChirho.watchTourChirho).fixedSize(horizontal: false, vertical: true)
                } icon: { Image(systemName: "play.rectangle").accessibilityHidden(true) }
                    .frame(minHeight: 44)
            }
            .font(.subheadline)
            .accessibilityHint(messagesChirho.opensBrowserChirho)
        }
    }

    private var detailsContentChirho: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(messagesChirho.studyAidsChirho).font(.headline).accessibilityAddTraits(.isHeader)
            Text(messagesChirho.studyAidsHelpChirho)
            Text(messagesChirho.ipaGuideChirho)
            Text(messagesChirho.licenseOverviewChirho).font(.headline).accessibilityAddTraits(.isHeader)
            Text(messagesChirho.codeLicenseChirho)
            Text(messagesChirho.artLicenseChirho)
            Text(messagesChirho.recordingLicenseChirho)
            ReadingCreditViewChirho(attributionChirho: HumanReadingSourceChirho.beeriAttributionChirho,
                                    licenseChirho: "CC BY-SA 3.0",
                                    licenseUrlChirho: HumanReadingSourceChirho.beeriLicenseUrlChirho,
                                    localeChirho: modelChirho.localeChirho)
            Text(messagesChirho.upstreamLicenseChirho)
            PolicyLinksViewChirho(messagesChirho: messagesChirho, localeChirho: modelChirho.localeChirho)
        }
        .font(.callout)
    }

    private func closeChirho() {
        if welcomeChirho { modelChirho.sessionChirho.finishWelcomeChirho() }
        dismissChirho()
    }
}
