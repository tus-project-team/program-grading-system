import { IconCheck } from "justd-icons"
import {
  Collection,
  Header,
  ListBoxItem as ListBoxItemPrimitive,
  type ListBoxItemProps,
  ListBoxSection,
  type SectionProps,
  Text,
  type TextProps,
} from "react-aria-components"
import { tv } from "tailwind-variants"

import { cn, cr } from "./primitive"

const dropdownItemStyles = tv({
  base: [
    "forced-color:text-[Highlight] group relative flex cursor-default select-none items-center gap-x-1.5 rounded-[calc(var(--radius)-1px)] px-2.5 py-2 text-base text-fg outline outline-0 forced-color-adjust-none lg:text-sm forced-colors:text-[LinkText]",
    "has-submenu:open:data-[danger=true]:bg-danger/20 has-submenu:open:data-[danger=true]:text-danger",
    "has-submenu:open:bg-accent has-submenu:open:text-accent-fg [&[data-has-submenu][data-open]_.text-muted-fg]:text-accent-fg [&[data-has-submenu][data-open]_[data-slot=icon]]:text-accent-fg",
    "[&_[data-slot=avatar]]:-mr-0.5 [&_[data-slot=avatar]]:size-6 sm:[&_[data-slot=avatar]]:size-5",
    "[&[data-danger]_[data-slot=icon]]:text-danger/60 [&[data-focused][data-danger]_[data-slot=icon]]:text-danger-fg [&[data-focused]_[data-slot=icon]]:text-accent-fg [&[data-hovered]_[data-slot=icon]]:text-accent-fg [&_[data-slot=icon]]:size-4 [&_[data-slot=icon]]:shrink-0 [&_[data-slot=icon]]:text-muted-fg",
    "[&_[data-slot=menu-radio]>[data-slot=icon]]:size-3",
    "forced-colors:[&_[data-slot=icon]]:text-[CanvasText] forced-colors:[&_[data-slot=icon]]:group-data-[focus]:text-[Canvas]",
  ],
  compoundVariants: [
    {
      className: "bg-secondary",
      isFocused: false,
      isOpen: true,
    },
  ],
  variants: {
    isDisabled: {
      true: "text-muted-fg forced-colors:text-[GrayText]",
    },
    isFocused: {
      false: "data-[danger=true]:text-danger",
      true: [
        "bg-accent text-accent-fg forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]",
        "data-[danger=true]:bg-danger data-[danger=true]:text-danger-fg",
        "[&[data-slot=description]]:text-accent-fg [&[data-slot=label]]:text-accent-fg [&_.text-muted-fg]:text-accent-fg/80",
      ],
    },
  },
})

const dropdownSectionStyles = tv({
  slots: {
    header:
      "sticky -top-[5px] z-10 -mx-1 -mb-0.5 min-w-[--trigger-width] truncate border-y bg-tertiary px-4 py-2 text-sm font-medium text-muted-fg supports-[-moz-appearance:none]:bg-tertiary [&+*]:mt-1",
    section:
      "xss3 flex flex-col gap-y-0.5 after:block after:h-[5px] after:content-[''] first:-mt-[5px]",
  },
})

const { header, section } = dropdownSectionStyles()

type DropdownSectionProps<T> = SectionProps<T> & {
  title?: string
}

const DropdownSection = <T extends object>({
  className,
  ...props
}: DropdownSectionProps<T>) => {
  return (
    <ListBoxSection className={section({ className })}>
      {"title" in props && <Header className={header()}>{props.title}</Header>}
      <Collection items={props.items}>{props.children}</Collection>
    </ListBoxSection>
  )
}

const DropdownItem = ({ className, ...props }: ListBoxItemProps) => {
  const textValue =
    props.textValue ||
    (typeof props.children === "string" ? props.children : undefined)
  return (
    <ListBoxItemPrimitive
      className={cr(className, (className, renderProps) =>
        dropdownItemStyles({ ...renderProps, className }),
      )}
      textValue={textValue}
      {...props}
    >
      {cr(props.children, (children, { isSelected }) => (
        <>
          <span className="flex flex-1 items-center gap-2 truncate font-normal group-selected:font-medium">
            {children}
          </span>

          {isSelected && (
            <span className="absolute right-2 top-3 lg:top-2.5">
              <IconCheck />
            </span>
          )}
        </>
      ))}
    </ListBoxItemPrimitive>
  )
}

type DropdownItemSlot = TextProps & {
  classNames?: {
    description?: TextProps["className"]
    label?: TextProps["className"]
  }
  description?: TextProps["children"]
  label?: TextProps["children"]
}

const DropdownItemDetails = ({
  classNames,
  description,
  label,
  ...props
}: DropdownItemSlot) => {
  const { children, slot, title, ...restProps } = props

  return (
    <div className="flex flex-col gap-y-1" {...restProps}>
      {label && (
        <Text
          className={cn("font-medium lg:text-sm", classNames?.label)}
          slot={slot ?? "label"}
          {...restProps}
        >
          {label}
        </Text>
      )}
      {description && (
        <Text
          className={cn("text-xs text-muted-fg", classNames?.description)}
          slot={slot ?? "description"}
          {...restProps}
        >
          {description}
        </Text>
      )}
      {!title && children}
    </div>
  )
}

// Note: This is not exposed component, but it's used in other components to render dropdowns.
export {
  DropdownItem,
  DropdownItemDetails,
  dropdownItemStyles,
  DropdownSection,
  dropdownSectionStyles,
}
