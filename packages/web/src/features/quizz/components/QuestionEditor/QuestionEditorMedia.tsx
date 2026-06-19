import { MEDIA_TYPES } from "@razzia/common/constants"
import type { QuestionMediaType } from "@razzia/common/types/game"
import { questionMediaValidator } from "@razzia/common/validators/quizz"
import Button from "@razzia/web/components/Button"
import Card from "@razzia/web/components/Card"
import Input from "@razzia/web/components/Input"
import QuestionMedia from "@razzia/web/components/QuestionMedia"
import { useQuizzEditor } from "@razzia/web/features/quizz/contexts/quizz-editor-context"
import { compressImageToDataUrl } from "@razzia/web/features/quizz/utils/compressImage"
import { Image, ImageOff, Music, Upload, Video } from "lucide-react"
import { type ChangeEvent, useRef, useState } from "react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

const QuestionEditorMedia = () => {
  const { updateQuestion, currentIndex, currentQuestion } = useQuizzEditor()
  const questionMedia = currentQuestion.media
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleUploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // 允許重新選同一個檔案
    e.target.value = ""

    if (!file) {
      return
    }

    setUploading(true)

    try {
      const url = await compressImageToDataUrl(file)
      updateQuestion(currentIndex, { media: { type: MEDIA_TYPES.IMAGE, url } })
    } catch {
      toast.error(t("errors:quizz.imageProcessFailed"))
    } finally {
      setUploading(false)
    }
  }

  const hadnleChangeMediaType = (type: QuestionMediaType) => () => {
    const result = questionMediaValidator.safeParse({
      type,
      url: questionMedia?.url,
    })

    if (!result.success) {
      toast.error(t(result.error.issues[0].message))

      return
    }

    updateQuestion(currentIndex, { media: result.data })
  }

  const handleRemoveMedia = () => {
    if (!questionMedia) {
      return
    }

    updateQuestion(currentIndex, { media: undefined })
  }

  const handleChangeMedia = (e: ChangeEvent<HTMLInputElement>) => {
    updateQuestion(currentIndex, {
      media: { url: e.target.value },
    })
  }

  return (
    <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-3 p-4">
      <QuestionMedia media={currentQuestion.media} alt="Question Media" />

      {!questionMedia?.type && (
        <Card className="my-auto flex max-h-100 w-full max-w-xl flex-1 flex-col items-center justify-center gap-2 bg-white">
          <ImageOff className="size-16 stroke-gray-600" />
          <p className="text-center text-sm text-gray-600">
            {t("quizz:question.addMediaHint")}
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            className="hidden"
            onChange={handleUploadImage}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-gray-800 text-white transition-colors hover:bg-gray-700"
          >
            <div className="flex items-center gap-1.5">
              <Upload className="size-5" />
              <p>
                {uploading
                  ? t("common:loading")
                  : t("quizz:question.uploadImage")}
              </p>
            </div>
          </Button>

          <p className="text-xs text-gray-400">
            {t("quizz:question.orUseUrl")}
          </p>
          <Input
            variant="sm"
            className="w-full max-w-md"
            placeholder={t("quizz:question.mediaUrlPlaceholder")}
            value={questionMedia?.url ?? ""}
            onChange={handleChangeMedia}
          />
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              onClick={hadnleChangeMediaType("image")}
              className={`bg-gray-200 text-gray-600 transition-colors hover:bg-gray-200`}
            >
              <div className="flex items-center gap-1.5">
                <Image className="size-6" />
                <p>{t("quizz:question.media.image")}</p>
              </div>
            </Button>
            <Button
              onClick={hadnleChangeMediaType("video")}
              className={`bg-gray-200 text-gray-600 transition-colors hover:bg-gray-200`}
            >
              <div className="flex items-center gap-1.5">
                <Video className="size-6" />
                <p>{t("quizz:question.media.video")}</p>
              </div>
            </Button>
            <Button
              onClick={hadnleChangeMediaType("audio")}
              className={`bg-gray-200 text-gray-600 transition-colors hover:bg-gray-200`}
            >
              <div className="flex items-center gap-1.5">
                <Music className="size-6" />
                <p>{t("quizz:question.media.audio")}</p>
              </div>
            </Button>
          </div>
        </Card>
      )}

      {questionMedia?.type && (
        <div className="absolute bottom-4">
          <Button
            className="rounded-sm bg-gray-200 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-200"
            onClick={handleRemoveMedia}
          >
            {t("common:delete")}
          </Button>
        </div>
      )}
    </div>
  )
}

export default QuestionEditorMedia
