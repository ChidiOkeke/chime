export async function generateAccessCardPng({ baseImageUrl, accessCode, displayName }) {
  const baseImg = await loadImage(baseImageUrl)

  // Canvas size matches base image.
  const canvas = document.createElement('canvas')
  canvas.width = baseImg.width
  canvas.height = baseImg.height
  const ctx = canvas.getContext('2d')

  ctx.drawImage(baseImg, 0, 0)

  // Overlay styling: adjust these to your card design.
  // These coordinates assume a fairly typical portrait PNG. Tune as needed.
  const code = String(accessCode).toUpperCase()

  // Access code placement
  ctx.fillStyle = '#07351b' // emerald
  ctx.font = 'bold 48px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,0,0,0.25)'
  ctx.shadowBlur = 6
  ctx.shadowOffsetY = 2

  // Try to place code near the bottom-middle; adjust with card measurements.
  const codeX = canvas.width * 0.52
  const codeY = canvas.height * 0.62
  ctx.fillText(code, codeX, codeY)

  // Name placement
  ctx.shadowBlur = 0
  ctx.fillStyle = '#5b1f2a' // burgundy
  ctx.font = 'bold 28px Georgia, serif'
  const nameX = canvas.width * 0.52
  const nameY = canvas.height * 0.48
  wrapAndDraw(ctx, displayName, nameX, nameY, canvas.width * 0.78, 34)

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  return blob
}

function wrapAndDraw(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(/\s+/)
  let line = ''
  let lineCount = 0

  for (let n = 0; n < words.length; n++) {
    const testLine = line ? `${line} ${words[n]}` : words[n]
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width

    if (testWidth > maxWidth && line) {
      ctx.fillText(line, x, y + lineCount * lineHeight)
      line = words[n]
      lineCount++
    } else {
      line = testLine
    }
  }

  if (line) ctx.fillText(line, x, y + lineCount * lineHeight)
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = url
  })
}

