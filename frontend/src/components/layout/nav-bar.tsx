import type { FC } from "react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Link, useLocation } from "@tanstack/react-router"

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
    <div className="flex flex-row items-center gap-2 border-b p-2">
      <SidebarTrigger />
      <div className="h-[calc(100%-0.5rem)] w-[1px] bg-muted-foreground" />
      <Breadcrumb className="px-2">
        <BreadcrumbList>
          {pathname.map((name, index) => (
            <>
              <BreadcrumbItem key={name}>
                {index < pathname.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link
                      from={pathname.slice(0, Math.max(0, index - 1)).join("/")}
                      to={name}
                    >
                      {pascalCase(name)}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{pascalCase(name)}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < pathname.length - 1 && (
                <BreadcrumbSeparator key={name + "separator"} />
              )}
            </>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
