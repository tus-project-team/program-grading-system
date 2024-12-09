import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { type ComponentPropsWithoutRef, FC } from "react"

import { useProblem } from "../../-hooks/use-problem"

export type LanguageSelectorProps = ComponentPropsWithoutRef<"div">

export const LanguageSelector: FC<LanguageSelectorProps> = ({
  className,
  ...props
}) => {
  const { language, problem, setLanguage } = useProblem()

  return (
    <div className={cn("w-full max-w-36", className)} {...props}>
      <Select
        onValueChange={(language) => setLanguage(JSON.parse(language))}
        value={JSON.stringify(language)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select programming language" />
        </SelectTrigger>
        <SelectContent>
          {problem.data.supported_languages.map((language) => (
            <SelectItem
              key={`${language.name}-${language.version}`}
              value={JSON.stringify(language)}
            >
              {language.name} ({language.version})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
