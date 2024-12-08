import type {
  ButtonProps as ButtonPrimitiveProps,
  DialogProps,
  HeadingProps,
} from "react-aria-components"

import { IconX } from "justd-icons"
import * as React from "react"
import {
  Button as ButtonPrimitive,
  Dialog as DialogPrimitive,
  Heading,
  OverlayTriggerStateContext,
} from "react-aria-components"
import { tv } from "tailwind-variants"

import { Button, type ButtonProps } from "./button"
import { useMediaQuery } from "./primitive"

const dialogStyles = tv({
  slots: {
    body: [
      "flex flex-1 flex-col gap-2 overflow-auto px-4 py-1 sm:px-6",
      "max-h-[calc(var(--visual-viewport-height)-var(--visual-viewport-vertical-padding)-var(--dialog-header-height,0px)-var(--dialog-footer-height,0px))]",
    ],
    closeIndicator:
      "close absolute right-1 top-1 z-50 grid size-8 place-content-center rounded-xl hover:bg-secondary focus:bg-secondary focus:outline-none focus-visible:ring-1 focus-visible:ring-primary sm:right-2 sm:top-2 sm:size-7 sm:rounded-md",
    description: "mt-0.5 block text-sm text-muted-fg sm:mt-1",
    footer:
      "mt-auto flex flex-col-reverse justify-between gap-3 pb-4 pt-4 sm:flex-row sm:pb-6",
    header: "relative flex flex-col pb-3 pt-4 sm:pt-6",
    root: [
      "dlc relative flex max-h-[inherit] flex-col overflow-hidden outline-none [scrollbar-width:thin] [&::-webkit-scrollbar]:size-0.5",
      "sm:[&:has([data-slot=dialog-body])_[data-slot=dialog-footer]]:px-6 sm:[&:has([data-slot=dialog-body])_[data-slot=dialog-header]]:px-6 sm:[&:not(:has([data-slot=dialog-body]))]:px-6",
      "[&:has([data-slot=dialog-body])_[data-slot=dialog-footer]]:px-4 [&:has([data-slot=dialog-body])_[data-slot=dialog-header]]:px-4 [&:not(:has([data-slot=dialog-body]))]:px-4",
    ],
  },
})

const { body, closeIndicator, description, footer, header, root } =
  dialogStyles()

const Dialog = ({ className, role, ...props }: DialogProps) => {
  return (
    <DialogPrimitive
      className={root({ className })}
      role={role ?? "dialog"}
      {...props}
    />
  )
}

const Trigger = (props: ButtonPrimitiveProps) => (
  <ButtonPrimitive {...props}>
    {(values) => (
      <>
        {typeof props.children === "function"
          ? props.children(values)
          : props.children}
      </>
    )}
  </ButtonPrimitive>
)

type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  description?: string
  title?: string
}

const Header = ({ className, ...props }: DialogHeaderProps) => {
  const headerRef = React.useRef<HTMLHeadingElement>(null)

  React.useEffect(() => {
    const header = headerRef.current
    if (!header) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        header.parentElement?.style.setProperty(
          "--dialog-header-height",
          `${entry.target.clientHeight}px`,
        )
      }
    })

    observer.observe(header)
    return () => observer.unobserve(header)
  }, [])

  return (
    <div
      className={header({ className })}
      data-slot="dialog-header"
      ref={headerRef}
    >
      {props.title && <Title>{props.title}</Title>}
      {props.description && <Description>{props.description}</Description>}
      {!props.title && typeof props.children === "string" ? (
        <Title {...props} />
      ) : (
        props.children
      )}
    </div>
  )
}

const titleStyles = tv({
  base: "flex flex-1 items-center text-fg",
  variants: {
    level: {
      1: "text-lg font-semibold sm:text-xl",
      2: "text-lg font-semibold sm:text-xl",
      3: "text-base font-semibold sm:text-lg",
      4: "text-base font-semibold",
    },
  },
})

type TitleProps = Omit<HeadingProps, "level"> & {
  level?: 1 | 2 | 3 | 4
}

const Title = ({ className, level = 2, ...props }: TitleProps) => (
  <Heading
    className={titleStyles({ className, level })}
    level={level}
    slot="title"
    {...props}
  />
)

const Description = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={description({ className })} {...props} />
)

const Body = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={body({ className })} data-slot="dialog-body" {...props} />
)

const Footer = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const footerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const footer = footerRef.current

    if (!footer) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        footer.parentElement?.style.setProperty(
          "--dialog-footer-height",
          `${entry.target.clientHeight}px`,
        )
      }
    })

    observer.observe(footer)
    return () => {
      observer.unobserve(footer)
    }
  }, [])
  return (
    <div
      className={footer({ className })}
      data-slot="dialog-footer"
      ref={footerRef}
      {...props}
    />
  )
}

const Close = ({
  appearance = "outline",
  className,
  ...props
}: ButtonProps) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const state = React.useContext(OverlayTriggerStateContext)!
  return (
    <Button
      appearance={appearance}
      className={className}
      onPress={() => state.close()}
      {...props}
    />
  )
}

type CloseButtonIndicatorProps = {
  className?: string
  close: () => void
  isDismissable?: boolean | undefined
}

const CloseIndicator = ({ className, ...props }: CloseButtonIndicatorProps) => {
  const isMobile = useMediaQuery("(max-width: 600px)")
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (isMobile && buttonRef.current) {
      buttonRef.current.focus()
    }
  }, [isMobile])
  return props.isDismissable ? (
    <ButtonPrimitive
      ref={buttonRef}
      {...(isMobile ? { autoFocus: true } : {})}
      aria-label="Close"
      className={closeIndicator({ className })}
      onPress={props.close}
    >
      <IconX className="size-4" />
    </ButtonPrimitive>
  ) : null
}

Dialog.Trigger = Trigger
Dialog.Header = Header
Dialog.Title = Title
Dialog.Description = Description
Dialog.Body = Body
Dialog.Footer = Footer
Dialog.Close = Close
Dialog.CloseIndicator = CloseIndicator

export { Dialog }
