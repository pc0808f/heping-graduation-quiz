import { MEDIA_TYPES } from "@razzia/common/constants"
import type { AnswerOption } from "@razzia/common/types/game"
import { z } from "zod"

// 接受一般 http(s) 網址，或上傳圖片轉成的內嵌 data: URI（base64）
const isHttpOrDataUrl = (v: string) =>
  /^https?:\/\//u.test(v) || v.startsWith("data:")

export const questionMediaValidator = z.object({
  type: z
    .enum([MEDIA_TYPES.IMAGE, MEDIA_TYPES.VIDEO, MEDIA_TYPES.AUDIO])
    .optional(),
  url: z
    .string()
    .min(1, "errors:quizz.invalidMediaUrl")
    .refine(isHttpOrDataUrl, "errors:quizz.invalidMediaUrl"),
})

// 答案物件：至少要有 text 或 image 其中之一
const answerObjectValidator = z
  .object({
    text: z.string().min(1, "errors:quizz.answerEmpty").optional(),
    image: z
      .string()
      .refine(
        (v) => /^https?:\/\//u.test(v) || v.startsWith("data:image/"),
        "errors:quizz.invalidImageUrl",
      )
      .optional(),
  })
  .refine((a) => Boolean(a.text?.trim()) || Boolean(a.image?.trim()), {
    message: "errors:quizz.answerEmpty",
  })

// 答案 union：向後相容舊的「純字串」格式，自動 transform 成 { text }
// 新格式：{ text?, image? }，至少要有一個
export const answerValidator = z.union([
  z
    .string()
    .min(1, "errors:quizz.answerEmpty")
    .transform((v) => ({ text: v })),
  answerObjectValidator,
])

const questionValidator = z.object({
  question: z.string().min(1, "errors:quizz.questionEmpty"),
  media: questionMediaValidator.optional(),
  answers: z
    .array(answerValidator)
    .min(2, "errors:quizz.tooFewAnswers")
    .max(4, "errors:quizz.tooManyAnswers"),
  solutions: z
    .union([z.number().int().min(0), z.array(z.number().int().min(0)).min(1)])
    .transform((v) => (Array.isArray(v) ? v : [v])),
  cooldown: z.number().int().min(3).max(15),
  time: z.number().int().min(-1),
})

export const quizzValidator = z.object({
  subject: z.string().min(1, "errors:quizz.subjectEmpty"),
  theme: z.enum(["default", "heping"]).optional().default("default"),
  music: z.enum(["default", "ocean", "none"]).optional().default("default"),
  questions: z.array(questionValidator).min(1, "errors:quizz.noQuestions"),
})

export type QuizzValidated = z.infer<typeof quizzValidator>

export type AnswerValidated = z.infer<typeof answerObjectValidator> &
  AnswerOption
