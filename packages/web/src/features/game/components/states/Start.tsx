import { EVENTS } from "@razzia/common/constants"
import type { CommonStatusDataMap } from "@razzia/common/types/game/status"
import { useEvent } from "@razzia/web/features/game/contexts/socket-context"
import { useGameThemeStore } from "@razzia/web/hooks/useTheme"
import { SFX } from "@razzia/web/features/game/utils/constants"
import clsx from "clsx"
import { useState } from "react"
import useSound from "use-sound"

interface Props {
  data: CommonStatusDataMap["SHOW_START"]
}

const Start = ({
  data: { time, subject, theme: statusTheme },
}: Props) => {
  const [showTitle, setShowTitle] = useState(true)
  const [cooldown, setCooldown] = useState(time)
  const storeTheme = useGameThemeStore((s) => s.theme)
  const theme = statusTheme ?? storeTheme

  const [sfxBoump] = useSound(SFX.BOUMP_SOUND, {
    volume: 0.2,
  })

  useEvent(EVENTS.GAME.START_COOLDOWN, () => {
    sfxBoump()
    setShowTitle(false)
  })

  useEvent(EVENTS.GAME.COOLDOWN, (sec) => {
    sfxBoump()
    setCooldown(sec)
  })

  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center overflow-hidden">
      {/* 過場楓葉飄落 — 呼應「楓香班」(只 HEPING 主題顯示) */}
      {theme === "heping" && (
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="anim-falling-maple absolute"
              style={{
                left: `${(i * 13) % 95}%`,
                top: "-5%",
                animationDelay: `${i * 0.18}s`,
                animationDuration: `${2.2 + (i % 3) * 0.4}s`,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="drop-shadow-md"
                style={{
                  width: `${24 + (i % 3) * 6}px`,
                  height: `${24 + (i % 3) * 6}px`,
                  transform: `rotate(${(i * 47) % 360}deg)`,
                }}
                fill={i % 3 === 0 ? "#FB8C00" : i % 3 === 1 ? "#43A047" : "#E53935"}
                aria-hidden="true"
              >
                <path d="M12 2 L 9 8 L 4 7 L 7 12 L 3 16 L 8 17 L 12 22 L 16 17 L 21 16 L 17 12 L 20 7 L 15 8 Z" />
              </svg>
            </div>
          ))}
        </div>
      )}

      {showTitle ? (
        <div className="anim-show flex flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl">
            {subject}
          </h2>
          {theme === "heping" && (
            <p className="text-lg font-semibold text-white/80 drop-shadow">
              楓香班 揚帆出航 🌿
            </p>
          )}
        </div>
      ) : (
        <>
          <div
            className={clsx(
              `anim-show aspect-square h-32 rounded-2xl transition-all md:h-60`,
            )}
            style={{
              backgroundColor: theme === "heping" ? "#FB8C00" : "#ff9900",
              transform: `rotate(${45 * (time - cooldown)}deg)`,
            }}
          ></div>
          <span className="absolute text-6xl font-bold text-white drop-shadow-md md:text-8xl">
            {cooldown}
          </span>
        </>
      )}
    </section>
  )
}

export default Start
