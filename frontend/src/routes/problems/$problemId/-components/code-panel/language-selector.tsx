import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FC, type ComponentPropsWithoutRef } from "react"
import { useProblem } from "../../-contexts/problem-context/problem-context"
import { cn } from "@/lib/utils"

export type LanguageSelectorProps = ComponentPropsWithoutRef<"div">

export const LanguageSelector: FC<LanguageSelectorProps> = ({
  className,
  ...props
}) => {
  const { problem, language, setLanguage } = useProblem()

  return (
    <div className={cn("w-full max-w-36", className)} {...props}>
      <Select
        value={JSON.stringify(language)}
        onValueChange={(language) => setLanguage(JSON.parse(language))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select programming language" />
        </SelectTrigger>
        <SelectContent>
          {problem.supported_languages.map((language) => (
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
