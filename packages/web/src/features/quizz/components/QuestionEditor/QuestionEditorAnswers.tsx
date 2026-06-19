import type { AnswerOption } from "@razzia/common/types/game"
import {
  ANSWERS_COLORS,
  ANSWERS_LABELS,
} from "@razzia/web/features/game/utils/constants"
import { useQuizzEditor } from "@razzia/web/features/quizz/contexts/quizz-editor-context"
import clsx from "clsx"
import { Check, Image as ImageIcon, Minus, Plus, X as XIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

const QuestionEditorAnswers = () => {
  const { currentQuestion, currentIndex, updateQuestion } = useQuizzEditor()
  const { t } = useTranslation()

  const updateAnswer = (index: number, patch: Partial<AnswerOption>) => {
    const next = [...currentQuestion.answers]
    next[index] = { ...next[index], ...patch }
    updateQuestion(currentIndex, { answers: next })
  }

  const addAnswer = () => {
    if (currentQuestion.answers.length >= 4) {
      return
    }

    updateQuestion(currentIndex, {
      answers: [...currentQuestion.answers, { text: "" }],
    })
  }

  const removeAnswer = () => {
    if (currentQuestion.answers.length <= 2) {
      return
    }

    const next = currentQuestion.answers.slice(0, -1)
    const maxIndex = next.length - 1
    const nextSolution = currentQuestion.solutions.filter((s) => s <= maxIndex)

    updateQuestion(currentIndex, {
      answers: next,
      solutions: nextSolution.length > 0 ? nextSolution : [0],
    })
  }

  const toggleSolution = (index: number) => {
    const current = currentQuestion.solutions

    if (current.includes(index)) {
      const next = current.filter((s) => s !== index)
      updateQuestion(currentIndex, {
        solutions: next.length > 0 ? next : [index],
      })
    } else {
      updateQuestion(currentIndex, { solutions: [...current, index] })
    }
  }

  return (
    <div className="z-10 flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <div className="rounded-lg bg-white px-2 py-1 text-sm font-semibold text-gray-500">
          {currentQuestion.answers.length}
          {t("quizz:answersCountSuffix")}
        </div>
        <div className="flex gap-2">
          <button
            onClick={removeAnswer}
            disabled={currentQuestion.answers.length <= 2}
            className="flex size-7 items-center justify-center rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <button
            onClick={addAnswer}
            disabled={currentQuestion.answers.length >= 4}
            className="flex size-7 items-center justify-center rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {currentQuestion.answers.map((answer, i) => {
          const isSelected = currentQuestion.solutions.includes(i)
          const hasImage = Boolean(answer.image?.trim())

          return (
            <div
              key={i}
              className={clsx(
                "flex flex-col gap-2 rounded-2xl p-3",
                ANSWERS_COLORS[i],
              )}
            >
              <div className="flex items-center gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-black/20 text-sm font-bold text-white md:size-8 md:text-base">
                  {ANSWERS_LABELS[i]}
                </span>
                <input
                  className="w-full bg-transparent font-semibold text-white placeholder-white/70 outline-none"
                  placeholder={t("quizz:addAnswerPlaceholder")}
                  value={answer.text ?? ""}
                  onChange={(e) => updateAnswer(i, { text: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => toggleSolution(i)}
                  className={clsx(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    isSelected
                      ? "border-white bg-white text-green-600"
                      : "border-white/60 bg-transparent",
                  )}
                >
                  {isSelected && <Check className="size-4 stroke-5" />}
                </button>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-black/20 px-2 py-1.5">
                <ImageIcon className="size-4 shrink-0 text-white/80" />
                <input
                  className="w-full bg-transparent text-sm text-white placeholder-white/60 outline-none"
                  placeholder={t("quizz:addAnswerImagePlaceholder")}
                  value={answer.image ?? ""}
                  onChange={(e) => updateAnswer(i, { image: e.target.value })}
                />
                {hasImage && (
                  <img
                    src={answer.image}
                    alt=""
                    className="size-8 shrink-0 rounded object-cover"
                  />
                )}
                {hasImage && (
                  <button
                    type="button"
                    onClick={() => updateAnswer(i, { image: undefined })}
                    className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/30 text-white hover:bg-white/50"
                  >
                    <XIcon className="size-3" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default QuestionEditorAnswers
