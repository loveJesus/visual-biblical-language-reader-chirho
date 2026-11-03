// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import HinnehCoreChirho
import SwiftUI

/// Book, then chapter, then verse. Verse numbers come from the edition's own manifest, so
/// verses the source edition lacks are never offered.
struct PassagePickerViewChirho: View {
    let modelChirho: ReaderModelChirho
    @Environment(\.dismiss) private var dismissChirho
    @State private var pathChirho: [PickStepChirho] = []

    enum PickStepChirho: Hashable {
        case chaptersChirho(BookChirho)
        case versesChirho(BookChirho, Int)
    }

    private var messagesChirho: MessagesChirho { modelChirho.messagesChirho }

    var body: some View {
        NavigationStack(path: $pathChirho) {
            List {
                bookSectionChirho(false, messagesChirho.oldTestamentChirho)
                bookSectionChirho(true, messagesChirho.newTestamentChirho)
            }
            .navigationTitle(messagesChirho.choosePassageChirho)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(messagesChirho.doneChirho) { dismissChirho() }
                }
            }
            .navigationDestination(for: PickStepChirho.self) { stepChirho in
                switch stepChirho {
                case .chaptersChirho(let bookChirho):
                    NumberGridChirho(
                        titleChirho: "\(bookChirho.labelChirho(modelChirho.localeChirho)) · \(messagesChirho.chapterChirho)",
                        loadChirho: { Array(1...bookChirho.chapterCountChirho) }
                    ) { pathChirho.append(.versesChirho(bookChirho, $0)) }
                case .versesChirho(let bookChirho, let chapterChirho):
                    NumberGridChirho(
                        titleChirho: "\(bookChirho.labelChirho(modelChirho.localeChirho)) \(chapterChirho) · "
                            + messagesChirho.verseChirho,
                        loadChirho: { await modelChirho.versesChirho(bookChirho, chapterChirho) }
                    ) { verseChirho in
                        modelChirho.openChirho(PassageChirho(
                            bookIdChirho: bookChirho.idChirho, chapterChirho: chapterChirho, verseChirho: verseChirho))
                        dismissChirho()
                    }
                }
            }
        }
    }

    private func bookSectionChirho(_ newChirho: Bool, _ titleChirho: String) -> some View {
        Section(titleChirho) {
            ForEach(modelChirho.booksChirho.booksChirho.filter { $0.isNewTestamentChirho == newChirho }) { bookChirho in
                NavigationLink(value: PickStepChirho.chaptersChirho(bookChirho)) {
                    HStack {
                        Text(bookChirho.labelChirho(modelChirho.localeChirho))
                        Spacer()
                        if bookChirho.idChirho == modelChirho.passageChirho.bookIdChirho {
                            Image(systemName: "checkmark").foregroundStyle(.tint).accessibilityHidden(true)
                        }
                    }
                }
                .accessibilityAddTraits(bookChirho.idChirho == modelChirho.passageChirho.bookIdChirho ? .isSelected : [])
            }
        }
    }
}

/// A grid of chapter or verse numbers; verse numbers load from the verified manifest.
struct NumberGridChirho: View {
    let titleChirho: String
    let loadChirho: () async -> [Int]
    let chooseChirho: (Int) -> Void
    @State private var numbersChirho: [Int]?
    @ScaledMetric private var cellChirho: CGFloat = 56

    var body: some View {
        ScrollView {
            if let numbersChirho {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: cellChirho), spacing: 10)], spacing: 10) {
                    ForEach(numbersChirho, id: \.self) { numberChirho in
                        Button { chooseChirho(numberChirho) } label: {
                            Text("\(numberChirho)")
                                .font(.title3.monospacedDigit())
                                .frame(maxWidth: .infinity, minHeight: cellChirho)
                        }
                        .buttonStyle(.bordered)
                    }
                }
                .padding()
            } else {
                ProgressView().padding(40)
            }
        }
        .navigationTitle(titleChirho)
        .navigationBarTitleDisplayMode(.inline)
        .task { numbersChirho = await loadChirho() }
    }
}
