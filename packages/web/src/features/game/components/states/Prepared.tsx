import type { CommonStatusDataMap } from "@razzia/common/types/game/status"
import { useGameThemeStore } from "@razzia/web/hooks/useTheme"
import { useQuestionStore } from "@razzia/web/features/game/stores/question"
import {
  ANSWERS_LABELS,
  getAnswerColors,
} from "@razzia/web/features/game/utils/constants"
import clsx from "clsx"
import { useTranslation } from "react-i18next"

interface Props {
  data: CommonStatusDataMap["SHOW_PREPARED"]
}

const MapleLeaf = ({
  className,
  fill,
}: {
  className?: string
  fill: string
}) => (
  <svg viewBox="0 0 24 24" className={className} fill={fill} aria-hidden="true">
    <path d="M12 2 L 9 8 L 4 7 L 7 12 L 3 16 L 8 17 L 12 22 L 16 17 L 21 16 L 17 12 L 20 7 L 15 8 Z" />
  </svg>
)

const Prepared = ({ data: { totalAnswers, questionNumber, theme: statusTheme } }: Props) => {
  const { t } = useTranslation()
  const { questionStates } = useQuestionStore()
  const storeTheme = useGameThemeStore((s) => s.theme)
  // 優先用 status 帶的 theme（剛廣播的），fallback 到 store（之前 game 廣播的）
  const theme = statusTheme ?? storeTheme
  const total = questionStates?.total ?? 20
  const current = questionStates?.current ?? questionNumber
  const answerColors = getAnswerColors(theme)

  // 楓葉「由綠轉紅」進度：已過題目 → 紅，當前 → 橘，未來 → 綠
  const leafColor = (i: number) => {
    if (i < current - 1) return "#E53935"
    if (i === current - 1) return "#FB8C00"
    return "#43A047"
  }

  return (
    <section className="anim-show relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center">
      <h2 className="anim-show mb-6 text-center text-3xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl">
        {t("game:questionPrefix")}
        {questionNumber}
      </h2>

      {/* 楓葉「由綠轉紅」進度條 — 呼應「楓香班」(只 HEPING 主題顯示) */}
      {theme === "heping" && (
        <div className="anim-maple-progress mb-10 flex items-center gap-2">
          {Array.from({ length: Math.min(total, 20) }).map((_, i) => (
            <MapleLeaf
              key={i}
              className="h-6 w-6 drop-shadow-md md:h-8 md:w-8"
              fill={leafColor(i)}
            />
          ))}
        </div>
      )}

      <div className="anim-quizz grid aspect-square w-60 grid-cols-2 gap-4 rounded-2xl bg-gray-700 p-5 md:w-60">
        {Array.from({ length: totalAnswers }).map((_, key) => (
          <div
            key={key}
            className={clsx(
              "button shadow-inset flex aspect-square h-full w-full items-center justify-center rounded-2xl",
              answerColors[key % answerColors.length],
            )}
          >
            <span className="text-2xl font-bold text-white md:text-3xl">
              {ANSWERS_LABELS[key]}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Prepared
