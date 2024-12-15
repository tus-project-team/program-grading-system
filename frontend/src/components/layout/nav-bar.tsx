import { SidebarTrigger } from "@/components/ui/sidebar"
import { Link, useLocation } from "@tanstack/react-router"
import { type FC, Fragment } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb"

const pascalCase = (str: string) =>
  str
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ")

export const NavBar: FC = () => {
  const pathname = useLocation({
    select: (location) => {
      const pathname = location.pathname.split("/").filter(Boolean)
      if (pathname.length <= 0) return ["dashboard"]
      return pathname
    },
  })

  return (
    <div className="sticky top-0 z-50 flex flex-row items-center gap-2 border-b bg-background/60 p-2 backdrop-blur">
      <SidebarTrigger />
      <div className="h-[calc(100%-0.5rem)] w-[1px] bg-muted-foreground" />
      <Breadcrumb className="px-2">
        <BreadcrumbList>
          {pathname.map((name, index) => (
            <Fragment key={name}>
              <BreadcrumbItem>
                {index < pathname.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link
                      to={[...pathname.slice(0, Math.max(0, index)), name]
                        .join("/")
                        .replace(/^\/+/, "")}
                    >
                      {pascalCase(name)}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{pascalCase(name)}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < pathname.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
