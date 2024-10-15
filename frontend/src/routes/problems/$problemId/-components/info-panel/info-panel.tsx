import type { ComponentPropsWithoutRef, FC } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { Submissions } from "./submissions"
import { TestCases } from "./test-cases"
import { TestResults } from "./test-results"

export type InfoPanelProps = ComponentPropsWithoutRef<"div">

export const InfoPanel: FC<InfoPanelProps> = ({ className, ...props }) => {
  return (
    <div className={cn("h-full p-2", className)} {...props}>
      <Tabs className="flex h-full flex-col" defaultValue="submissions">
        <TabsList className="mr-auto">
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
        </TabsList>
        <TabsContent className="flex-1 overflow-y-auto" value="submissions">
          <Submissions />
        </TabsContent>
        <TabsContent value="tests">
          <TestResults />
        </TabsContent>
        <TabsContent value="test-cases">
          <TestCases />
        </TabsContent>
      </Tabs>
    </div>
  )
}
