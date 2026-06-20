import { EVENTS } from "@razzia/common/constants"
import Answers from "@razzia/web/features/game/components/states/Answers"
import Leaderboard from "@razzia/web/features/game/components/states/Leaderboard"
import PlayerFinished from "@razzia/web/features/game/components/states/PlayerFinished"
import Podium from "@razzia/web/features/game/components/states/Podium"
import Prepared from "@razzia/web/features/game/components/states/Prepared"
import Question from "@razzia/web/features/game/components/states/Question"
import Responses from "@razzia/web/features/game/components/states/Responses"
import Result from "@razzia/web/features/game/components/states/Result"
import Room from "@razzia/web/features/game/components/states/Room"
import Start from "@razzia/web/features/game/components/states/Start"
import Wait from "@razzia/web/features/game/components/states/Wait"

import { STATUS } from "@razzia/common/types/game/status"
import type { QuizzTheme } from "@razzia/common/types/game"

// Razzia 原本的四選項配色（Color Universal Design）
const ANSWERS_COLORS_DEFAULT = [
  "bg-[#E69F00] text-white",
  "bg-[#56B4E9] text-white",
  "bg-[#3DBFA0] text-white",
  "bg-[#CC79A7] text-white",
]

// HEPING 和平實驗國小 楓香班 主題配色
// 校徽是「白底、藍字、橘綠點綴」：
// A = HEPING 藍 (主色) | B = 活力橘 (點綴) | C = 翠綠 (點綴) | D = 海軍深藍 (對比)
const ANSWERS_COLORS_HEPING = [
  "bg-[#1E88E5] text-white",
  "bg-[#FB8C00] text-white",
  "bg-[#43A047] text-white",
  "bg-[#0D47A1] text-white",
]

/** 依主題取得四選項配色（向後相容：未傳入 theme 視為 default） */
export const getAnswerColors = (theme?: QuizzTheme): readonly string[] => {
  if (theme === "heping") return ANSWERS_COLORS_HEPING
  return ANSWERS_COLORS_DEFAULT
}

/** 向後相容：保留原本的 ANSWERS_COLORS 變數（給沒改完的舊呼叫端用） */
export const ANSWERS_COLORS = ANSWERS_COLORS_DEFAULT

export const ANSWERS_LABELS = ["A", "B", "C", "D"]

export const GAME_STATES = {
  status: {
    name: STATUS.WAIT,
    data: { text: "Waiting for the players" },
  },
  question: {
    current: 1,
    total: null,
  },
}

export const GAME_STATE_COMPONENTS = {
  [STATUS.SELECT_ANSWER]: Answers,
  [STATUS.SHOW_QUESTION]: Question,
  [STATUS.WAIT]: Wait,
  [STATUS.SHOW_START]: Start,
  [STATUS.SHOW_RESULT]: Result,
  [STATUS.SHOW_PREPARED]: Prepared,
  [STATUS.FINISHED]: PlayerFinished,
}

export const GAME_STATE_COMPONENTS_MANAGER = {
  ...GAME_STATE_COMPONENTS,
  [STATUS.SHOW_ROOM]: Room,
  [STATUS.SHOW_RESPONSES]: Responses,
  [STATUS.SHOW_LEADERBOARD]: Leaderboard,
  [STATUS.FINISHED]: Podium,
}

export const SFX = {
  ANSWERS: {
    MUSIC: "/sounds/answersMusic.mp3",
    SOUND: "/sounds/answersSound.mp3",
  },
  PODIUM: {
    THREE: "/sounds/three.mp3",
    SECOND: "/sounds/second.mp3",
    FIRST: "/sounds/first.mp3",
    SNEAR_ROOL: "/sounds/snearRoll.mp3",
  },
  RESULTS_SOUND: "/sounds/results.mp3",
  SHOW_SOUND: "/sounds/show.mp3",
  BOUMP_SOUND: "/sounds/boump.mp3",
} as const

/**
 * 答題時背景音樂（依 quizz.music 設定）
 * - "default"：Razzia 預設（answersMusic.mp3，Kahoot-style 緊張音樂）
 * - "ocean"：海浪 / 蘭嶼風（需要放 ocean.mp3 到 public/sounds/，見 README）
 * - "none"：關閉音樂
 */
export const MUSIC_BY_THEME: Record<string, string | null> = {
  default: "/sounds/answersMusic.mp3",
  ocean: "/sounds/ocean.mp3",
  none: null,
}

export const getMusicUrl = (music?: string): string | null => {
  if (!music) return MUSIC_BY_THEME.default ?? null
  return MUSIC_BY_THEME[music] ?? null
}

export const MUSIC_LABELS: Record<string, string> = {
  default: "預設音樂",
  ocean: "海洋 / 蘭嶼風",
  none: "關閉音樂",
}

export const MANAGER_SKIP_EVENTS = {
  [STATUS.SHOW_ROOM]: EVENTS.MANAGER.START_GAME,
  [STATUS.SELECT_ANSWER]: EVENTS.MANAGER.ABORT_QUIZ,
  [STATUS.SHOW_RESPONSES]: EVENTS.MANAGER.SHOW_LEADERBOARD,
  [STATUS.SHOW_LEADERBOARD]: EVENTS.MANAGER.NEXT_QUESTION,
} as const satisfies Partial<
  Record<keyof typeof GAME_STATE_COMPONENTS_MANAGER, string>
>

export function isKeyOf<T extends object>(
  obj: T,
  key: string,
): key is keyof T & string {
  return key in obj
}

export const MANAGER_SKIP_BTN = {
  [STATUS.SHOW_ROOM]: "game:startGame",
  [STATUS.SHOW_START]: null,
  [STATUS.SHOW_PREPARED]: null,
  [STATUS.SHOW_QUESTION]: null,
  [STATUS.SELECT_ANSWER]: "common:skip",
  [STATUS.SHOW_RESULT]: null,
  [STATUS.SHOW_RESPONSES]: "common:next",
  [STATUS.SHOW_LEADERBOARD]: "common:next",
  [STATUS.FINISHED]: "common:exit",
  [STATUS.WAIT]: null,
}
