const STEGO_START_MARKER = new TextEncoder().encode('SVC-GIF-STEGO-V1-START')
const STEGO_END_MARKER = new TextEncoder().encode('SVC-GIF-STEGO-V1-END')

const METADATA_SIZE_BYTES = 8

const fnv1a32 = (input: Uint8Array): number => {
  let hash = 0x811c9dc5

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input[index]
    hash = Math.imul(hash, 0x01000193)
  }

  return hash >>> 0
}

const writeUint32 = (target: Uint8Array, offset: number, value: number): void => {
  target[offset] = (value >>> 24) & 0xff
  target[offset + 1] = (value >>> 16) & 0xff
  target[offset + 2] = (value >>> 8) & 0xff
  target[offset + 3] = value & 0xff
}

const readUint32 = (source: Uint8Array, offset: number): number =>
  (((source[offset] << 24) >>> 0) |
    (source[offset + 1] << 16) |
    (source[offset + 2] << 8) |
    source[offset + 3]) >>>
  0

const isLikelyGif = (bytes: Uint8Array): boolean =>
  bytes.length >= 6 &&
  bytes[0] === 0x47 &&
  bytes[1] === 0x49 &&
  bytes[2] === 0x46 &&
  bytes[3] === 0x38 &&
  (bytes[4] === 0x37 || bytes[4] === 0x39) &&
  bytes[5] === 0x61

const endsWithSequence = (source: Uint8Array, suffix: Uint8Array): boolean => {
  if (source.length < suffix.length) {
    return false
  }

  const offset = source.length - suffix.length
  for (let index = 0; index < suffix.length; index += 1) {
    if (source[offset + index] !== suffix[index]) {
      return false
    }
  }

  return true
}

const lastIndexOfSequence = (source: Uint8Array, target: Uint8Array, fromIndex: number): number => {
  const startIndex = Math.min(fromIndex, source.length - target.length)
  for (let offset = startIndex; offset >= 0; offset -= 1) {
    let isMatch = true
    for (let innerIndex = 0; innerIndex < target.length; innerIndex += 1) {
      if (source[offset + innerIndex] !== target[innerIndex]) {
        isMatch = false
        break
      }
    }

    if (isMatch) {
      return offset
    }
  }

  return -1
}

export const hidePayloadInGif = (coverGifBytes: Uint8Array, payload: Uint8Array): Uint8Array => {
  if (!isLikelyGif(coverGifBytes)) {
    throw new Error('Cover file must be a GIF image.')
  }

  if (payload.length === 0) {
    throw new Error('Payload is empty.')
  }

  const metadata = new Uint8Array(METADATA_SIZE_BYTES)
  writeUint32(metadata, 0, payload.length)
  writeUint32(metadata, 4, fnv1a32(payload))

  const output = new Uint8Array(
    coverGifBytes.length + STEGO_START_MARKER.length + metadata.length + payload.length + STEGO_END_MARKER.length,
  )

  let cursor = 0
  output.set(coverGifBytes, cursor)
  cursor += coverGifBytes.length

  output.set(STEGO_START_MARKER, cursor)
  cursor += STEGO_START_MARKER.length

  output.set(metadata, cursor)
  cursor += metadata.length

  output.set(payload, cursor)
  cursor += payload.length

  output.set(STEGO_END_MARKER, cursor)

  return output
}

export const extractPayloadFromGif = (stegoGifBytes: Uint8Array): Uint8Array => {
  if (!isLikelyGif(stegoGifBytes)) {
    throw new Error('Selected file is not a GIF image.')
  }

  if (!endsWithSequence(stegoGifBytes, STEGO_END_MARKER)) {
    throw new Error('No hidden backup was found in this GIF.')
  }

  const payloadSectionEnd = stegoGifBytes.length - STEGO_END_MARKER.length
  const searchStart = payloadSectionEnd - (STEGO_START_MARKER.length + METADATA_SIZE_BYTES)
  const startIndex = lastIndexOfSequence(stegoGifBytes, STEGO_START_MARKER, searchStart)

  if (startIndex < 0) {
    throw new Error('Hidden backup metadata is missing.')
  }

  const metadataIndex = startIndex + STEGO_START_MARKER.length
  const payloadLength = readUint32(stegoGifBytes, metadataIndex)
  const expectedHash = readUint32(stegoGifBytes, metadataIndex + 4)
  const payloadStart = metadataIndex + METADATA_SIZE_BYTES
  const payloadEnd = payloadStart + payloadLength

  if (payloadEnd !== payloadSectionEnd || payloadLength === 0) {
    throw new Error('Hidden backup payload is corrupted.')
  }

  const payload = stegoGifBytes.slice(payloadStart, payloadEnd)
  const actualHash = fnv1a32(payload)

  if (actualHash !== expectedHash) {
    throw new Error('Hidden backup integrity check failed.')
  }

  return payload
}
