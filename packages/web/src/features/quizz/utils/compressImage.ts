// 將使用者選取的圖片檔壓縮成 data: URI（base64），直接內嵌進題庫。
// 上傳當下就在瀏覽器縮小：先把尺寸限制在 MAX_DIMENSION，再逐步降低 JPEG
// 品質；萬一仍超過目標大小，會再進一步縮小尺寸重試，盡量讓每張圖都夠小，
// 使用者完全不需要自己處理原圖大小。

const MAX_DIMENSION = 1280
// 目標：解碼後約 300KB 以下
const TARGET_MAX_BYTES = 300 * 1024
const MIN_QUALITY = 0.5
// 尺寸縮到這個以下就不再縮，直接接受
const MIN_DIMENSION = 480

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

    reader.readAsDataURL(file)
  })
