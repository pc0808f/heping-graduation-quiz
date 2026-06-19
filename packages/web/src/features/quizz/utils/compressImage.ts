// 將使用者選取的圖片檔壓縮成 data: URI（base64），直接內嵌進題庫。
// - HEIC/HEIF（iPhone）：多數瀏覽器無法解碼，先用 heic2any 轉成 JPEG。
// - GIF：保留原檔以維持動畫（不經 canvas，否則會變靜態圖）。
// - 其餘：縮到最長邊 MAX_DIMENSION，再逐步降品質／必要時再縮尺寸。
// 目的是讓使用者不論什麼格式、多大的原圖，上傳當下就自動處理好。

const MAX_DIMENSION = 1280
// 目標：解碼後約 300KB 以下
const TARGET_MAX_BYTES = 300 * 1024
const MIN_QUALITY = 0.5
// 尺寸縮到這個以下就不再縮，直接接受
const MIN_DIMENSION = 480
// GIF 原檔大小上限（不壓縮，僅原樣保留）
const MAX_GIF_BYTES = 8 * 1024 * 1024

// 「data:」URI 的 base64 長度約為實際位元組的 4/3 倍
const approxBytes = (dataUrl: string) => Math.ceil(dataUrl.length * 0.75)

const isHeic = (file: File) =>
  /image\/hei[cf]/iu.test(file.type) || /\.hei[cf]$/iu.test(file.name)

const readAsDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("read failed"))
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })

const compressViaCanvas = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => reject(new Error("read failed"))

    reader.onload = () => {
      const img = new Image()

      img.onerror = () => reject(new Error("decode failed"))

      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("no canvas context"))

          return
        }

        let scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
        let dataUrl = ""

        for (let attempt = 0; attempt < 6; attempt += 1) {
          const width = Math.max(1, Math.round(img.width * scale))
          const height = Math.max(1, Math.round(img.height * scale))

          canvas.width = width
          canvas.height = height

          // JPEG 沒有透明通道，先鋪白底避免透明區變黑
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, width, height)
          ctx.drawImage(img, 0, 0, width, height)

          let quality = 0.85
          dataUrl = canvas.toDataURL("image/jpeg", quality)

          while (
            approxBytes(dataUrl) > TARGET_MAX_BYTES &&
            quality > MIN_QUALITY
          ) {
            quality -= 0.15
            dataUrl = canvas.toDataURL("image/jpeg", quality)
          }

          // 夠小、或尺寸已經很小就接受；否則再縮尺寸重試
          if (
            approxBytes(dataUrl) <= TARGET_MAX_BYTES ||
            width <= MIN_DIMENSION
          ) {
            break
          }

          scale *= 0.8
        }

        resolve(dataUrl)
      }

      img.src = reader.result as string
    }

    reader.readAsDataURL(blob)
  })

export const compressImageToDataUrl = async (file: File): Promise<string> => {
  let source: Blob = file

  // iPhone HEIC/HEIF：多數瀏覽器無法直接解碼，先轉成 JPEG（heic2any 較大，
  // 只在真的遇到 HEIC 時才動態載入，不影響一般載入速度）
  if (isHeic(file)) {
    const heic2any = (await import("heic2any")).default
    const converted = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    })
    source = Array.isArray(converted) ? converted[0] : converted
  } else if (!file.type.startsWith("image/")) {
    throw new Error("not an image")
  }

  // 動畫 GIF：保留原檔以維持動畫（轉檔後的 source 已是 JPEG，不會進這裡）
  if (source.type === "image/gif") {
    if (source.size > MAX_GIF_BYTES) {
      throw new Error("gif too large")
    }

    return readAsDataUrl(source)
  }

  return compressViaCanvas(source)
}
