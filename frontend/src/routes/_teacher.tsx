import { BaseLayout } from "@/components/layout/base-layout"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { HomeIcon, LayoutListIcon, ListChecksIcon } from "lucide-react"
import { FC } from "react"

const TeacherLayout: FC = () => {
  return (
    <BaseLayout
      base="/admin/"
      items={[
        {
          href: "",
          icon: HomeIcon,
          title: "Dashboard",
          type: "link",
        },
        {
          href: "problems",
          icon: LayoutListIcon,
          title: "Problems",
          type: "link",
        },
        {
          href: "submissions",
          icon: ListChecksIcon,
          title: "Submissions",
          type: "link",
        },
      ]}
    >
      <Outlet />
    </BaseLayout>
  )
}

export const Route = createFileRoute("/_teacher")({
  component: TeacherLayout,
})
