import type { ComponentPropsWithoutRef, FC } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type InfoPanelProps = ComponentPropsWithoutRef<"div">

export const InfoPanel: FC<InfoPanelProps> = ({ className, ...props }) => {
  return (
    <div className={cn("p-2", className)} {...props}>
      <Tabs defaultValue="submissions">
        <TabsList>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
        </TabsList>
        <TabsContent value="submissions">Submissions</TabsContent>
        <TabsContent value="tests">Tests</TabsContent>
        <TabsContent value="test-cases">Test Cases</TabsContent>
      </Tabs>
    </div>
  )
}
