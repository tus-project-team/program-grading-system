import { BaseLayout } from "@/components/layout/base-layout"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { HomeIcon, LayoutListIcon } from "lucide-react"
import { FC } from "react"

const StudentLayout: FC = () => {
  return (
    <BaseLayout
      base="/"
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
      ]}
    >
      <Outlet />
    </BaseLayout>
  )
}

export const Route = createFileRoute("/_student")({
  component: StudentLayout,
})
