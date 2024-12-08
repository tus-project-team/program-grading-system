import logoUrl from "@/assets/logo.jpg"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import * as UI from "@/components/ui/sidebar"
import { Link, useLocation } from "@tanstack/react-router"
import { cva } from "class-variance-authority"
import { LogOutIcon, SettingsIcon, UserIcon } from "lucide-react"
import { FC } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

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

const SidebarHeader = () => {
  return (
    <UI.SidebarHeader>
      <UI.SidebarMenu>
        <UI.SidebarMenuItem>
          <UI.SidebarMenuButton asChild size="lg">
            <Link className="space-x-1" to="/">
              <Avatar className="flex aspect-square size-8 items-center justify-center rounded-lg">
                <AvatarImage src={logoUrl} />
                <AvatarFallback>SH</AvatarFallback>
              </Avatar>
              <div className="flex leading-none">
                <span className="font-semibold">Shuiro</span>
              </div>
            </Link>
          </UI.SidebarMenuButton>
        </UI.SidebarMenuItem>
      </UI.SidebarMenu>
    </UI.SidebarHeader>
  )
}

const SidebarFooter = () => {
  return (
    <UI.SidebarFooter>
      <UI.SidebarMenu>
        <UI.SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <UI.SidebarMenuButton
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                size="lg"
              >
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage
                    src="https://example.com" // TODO: replace with actual user avatar
                  />
                  <AvatarFallback>
                    {/* TODO: replace with actual user initial name */}
                    TY
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {/* TODO: replace with actual user name */}
                    山田 太郎
                  </span>
                  <span className="truncate text-xs">
                    {/* TODO: replace with actual user email */}
                    hello@example.com
                  </span>
                </div>
              </UI.SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  {/* TODO: link to a profile page */}
                  <UserIcon />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {/* TODO: link to a settings page */}
                  <SettingsIcon />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  {/* TODO: implement sign out logic or link to a sign out page */}
                  <LogOutIcon />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </UI.SidebarMenuItem>
      </UI.SidebarMenu>
    </UI.SidebarFooter>
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

  return (
    <UI.Sidebar>
      <SidebarHeader />
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
      <SidebarFooter />
      <UI.SidebarRail />
    </UI.Sidebar>
  )
}
