import type { CommonStatusDataMap } from "@razzia/common/types/game/status"
import CricleCheck from "@razzia/web/features/game/components/icons/CricleCheck"
import CricleXmark from "@razzia/web/features/game/components/icons/CricleXmark"
import { usePlayerStore } from "@razzia/web/features/game/stores/player"
import { SFX } from "@razzia/web/features/game/utils/constants"
import { useGameThemeStore } from "@razzia/web/hooks/useTheme"
import clsx from "clsx"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import useSound from "use-sound"

interface Props {
  data: CommonStatusDataMap["SHOW_RESULT"]
}

/** 楓葉 SVG — 給 Start / Result 飄落用 */
const MapleLeaf = ({
  className,
  fill = "#FB8C00",
}: {
  className?: string
  fill?: string
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill={fill}
    aria-hidden="true"
  >
    <path d="M12 2 L 9 8 L 4 7 L 7 12 L 3 16 L 8 17 L 12 22 L 16 17 L 21 16 L 17 12 L 20 7 L 15 8 Z" />
    <line
      x1="12"
      y1="2"
      x2="12"
      y2="22"
      stroke="#0D47A1"
      strokeWidth="0.5"
      opacity="0.4"
    />
  </svg>
)

/** 飄落的楓葉組件 — 答對時從天而降 */
const FallingMaple = ({
  index,
  total,
}: {
  index: number
  total: number
}) => {
  // 隨機位置 + 旋轉
  const random = useMemo(
    () => ({
      x: 5 + (index * 90) % 90, // 5-95% 水平位置
      delay: (index * 0.12) % 1.2, // 錯開飄落
      duration: 1.8 + (index % 3) * 0.3, // 飄落時間
      rotation: ((index * 73) % 360) - 180, // 旋轉 -180~180
      size: 28 + (index % 3) * 8, // 大小 28-44px
      // 顏色漸進：前幾片偏綠，後面偏紅
      color: index < total / 3
        ? "#43A047"
        : index < (total * 2) / 3
          ? "#FB8C00"
          : "#E53935",
    }),
    [index, total],
  )

  return (
    <div
      className="anim-falling-maple pointer-events-none absolute"
      style={{
        left: `${random.x}%`,
        top: "-10%",
        animationDelay: `${random.delay}s`,
        animationDuration: `${random.duration}s`,
      }}
    >
      <MapleLeaf
        className="drop-shadow-lg"
        fill={random.color}
        // @ts-expect-error style 屬性
        style={{ width: `${random.size}px`, height: `${random.size}px`, transform: `rotate(${random.rotation}deg)` }}
      />
    </div>
  )
}

const Result = ({
  data: { correct, message, points, myPoints, rank, aheadOfMe },
}: Props) => {
  const player = usePlayerStore()
  const { t } = useTranslation()
  const theme = useGameThemeStore((s) => s.theme)
  const rankKeyMap: Record<number, string> = {
    1: "game:rank.1",
    2: "game:rank.2",
    3: "game:rank.3",
  }
  const rankKey = rankKeyMap[rank] ?? "rank.other"

  const [sfxResults] = useSound(SFX.RESULTS_SOUND, {
    volume: 0.2,
  })

  useEffect(() => {
    player.updatePoints(myPoints)

    sfxResults()
    // oxlint-disable-next-line
  }, [sfxResults])

  return (
    <section className="anim-show relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center overflow-hidden">
      {/* 答對時楓葉飄落彩蛋 — 呼應「楓香班」(只 HEPING 主題) */}
      {correct && theme === "heping" && (
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <FallingMaple key={`${i}-${correct}`} index={i} total={12} />
          ))}
        </div>
      )}

      {correct ? (
        <CricleCheck className="anim-show aspect-square max-h-60 w-full" />
      ) : (
        <CricleXmark className="anim-show aspect-square max-h-60 w-full" />
      )}
      <h2 className={clsx("mt-1 text-4xl font-bold text-white drop-shadow-lg")}>
        {t(message)}
      </h2>
      <p className="mt-1 text-xl font-bold text-white drop-shadow-lg">
        {t("game:resultTop")}
        {t(rankKey, { rank })}
        {aheadOfMe ? `${t("game:resultBehind")}${aheadOfMe}` : ""}
      </p>
      {correct && (
        <span className="anim-show mt-2 rounded-lg bg-black/40 px-4 py-2 text-2xl font-bold text-white drop-shadow-lg">
          +{points}
        </span>
      )}
    </section>
  )
}

export default Result
