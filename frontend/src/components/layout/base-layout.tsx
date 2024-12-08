import { FC, ReactNode } from "react"

import * as UI from "../ui/sidebar"
import { NavBar } from "./nav-bar"
import { Item, Sidebar } from "./sidebar"

export type BaseLayoutProps = {
  base: string
  children?: ReactNode
  items: Item[]
}

export const BaseLayout: FC<BaseLayoutProps> = ({ base, children, items }) => {
  return (
    <UI.SidebarProvider>
      <Sidebar base={base} items={items} />
      <div className="flex w-full flex-col">
        <NavBar />
        {children}
      </div>
    </UI.SidebarProvider>
  )
}
