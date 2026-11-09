// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import HinnehCoreChirho
import SwiftUI

/// One brief welcome; the fuller explanation and credits remain available from Settings → Info.
struct InfoViewChirho: View {
    let modelChirho: ReaderModelChirho
    var welcomeChirho = false
    @State private var detailsChirho = false
    @Environment(\.dismiss) private var dismissChirho

    private var messagesChirho: MessagesChirho { modelChirho.messagesChirho }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text("Hinneh")
                        .font(.largeTitle.bold())
                        .foregroundStyle(PaletteChirho.inkChirho)
                        .accessibilityAddTraits(.isHeader)
                    Text(messagesChirho.welcomeIntroChirho).font(.title3)
                    Text(messagesChirho.welcomeUseChirho)
                    Text(messagesChirho.openMaterialsChirho)
                        .font(.footnote)
                        .foregroundStyle(PaletteChirho.quietChirho)
                    if welcomeChirho {
                        Button(messagesChirho.startReadingChirho) { closeChirho() }
                            .buttonStyle(.borderedProminent)
                            .controlSize(.large)
                            .frame(maxWidth: .infinity)
                    }
                    if let tourLinkChirho = PolicyLinksViewChirho.pageLinkChirho("tutorial-chirho", modelChirho.localeChirho) {
                        VStack(alignment: .leading, spacing: 8) {
                            Link(destination: tourLinkChirho) {
                                Label(messagesChirho.watchTourChirho, systemImage: "play.rectangle")
                            }
                            .buttonStyle(.bordered)
                            .accessibilityHint(messagesChirho.opensBrowserChirho)
                            Text(messagesChirho.reopenTourChirho)
                                .font(.footnote)
                                .foregroundStyle(PaletteChirho.quietChirho)
                        }
                    }
                    if welcomeChirho && !detailsChirho {
                        Button { detailsChirho = true } label: {
                            Label(messagesChirho.infoChirho, systemImage: "info.circle")
                        }
                    } else {
                        detailsContentChirho
                    }
                }
                .frame(maxWidth: 620, alignment: .leading)
                .padding(24)
                .frame(maxWidth: .infinity)
            }
            .background(PaletteChirho.paperChirho)
            .navigationTitle(welcomeChirho ? messagesChirho.welcomeChirho : messagesChirho.infoChirho)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                if !welcomeChirho {
                    ToolbarItem(placement: .confirmationAction) {
                        Button(messagesChirho.doneChirho) { closeChirho() }
                    }
                }
            }
        }
        .environment(\.locale, Locale(identifier: modelChirho.localeChirho.rawValue))
    }

    private var detailsContentChirho: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(messagesChirho.studyAidsChirho).font(.headline).accessibilityAddTraits(.isHeader)
            Text(messagesChirho.studyAidsHelpChirho)
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
