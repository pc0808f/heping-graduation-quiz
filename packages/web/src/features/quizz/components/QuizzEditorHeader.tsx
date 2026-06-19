import { EVENTS } from "@razzia/common/constants"
import type { QuizzTheme } from "@razzia/common/types/game"
import Button from "@razzia/web/components/Button"
import Input from "@razzia/web/components/Input"
import {
  useEvent,
  useSocket,
} from "@razzia/web/features/game/contexts/socket-context"
import { useQuizzEditor } from "@razzia/web/features/quizz/contexts/quizz-editor-context"
import { useNavigate } from "@tanstack/react-router"
import { Palette } from "lucide-react"
import type { ChangeEvent } from "react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

const QuizzEditorHeader = () => {
  const { quizzId, subject, setSubject, theme, setTheme, questions } =
    useQuizzEditor()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleChangeSubject = (e: ChangeEvent<HTMLInputElement>) => {
    setSubject(e.target.value)
  }

  const handleSave = () => {
    const payload = { subject, theme, questions }
    if (quizzId) {
      socket.emit(EVENTS.QUIZZ.UPDATE, { id: quizzId, ...payload })
    } else {
      socket.emit(EVENTS.QUIZZ.SAVE, payload)
    }
  }

  useEvent(EVENTS.QUIZZ.SAVE_SUCCESS, () => {
    toast.success(t("quizz:quizzSaved"))
    navigate({ to: "/manager/config" })
  })

  useEvent(EVENTS.QUIZZ.UPDATE_SUCCESS, (_data) => {
    toast.success(t("quizz:quizzUpdated"))
    navigate({ to: "/manager/config" })
  })

  useEvent(EVENTS.QUIZZ.ERROR, (message) => {
    toast.error(t(message))
  })

  return (
    <header className="z-20 flex h-14 items-center justify-between gap-4 bg-white px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Input
          variant="sm"
          className="w-64"
          value={subject}
          onChange={handleChangeSubject}
          placeholder={t("quizz:titleQuizzPlaceholder")}
        />

        {/* 主題選擇器：default = Razzia 經典，heping = HEPING 楓香班畢業版 */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
          <Palette className="ml-1 size-3.5 text-gray-400" />
          <button
            type="button"
            onClick={() => setTheme("default" satisfies QuizzTheme)}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              theme === "default"
                ? "bg-[#E69F00] text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100"
            }`}
            title="Razzia 經典四色（橘/天藍/綠/紫）"
          >
            Razzia 經典
          </button>
          <button
            type="button"
            onClick={() => setTheme("heping" satisfies QuizzTheme)}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              theme === "heping"
                ? "bg-[#1E88E5] text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100"
            }`}
            title="HEPING 楓香班 配色（藍/橘/綠/海軍深藍）+ 楓葉彩蛋 + 帆船 Logo"
          >
            🌿 HEPING 楓香班
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          className="text-md bg-gray-200 px-4 py-2 font-semibold text-gray-600"
          onClick={() => navigate({ to: "/manager" })}
        >
          {t("common:exit")}
        </Button>
        <Button className="bg-primary text-md px-4 py-2" onClick={handleSave}>
          {t("common:save")}
        </Button>
      </div>
    </header>
  )
}

export default QuizzEditorHeader
