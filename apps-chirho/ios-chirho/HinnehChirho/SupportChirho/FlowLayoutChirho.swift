// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import SwiftUI

/// Wraps word boxes into lines in reading order. It lays out leading to trailing; SwiftUI
/// mirrors it in a right-to-left environment, so Hebrew starts at the right edge.
struct FlowLayoutChirho: Layout {
    var spacingChirho: CGFloat = 10
    var lineSpacingChirho: CGFloat = 14

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let widthChirho = proposal.width ?? .infinity
        let linesChirho = linesChirho(subviews, widthChirho)
        let heightChirho = linesChirho.reduce(0) { $0 + $1.heightChirho }
            + lineSpacingChirho * CGFloat(max(0, linesChirho.count - 1))
        let usedChirho = linesChirho.map(\.widthChirho).max() ?? 0
        return CGSize(width: proposal.width ?? usedChirho, height: heightChirho)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var yChirho = bounds.minY
        for lineChirho in linesChirho(subviews, bounds.width) {
            var xChirho = bounds.minX
            for indexChirho in lineChirho.indicesChirho {
                let sizeChirho = subviews[indexChirho].sizeThatFits(.unspecified)
                subviews[indexChirho].place(
                    at: CGPoint(x: xChirho, y: yChirho + (lineChirho.heightChirho - sizeChirho.height) / 2),
                    proposal: ProposedViewSize(sizeChirho))
                xChirho += sizeChirho.width + spacingChirho
            }
            yChirho += lineChirho.heightChirho + lineSpacingChirho
        }
    }

    private struct LineChirho {
        var indicesChirho: [Int] = []
        var widthChirho: CGFloat = 0
        var heightChirho: CGFloat = 0
    }

    private func linesChirho(_ subviews: Subviews, _ widthChirho: CGFloat) -> [LineChirho] {
        var linesChirho: [LineChirho] = []
        var currentChirho = LineChirho()
        for indexChirho in subviews.indices {
            let sizeChirho = subviews[indexChirho].sizeThatFits(.unspecified)
            let neededChirho = currentChirho.indicesChirho.isEmpty
                ? sizeChirho.width : currentChirho.widthChirho + spacingChirho + sizeChirho.width
            if neededChirho > widthChirho, !currentChirho.indicesChirho.isEmpty {
                linesChirho.append(currentChirho)
                currentChirho = LineChirho()
            }
            currentChirho.widthChirho = currentChirho.indicesChirho.isEmpty
                ? sizeChirho.width : currentChirho.widthChirho + spacingChirho + sizeChirho.width
            currentChirho.heightChirho = max(currentChirho.heightChirho, sizeChirho.height)
            currentChirho.indicesChirho.append(indexChirho)
        }
        if !currentChirho.indicesChirho.isEmpty { linesChirho.append(currentChirho) }
        return linesChirho
    }
}
