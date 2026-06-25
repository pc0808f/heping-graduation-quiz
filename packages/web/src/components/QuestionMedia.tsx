import { MEDIA_TYPES } from "@razzia/common/constants"
import type { QuestionMedia as QuestionMediaType } from "@razzia/common/types/game"

interface Props {
  media?: QuestionMediaType
  alt?: string
}

// 從常見的 YouTube 連結取出影片 ID（watch、youtu.be、shorts、embed）
const getYoutubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/u,
    /(?:youtu\.be\/)([\w-]{11})/u,
    /(?:youtube\.com\/(?:shorts|embed|v)\/)([\w-]{11})/u,
  ]

  for (const pattern of patterns) {
    const match = pattern.exec(url)

    if (match) {
      return match[1]
    }
  }

  return null
}

const QuestionMedia = ({ media, alt = "" }: Props) => {
  if (media?.type === MEDIA_TYPES.IMAGE) {
    return (
      <img
        alt={alt}
        src={media.url}
        className="max-h-60 w-auto rounded-md sm:max-h-100"
      />
    )
  }

  if (media?.type === MEDIA_TYPES.VIDEO) {
    // YouTube 連結不是直接的影片檔，必須用 iframe 嵌入播放器
    const youtubeId = getYoutubeId(media.url)

    if (youtubeId) {
      return (
        <iframe
          className="m-4 mb-2 aspect-video max-h-60 w-full max-w-3xl rounded-md px-4 sm:max-h-100"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
          title={alt || "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    }

    return (
      <video
        className="m-4 mb-2 aspect-video max-h-60 w-auto rounded-md px-4 sm:max-h-100"
        src={media.url}
        autoPlay
        controls
      />
    )
  }

  if (media?.type === MEDIA_TYPES.AUDIO) {
    return (
      <audio
        className="m-4 mb-2 w-auto rounded-md"
        src={media.url}
        autoPlay
        controls
      />
    )
  }

  return null
}

export default QuestionMedia
