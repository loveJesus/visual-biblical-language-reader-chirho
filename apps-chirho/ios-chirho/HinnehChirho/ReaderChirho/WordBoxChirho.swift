// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import HinnehCoreChirho
import SwiftUI

/// One source word with its compact marks, picture and pronunciation control. The word text is
/// exactly the source; marks sit around it, never inside it.
struct WordBoxChirho: View {
    let wordChirho: WordDisplayChirho
    let scriptChirho: ScriptChirho
    let pictureChirho: WordPictureChirho?
    let clipChirho: ClipChirho?
    let modelChirho: ReaderModelChirho
    let openChirho: () -> Void

    @ScaledMetric(relativeTo: .title) private var wordSizeChirho: CGFloat = 30
    @ScaledMetric(relativeTo: .body) private var pictureSizeChirho: CGFloat = 38

    private var messagesChirho: MessagesChirho { modelChirho.messagesChirho }
    private var cuesChirho: CueSetChirho { wordChirho.cuesChirho }

    var body: some View {
        VStack(spacing: 3) {
            cueRowChirho
            wordTextChirho
                .overlay(alignment: .topTrailing) { speakerChirho }
            pictureFrameChirho
        }
        .padding(.trailing, clipChirho == nil ? 0 : Self.speakerRadiusChirho)
        .padding(.vertical, 4)
        // Corners are physical, like the cues; the Hebrew text keeps its own direction.
        .environment(\.layoutDirection, .leftToRight)
        .contentShape(Rectangle())
        .onTapGesture(perform: openChirho)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(accessibleWordChirho) + Text(", " + MorphologyChirho.summaryChirho(
            wordChirho, modelChirho.localeChirho)))
        .accessibilityHint(Text(messagesChirho.lookCloserChirho))
        .accessibilityAddTraits(.isButton)
        .accessibilityAction { openChirho() }
        .accessibilityActions {
            if let clipChirho {
                Button(MessagesChirho.fillChirho(messagesChirho.playWordChirho, ["word_chirho": wordChirho.textChirho])) {
                    modelChirho.playerChirho.toggleChirho(clipChirho, idChirho: wordChirho.idChirho)
                }
            }
        }
    }

    /// Marks are placed physically: stem or tense left, state or case centred, conjugation or mood right.
    private var cueRowChirho: some View {
        HStack(spacing: 6) {
            Text(cuesChirho.leftChirho)
            Spacer(minLength: 0)
            Text(cuesChirho.centerChirho)
            Spacer(minLength: 0)
            Text(cuesChirho.rightChirho)
        }
        .font(.caption.weight(.semibold).monospaced())
        .foregroundStyle(PaletteChirho.quietChirho)
        .frame(minHeight: 14)
        // Keeps the right-hand cue clear of the speaker on the word's corner.
        .padding(.trailing, clipChirho == nil ? 0 : Self.speakerRadiusChirho + 2)
        .accessibilityHidden(true)
    }

    static let speakerRadiusChirho: CGFloat = 11

    /// L.J.'s placement: a small white control with a thin grey border, centred on the word
    /// box's upper-right corner. Its touch area is 44 points; its tap never opens Look closer.
    @ViewBuilder private var speakerChirho: some View {
        if let clipChirho {
            let activeChirho = modelChirho.playerChirho.activeIdChirho == wordChirho.idChirho
            let failedChirho = modelChirho.playerChirho.failedIdChirho == wordChirho.idChirho
            Button {
                modelChirho.playerChirho.toggleChirho(clipChirho, idChirho: wordChirho.idChirho)
            } label: {
                Image(systemName: activeChirho ? "stop.fill" : "speaker.wave.2.fill")
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundStyle(failedChirho ? Color.red : Self.speakerInkChirho)
                    .frame(width: Self.speakerRadiusChirho * 2, height: Self.speakerRadiusChirho * 2)
                    .background(Circle().fill(Color.white))
                    .overlay(Circle().stroke(Self.speakerRuleChirho, lineWidth: 0.75))
                    .frame(width: 44, height: 44)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            // The 44-point frame sits at the corner; this centres its circle on the corner itself.
            .offset(x: 22, y: -22)
            .accessibilityHidden(true)
        }
    }

    // The control is white in both appearances, so its ink and border stay fixed.
    private static let speakerInkChirho = Color(red: 0.32, green: 0.40, blue: 0.34)
    private static let speakerRuleChirho = Color(red: 0.62, green: 0.64, blue: 0.62)

    private var wordTextChirho: some View {
        Text(sourceTextChirho(wordChirho.surfaceChirho))
            .font(.system(size: wordSizeChirho, design: scriptChirho == .hebrewChirho ? .serif : .default))
            .foregroundStyle(PaletteChirho.inkChirho)
            .padding(.leading, 6)
            // Room under the corner speaker, so it never covers a letter.
            .padding(.trailing, clipChirho == nil ? 6 : 6 + Self.speakerRadiusChirho)
            .padding(.vertical, 2)
            .background(PaletteChirho.shadeChirho(cuesChirho.shadeChirho), in: RoundedRectangle(cornerRadius: 6))
            .overlay(alignment: .bottom) {
                Rectangle().fill(PaletteChirho.underlineChirho(cuesChirho.underlineChirho)).frame(height: 3)
            }
            .overlay(alignment: .top) { patternLineChirho }
            .fixedSize()
    }

    @ViewBuilder private var patternLineChirho: some View {
        switch cuesChirho.patternChirho {
        case .noneChirho: EmptyView()
        case .solidChirho: Rectangle().fill(PaletteChirho.patternChirho).frame(height: 2)
        case .dottedChirho:
            DashLineChirho()
                .stroke(PaletteChirho.patternChirho, style: StrokeStyle(lineWidth: 2, dash: [2, 3]))
                .frame(height: 2)
        }
    }

    private var pictureFrameChirho: some View {
        let outlineChirho = PaletteChirho.outlineChirho(cuesChirho.categoryChirho)
        let shapeChirho = RoundedRectangle(cornerRadius: cuesChirho.categoryChirho == .articleChirho
                                           || cuesChirho.categoryChirho == .pronounChirho ? pictureSizeChirho : 9)
        let dashedChirho = cuesChirho.categoryChirho == .unknownChirho || cuesChirho.categoryChirho == .pronounChirho
        return ZStack {
            if let pictureChirho {
                VerifiedImageChirho(
                    pathChirho: pictureChirho.recordChirho.assetPathChirho,
                    sha256Chirho: pictureChirho.recordChirho.sha256Chirho,
                    altChirho: pictureChirho.recordChirho.altChirho,
                    storeChirho: modelChirho.artworkChirho
                ) { _ in Text("◇").foregroundStyle(PaletteChirho.quietChirho) }
                    .padding(4)
            } else {
                Text("◇").foregroundStyle(PaletteChirho.quietChirho)
            }
        }
        .frame(width: pictureSizeChirho, height: pictureSizeChirho)
        .clipShape(shapeChirho)
        .overlay {
            shapeChirho.stroke(outlineChirho, style: StrokeStyle(lineWidth: 2, dash: dashedChirho ? [4, 3] : []))
        }
        .overlay {
            if pictureChirho?.alternativesChirho.isEmpty == false {
                shapeChirho.inset(by: -4).stroke(outlineChirho, lineWidth: 1.5)
            }
        }
        .padding(4)
    }

    private var accessibleWordChirho: AttributedString {
        sourceTextChirho(wordChirho.textChirho)
    }

    private func sourceTextChirho(_ textChirho: String) -> AttributedString {
        TaggedTextChirho.sourceChirho(textChirho, scriptChirho)
    }
}

/// A horizontal line for the dotted form-pattern mark.
struct DashLineChirho: Shape {
    func path(in rect: CGRect) -> Path {
        var pathChirho = Path()
        pathChirho.move(to: CGPoint(x: rect.minX, y: rect.midY))
        pathChirho.addLine(to: CGPoint(x: rect.maxX, y: rect.midY))
        return pathChirho
    }
}
