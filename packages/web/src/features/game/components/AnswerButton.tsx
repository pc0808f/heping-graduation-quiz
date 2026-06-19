import type { AnswerOption } from "@razzia/common/types/game"
import clsx from "clsx"
import { Check, X } from "lucide-react"
import type { ButtonHTMLAttributes } from "react"

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  answer: AnswerOption
  label: string
  correct?: boolean
}

const AnswerButton = ({
  className,
  answer,
  label,
  correct,
  ...otherProps
}: Props) => {
  const CorrectIcon = correct ? Check : X
  const hasImage = Boolean(answer.image?.trim())
  const hasText = Boolean(answer.text?.trim())
  const imageOnly = hasImage && !hasText

  return (
    <button
      className={clsx(
        "relative flex items-center gap-3 overflow-hidden rounded-2xl text-left",
        imageOnly ? "p-2" : "px-4 py-6",
        className,
      )}
      {...otherProps}
    >
      <span
        className={clsx(
          "flex shrink-0 items-center justify-center rounded bg-black/20 font-bold text-white",
          imageOnly
            ? "absolute top-1.5 left-1.5 size-6 text-xs"
            : "size-5 text-sm sm:size-7 sm:rounded-md md:size-8 md:text-base",
        )}
      >
        {label}
      </span>
      {hasImage && (
        <img
          src={answer.image}
          alt={answer.text || label}
          className={clsx(
            "shrink-0 object-contain",
            imageOnly
              ? "max-h-24 max-w-full flex-1 sm:max-h-32 md:max-h-40"
              : "size-12 sm:size-16 md:size-20",
          )}
        />
      )}
      {hasText && (
        <p className="w-full flex-1 text-sm break-all drop-shadow-md md:text-lg">
          {answer.text}
        </p>
      )}
      {correct !== undefined && (
        <CorrectIcon className="size-4 stroke-6 md:size-6" />
      )}
    </button>
  )
}

export default AnswerButton
