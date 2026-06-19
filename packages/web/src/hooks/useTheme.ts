import type { QuizzTheme } from "@razzia/common/types/game"
import { create } from "zustand"

interface GameThemeStore {
  theme: QuizzTheme
  setTheme: (_theme: QuizzTheme) => void
}

/**
 * 當前遊戲主題
 * - 預設 "default" (Razzia 經典)
 * - 從 server 廣播的 game:status 同步更新（每個 status 帶 theme 欄位）
 * - 綁定到 quizz（題庫），不是全站狀態
 */
export const useGameThemeStore = create<GameThemeStore>((set) => ({
  theme: "default",
  setTheme: (theme) => set({ theme }),
}))

/** 主題顯示名稱（給 UI 標籤用） */
export const THEME_LABELS: Record<QuizzTheme, string> = {
  default: "Razzia 經典",
  heping: "HEPING 楓香班",
}

/** 給 document title 用 */
export const THEME_TITLES: Record<QuizzTheme, string> = {
  default: "Razzia",
  heping: "HEPING 第六屆楓香班 · 畢業挑戰賽",
}
