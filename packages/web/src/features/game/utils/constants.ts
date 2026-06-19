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

// HEPING 和平實驗國小 主題配色
// 校徽是「白底、藍字、橘綠點綴」，四選項配色採用：
// A = HEPING 藍 (主色) | B = 活力橘 (點綴) | C = 翠綠 (點綴) | D = 海軍深藍 (對比)
// 跟原本的 Kahoot 紅/藍/綠/黃 不一樣，但都維持高對比、彩色四選項的 Kahoot 精神
export const ANSWERS_COLORS = [
  "bg-[#1E88E5] text-white", // A: HEPING 藍
  "bg-[#FB8C00] text-white", // B: 點綴橘
  "bg-[#43A047] text-white", // C: 點綴綠
  "bg-[#0D47A1] text-white", // D: 海軍深藍
]

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
