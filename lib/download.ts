export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  triggerDownload(URL.createObjectURL(blob), filename)
}

export async function downloadImage(url: string, filename: string) {
  const response = await fetch(url)
  const blob = await response.blob()
  triggerDownload(URL.createObjectURL(blob), filename)
}

function triggerDownload(objectUrl: string, filename: string) {
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(objectUrl)
}
