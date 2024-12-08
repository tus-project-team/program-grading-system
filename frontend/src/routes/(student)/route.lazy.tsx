import { BaseLayout } from "@/components/layout/base-layout"
import { createLazyFileRoute, Outlet } from "@tanstack/react-router"
import { HomeIcon, LayoutListIcon } from "lucide-react"
import { FC } from "react"

const StudentLayout: FC = () => {
  return (
    <BaseLayout
      items={[
        {
          href: "/",
          icon: HomeIcon,
          title: "Dashboard",
          type: "link",
        },
        {
          href: "/problems",
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

export const Route = createLazyFileRoute("/(student)")({
  component: StudentLayout,
})
