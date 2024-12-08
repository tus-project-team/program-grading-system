import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import * as UI from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Link, useLocation } from "@tanstack/react-router"
import { cva } from "class-variance-authority"
import { FC } from "react"

export type ItemGroup = {
  children: ItemLink[]
  href: string
  icon: FC
  title: string
  type: "group"
}

export type ItemLink = {
  href: string
  icon: FC
  title: string
  type: "link"
}

export type Item = ItemGroup | ItemLink

const linkVariants = cva("", {
  defaultVariants: {
    active: false,
  },
  variants: {
    active: {
      false: "",
      true: "font-bold",
    },
  },
})

type MenuItemProps = {
  item: Item
  pathname: string
}

const SidebarMenuItem: FC<MenuItemProps> = ({ item, pathname }) => {
  return (
    <UI.SidebarMenu key={item.href}>
      {item.type === "group" ? (
        <Collapsible className="group/collapsible">
          <UI.SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <UI.SidebarMenuButton
                className={linkVariants({ active: pathname === item.href })}
              >
                <item.icon />
                <span>{item.title}</span>
              </UI.SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {item.children.map((child) => (
                <UI.SidebarMenuSub key={child.href}>
                  <UI.SidebarMenuSubItem>
                    <Link
                      className={linkVariants({
                        active: pathname === item.href,
                      })}
                      to={child.href}
                    >
                      <child.icon />
                      <span>{child.title}</span>
                    </Link>
                  </UI.SidebarMenuSubItem>
                </UI.SidebarMenuSub>
              ))}
            </CollapsibleContent>
          </UI.SidebarMenuItem>
        </Collapsible>
      ) : (
        <UI.SidebarMenuItem>
          <UI.SidebarMenuButton asChild>
            <Link
              className={linkVariants({ active: pathname === item.href })}
              to={item.href}
            >
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </UI.SidebarMenuButton>
        </UI.SidebarMenuItem>
      )}
    </UI.SidebarMenu>
  )
}

export type SidebarProps = {
  items: Item[]
}

export const Sidebar: FC<SidebarProps> = ({ items }) => {
  const pathname = useLocation({
    select: (location) => {
      const pathname = location.pathname
      if (pathname === "" || pathname === "/") return "/"
      if (pathname.endsWith("/")) return pathname.slice(0, -1)
      return pathname
    },
  })
  console.dir({ items, pathname })

  return (
    <UI.Sidebar>
      <UI.SidebarHeader />
      <UI.SidebarContent>
        <UI.SidebarGroup>
          <UI.SidebarGroupContent>
            {items.map((item) => (
              <SidebarMenuItem
                item={item}
                key={item.href}
                pathname={pathname}
              />
            ))}
          </UI.SidebarGroupContent>
        </UI.SidebarGroup>
      </UI.SidebarContent>
    </UI.Sidebar>
  )
}
