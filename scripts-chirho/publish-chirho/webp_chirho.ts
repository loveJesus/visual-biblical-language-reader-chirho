// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Reads WebP canvas dimensions from the RIFF container without decoding pixels, so release gates
// can prove "WebP only" and the icon edge limit from the bytes rather than from file names.

export interface WebpInfoChirho {
	format_chirho: 'VP8' | 'VP8L' | 'VP8X';
	width_chirho: number;
	height_chirho: number;
}

function asciiChirho(bytesChirho: Uint8Array, startChirho: number): string {
	return String.fromCharCode(...bytesChirho.subarray(startChirho, startChirho + 4));
}

export function readWebpChirho(bytesChirho: Uint8Array): WebpInfoChirho {
	const viewChirho = new DataView(
		bytesChirho.buffer,
		bytesChirho.byteOffset,
		bytesChirho.byteLength
	);
	if (
		bytesChirho.byteLength < 30 ||
		asciiChirho(bytesChirho, 0) !== 'RIFF' ||
		asciiChirho(bytesChirho, 8) !== 'WEBP'
	)
		throw new Error('not a RIFF WebP file');
	if (viewChirho.getUint32(4, true) !== bytesChirho.byteLength - 8)
		throw new Error('RIFF size does not match the file length');
	const chunkChirho = asciiChirho(bytesChirho, 12);
	if (viewChirho.getUint32(16, true) + 20 > bytesChirho.byteLength)
		throw new Error('first WebP chunk is truncated');
	let infoChirho: WebpInfoChirho;
	if (chunkChirho === 'VP8 ') {
		if (
			bytesChirho[23] !== 0x9d ||
			bytesChirho[24] !== 0x01 ||
			bytesChirho[25] !== 0x2a ||
			(bytesChirho[20] & 1) !== 0
		)
			throw new Error('VP8 key frame start code missing');
		infoChirho = {
			format_chirho: 'VP8',
			width_chirho: viewChirho.getUint16(26, true) & 0x3fff,
			height_chirho: viewChirho.getUint16(28, true) & 0x3fff
		};
	} else if (chunkChirho === 'VP8L') {
		if (bytesChirho[20] !== 0x2f) throw new Error('VP8L signature missing');
		const bitsChirho = viewChirho.getUint32(21, true);
		if (bitsChirho >>> 29 !== 0) throw new Error('unsupported VP8L version');
		infoChirho = {
			format_chirho: 'VP8L',
			width_chirho: (bitsChirho & 0x3fff) + 1,
			height_chirho: ((bitsChirho >>> 14) & 0x3fff) + 1
		};
	} else if (chunkChirho === 'VP8X') {
		const u24Chirho = (offsetChirho: number) =>
			bytesChirho[offsetChirho] |
			(bytesChirho[offsetChirho + 1] << 8) |
			(bytesChirho[offsetChirho + 2] << 16);
		infoChirho = {
			format_chirho: 'VP8X',
			width_chirho: u24Chirho(24) + 1,
			height_chirho: u24Chirho(27) + 1
		};
	} else throw new Error(`unknown WebP chunk ${JSON.stringify(chunkChirho)}`);
	if (infoChirho.width_chirho < 1 || infoChirho.height_chirho < 1)
		throw new Error('WebP canvas has a zero dimension');
	return infoChirho;
}
