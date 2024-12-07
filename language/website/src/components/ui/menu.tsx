import type {
  ButtonProps,
  MenuItemProps as MenuItemPrimitiveProps,
  MenuProps as MenuPrimitiveProps,
  MenuSectionProps,
  MenuTriggerProps as MenuTriggerPrimitiveProps,
  PopoverProps,
  SeparatorProps,
} from "react-aria-components"
import type { VariantProps } from "tailwind-variants"

import { IconBulletFill, IconCheck, IconChevronLgRight } from "justd-icons"
import * as React from "react"
import {
  Button,
  Collection,
  Header,
  MenuItem,
  Menu as MenuPrimitive,
  MenuSection,
  MenuTrigger as MenuTriggerPrimitive,
  Separator,
  SubmenuTrigger as SubmenuTriggerPrimitive,
} from "react-aria-components"
import { tv } from "tailwind-variants"

import {
  DropdownItemDetails,
  dropdownItemStyles,
  dropdownSectionStyles,
} from "./dropdown"
import { Keyboard } from "./keyboard"
import { Popover } from "./popover"
import { cn, cr } from "./primitive"

type MenuContextProps = {
  respectScreen: boolean
}

const MenuContext = React.createContext<MenuContextProps>({
  respectScreen: true,
})

type MenuProps = MenuTriggerPrimitiveProps & {
  respectScreen?: boolean
}

const Menu = ({ respectScreen = true, ...props }: MenuProps) => {
  return (
    <MenuContext.Provider value={{ respectScreen }}>
      <MenuTriggerPrimitive {...props}>{props.children}</MenuTriggerPrimitive>
    </MenuContext.Provider>
  )
}

const SubMenu = ({ delay = 0, ...props }) => (
  <SubmenuTriggerPrimitive {...props} delay={delay}>
    {props.children}
  </SubmenuTriggerPrimitive>
)

const menuStyles = tv({
  slots: {
    menu: "z32kk max-h-[calc(var(--visual-viewport-height)-10rem)] overflow-auto rounded-xl p-1 outline outline-0 [clip-path:inset(0_0_0_0_round_calc(var(--radius)-2px))] sm:max-h-[inherit]",
    popover: "z-50 min-w-40 p-0 shadow-sm outline-none",
    trigger: [
      "relative inline text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-primary pressed:outline-none",
    ],
  },
})

const { menu, popover, trigger } = menuStyles()

type MenuTriggerProps = ButtonProps & {
  className?: string
}

const Trigger = ({ className, ...props }: MenuTriggerProps) => (
  <Button className={trigger({ className })} {...props}>
    {(values) => (
      <>
        {typeof props.children === "function"
          ? props.children(values)
          : props.children}
      </>
    )}
  </Button>
)

type MenuContentProps<T> = MenuPrimitiveProps<T> &
  Omit<PopoverProps, "children" | "style"> & {
    className?: string
    popoverClassName?: string
    respectScreen?: boolean
    showArrow?: boolean
  }

const Content = <T extends object>({
  className,
  popoverClassName,
  showArrow = false,
  ...props
}: MenuContentProps<T>) => {
  const { respectScreen } = React.useContext(MenuContext)
  return (
    <Popover.Content
      className={popover({
        className: cn([
          showArrow &&
            "placement-left:mt-[-0.38rem] placement-right:mt-[-0.38rem]",
          popoverClassName,
        ]),
      })}
      respectScreen={respectScreen}
      showArrow={showArrow}
      {...props}
    >
      <MenuPrimitive className={menu({ className })} {...props} />
    </Popover.Content>
  )
}

type MenuItemProps = Omit<MenuItemPrimitiveProps, "isDanger"> &
  VariantProps<typeof dropdownItemStyles> & {
    isDanger?: boolean
  }

const Item = ({
  children,
  className,
  isDanger = false,
  ...props
}: MenuItemProps) => {
  const textValue =
    props.textValue || (typeof children === "string" ? children : undefined)
  return (
    <MenuItem
      className={cr(className, (className, renderProps) =>
        dropdownItemStyles({
          ...renderProps,
          className,
        }),
      )}
      data-danger={isDanger ? "true" : undefined}
      textValue={textValue}
      {...props}
    >
      {(values) => (
        <>
          {typeof children === "function" ? children(values) : children}
          {values.hasSubmenu && (
            <IconChevronLgRight className="gpfw ml-auto size-3.5" />
          )}
        </>
      )}
    </MenuItem>
  )
}

export type MenuHeaderProps = React.ComponentProps<typeof Header> & {
  separator?: boolean
}

const MenuHeader = ({
  className,
  separator = false,
  ...props
}: MenuHeaderProps) => (
  <Header
    className={cn(
      "p-2 text-base font-semibold sm:text-sm",
      separator && "-mx-1 border-b px-3 pb-[0.625rem]",
      className,
    )}
    {...props}
  />
)

const MenuSeparator = ({ className, ...props }: SeparatorProps) => (
  <Separator className={cn("-mx-1 my-1 h-px border-b", className)} {...props} />
)

const Checkbox = ({ children, className, ...props }: MenuItemProps) => (
  <Item className={cn("relative pr-8", className)} {...props}>
    {(values) => (
      <>
        {typeof children === "function" ? children(values) : children}
        {values.isSelected && (
          <span className="absolute right-2 flex size-4 shrink-0 items-center justify-center animate-in">
            <IconCheck />
          </span>
        )}
      </>
    )}
  </Item>
)

const Radio = ({ children, className, ...props }: MenuItemProps) => (
  <Item className={cn("relative", className)} {...props}>
    {(values) => (
      <>
        {typeof children === "function" ? children(values) : children}

        {values.isSelected && (
          <span
            className="absolute right-3 flex items-center justify-center animate-in"
            data-slot="menu-radio"
          >
            <IconBulletFill />
          </span>
        )}
      </>
    )}
  </Item>
)

const { header, section } = dropdownSectionStyles()

type SectionProps<T> = MenuSectionProps<T> & {
  title?: string
}

const Section = <T extends object>({
  className,
  ...props
}: SectionProps<T>) => {
  return (
    <MenuSection className={section({ className })} {...props}>
      {"title" in props && <Header className={header()}>{props.title}</Header>}
      <Collection items={props.items}>{props.children}</Collection>
    </MenuSection>
  )
}

Menu.Primitive = MenuPrimitive
Menu.Content = Content
Menu.Header = MenuHeader
Menu.Item = Item
Menu.Content = Content
Menu.Keyboard = Keyboard
Menu.Checkbox = Checkbox
Menu.Radio = Radio
Menu.Section = Section
Menu.Separator = MenuSeparator
Menu.Trigger = Trigger
Menu.ItemDetails = DropdownItemDetails
Menu.Submenu = SubMenu

export { Menu, type MenuContentProps }
