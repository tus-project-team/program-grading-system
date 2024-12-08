import { FC, ReactNode } from "react"

import * as UI from "../ui/sidebar"
import { NavBar } from "./nav-bar"
import { Item, Sidebar } from "./sidebar"

export type BaseLayoutProps = {
  children?: ReactNode
  items: Item[]
}

export const BaseLayout: FC<BaseLayoutProps> = ({ children, items }) => {
  return (
    <UI.SidebarProvider>
      <Sidebar items={items} />
      <div className="flex w-full flex-col">
        <NavBar />
        {children}
      </div>
    </UI.SidebarProvider>
  )
}
