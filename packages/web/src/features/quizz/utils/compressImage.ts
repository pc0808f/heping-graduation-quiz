// 將使用者選取的圖片檔壓縮成 data: URI（base64），直接內嵌進題庫。
// 縮放到最長邊不超過 MAX_DIMENSION，並逐步降低 JPEG 品質直到檔案夠小，
// 以免內嵌的 base64 過大（socket 單則訊息與整包題庫都有大小限制）。

const MAX_DIMENSION = 1024
// 目標：解碼後約 400KB 以下
const TARGET_MAX_BYTES = 400 * 1024
const MIN_QUALITY = 0.4

// 「data:」URI 的 base64 長度約為實際位元組的 4/3 倍
const approxBytes = (dataUrl: string) => Math.ceil(dataUrl.length * 0.75)

export const compressImageToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("not an image"))

      return
    }

    const reader = new FileReader()

    reader.onerror = () => reject(new Error("read failed"))

    reader.onload = () => {
      const img = new Image()

      img.onerror = () => reject(new Error("decode failed"))

      img.onload = () => {
        let { width, height } = img

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const scale = MAX_DIMENSION / Math.max(width, height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("no canvas context"))

          return
        }

        // JPEG 沒有透明通道，先鋪白底避免透明區變黑
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        let quality = 0.85
        let dataUrl = canvas.toDataURL("image/jpeg", quality)

        while (
          approxBytes(dataUrl) > TARGET_MAX_BYTES &&
          quality > MIN_QUALITY
        ) {
          quality -= 0.15
          dataUrl = canvas.toDataURL("image/jpeg", quality)
        }

        resolve(dataUrl)
      }

      img.src = reader.result as string
    }

    reader.readAsDataURL(file)
  })
