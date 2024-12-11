import * as React from "react"
import {
  Button as ButtonPrimitive,
  type ButtonProps as ButtonPrimitiveProps,
} from "react-aria-components"
import { tv } from "tailwind-variants"

import { cr, focusButtonStyles } from "./primitive"

const buttonStyles = tv(
  {
    base: [
      "kbt32x relative isolate box-border inline-flex items-center justify-center gap-x-2 border font-medium no-underline before:absolute after:absolute",
      "hover:cursor-pointer forced-colors:[--button-icon:ButtonText] forced-colors:hover:[--button-icon:ButtonText]",
      "[&>[data-slot=icon]]:-mx-0.5 [&>[data-slot=icon]]:my-1 [&>[data-slot=icon]]:size-4 [&>[data-slot=icon]]:shrink-0 [&>[data-slot=icon]]:text-[--button-icon]",
    ],
    defaultVariants: {
      appearance: "solid",
      intent: "primary",
      shape: "square",
      size: "medium",
    },
    extend: focusButtonStyles,
    variants: {
      appearance: {
        outline: [
          "border-border text-fg [--button-icon:theme(colors.muted.fg)]",
          "hover:bg-secondary/90 hover:[--button-icon:theme(colors.fg)]",
          "active:bg-secondary/90 active:[--button-icon:theme(colors.fg)]",
        ],
        plain: [
          "border-transparent text-fg [--button-icon:theme(colors.muted.fg)]",
          "pressed:bg-secondary/90",
          "active:bg-secondary/90 active:[--button-icon:theme(colors.fg)]",
          "hover:bg-secondary/90 hover:[--button-icon:theme(colors.fg)]",
        ],
        solid: [
          "border-transparent bg-[--button-border]",
          "before:inset-0 before:-z-10 before:bg-[--button-bg] before:shadow before:data-[disabled]:shadow-none",
          "after:inset-0 after:-z-10 after:shadow-[shadow:inset_0_1px_theme(colors.white/15%)] after:active:bg-[--button-hover-overlay] after:data-[disabled]:shadow-none after:hover:bg-[--button-hover-overlay]",
          "dark:border-white/5 dark:bg-[--button-bg] dark:before:hidden dark:after:-inset-px",
        ],
      },
      intent: {
        danger: [
          "text-white [--button-bg:theme(colors.danger.DEFAULT)] [--button-border:theme(colors.danger.DEFAULT)] [--button-hover-overlay:theme(colors.white/10%)]",
          "[--button-icon:theme(colors.white/60%)] active:[--button-icon:theme(colors.white/80%)] hover:[--button-icon:theme(colors.white/80%)]",
        ],
        primary: [
          "text-primary-fg [--button-bg:theme(colors.primary.DEFAULT)] [--button-border:theme(colors.primary.DEFAULT)] [--button-hover-overlay:theme(colors.white/10%)]",
          "[--button-icon:theme(colors.primary.fg/60%)] active:[--button-icon:theme(colors.primary.fg/80%)] hover:[--button-icon:theme(colors.primary.fg/80%)]",
        ],
        secondary: [
          "text-secondary-fg [--button-bg:theme(colors.secondary.DEFAULT)] [--button-border:theme(colors.secondary.fg/10%)] [--button-hover-overlay:theme(colors.secondary.fg/2.5%)] data-[active]:[--button-border:theme(colors.secondary.fg/15%)] hover:[--button-border:theme(colors.secondary.fg/15%)] dark:[--button-bg:theme(colors.secondary.DEFAULT)]",
          "[--button-icon:theme(colors.muted.fg)] active:[--button-icon:theme(colors.fg)] hover:[--button-icon:theme(colors.fg)]",
        ],
        warning: [
          "text-warning-fg [--button-bg:theme(colors.warning.DEFAULT)] [--button-border:theme(colors.warning.DEFAULT)] [--button-hover-overlay:theme(colors.white/10%)]",
          "[--button-icon:theme(colors.warning.fg/60%)] active:[--button-icon:theme(colors.warning.fg/80%)] hover:[--button-icon:theme(colors.warning.fg/80%)]",
        ],
      },
      isDisabled: {
        false: "forced-colors:disabled:text-[GrayText]",
        true: "cursor-default opacity-60 forced-colors:disabled:text-[GrayText]",
      },
      isPending: {
        true: "cursor-default",
      },
      shape: {
        circle:
          "rounded-[9999px] before:rounded-[9998px] after:rounded-[9998px] dark:after:rounded-[9999px]",
        square:
          "rounded-lg before:rounded-[calc(theme(borderRadius.lg)-1px)] after:rounded-[calc(theme(borderRadius.lg)-1px)] dark:after:rounded-lg",
      },
      size: {
        "extra-small":
          "h-8 px-[calc(theme(spacing.3)-1px)] py-[calc(theme(spacing.1)-1px)] text-xs/4 lg:text-[0.800rem]/4",
        large:
          "h-10 px-[calc(theme(spacing.4)-1px)] py-[calc(theme(spacing[2.5])-1px)] text-base sm:h-11 sm:px-[calc(theme(spacing.5)-1px)] lg:text-base/7 [&>[data-slot=icon]]:mx-[-3px] sm:[&>[data-slot=icon]]:size-5",
        medium:
          "h-10 px-[calc(theme(spacing.4)-1px)] py-[calc(theme(spacing.2)-1px)] text-base lg:text-sm/6",
        small:
          "h-9 px-[calc(theme(spacing.4)-1px)] py-[calc(theme(spacing[1.5])-1px)] text-sm/5 lg:text-sm/5",
        "square-petite": "size-9 shrink-0 [&_[data-slot=icon]]:text-current",
      },
    },
  },
  {
    responsiveVariants: ["sm", "lg"],
  },
)

type ButtonProps = ButtonPrimitiveProps & {
  appearance?: "outline" | "plain" | "solid"
  intent?: "danger" | "primary" | "secondary" | "warning"
  shape?: "circle" | "square"
  size?: "extra-small" | "large" | "medium" | "small" | "square-petite"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ appearance, className, intent, shape, size, ...props }, ref) => {
    return (
      <ButtonPrimitive
        ref={ref}
        {...props}
        className={cr(className, (className, renderProps) =>
          buttonStyles({
            ...renderProps,
            appearance,
            className,
            intent,
            shape,
            size,
          }),
        )}
      >
        {(values) => (
          <>
            {typeof props.children === "function"
              ? props.children(values)
              : props.children}
          </>
        )}
      </ButtonPrimitive>
    )
  },
)

Button.displayName = "Button"

export { Button, type ButtonProps, buttonStyles }

export { Button as ButtonPrimitive } from "react-aria-components"
