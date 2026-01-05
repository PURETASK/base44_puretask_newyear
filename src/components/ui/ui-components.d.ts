/**
 * Consolidated UI Component Type Declarations
 * 
 * This file provides TypeScript definitions for all UI components
 * to enable type checking and autocomplete in TypeScript files.
 * 
 * Best Practice: Consolidate related component types in one file
 * for easier maintenance and consistent typing.
 */

import { ReactNode, HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes } from 'react';

// ============================================================================
// CARD COMPONENTS
// ============================================================================

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
  className?: string;
}

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
  className?: string;
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps>;
export const CardHeader: React.FC<CardHeaderProps>;
export const CardTitle: React.FC<CardTitleProps>;
export const CardDescription: React.FC<CardDescriptionProps>;
export const CardContent: React.FC<CardContentProps>;
export const CardFooter: React.FC<CardFooterProps>;

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  children?: ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps>;

// ============================================================================
// BADGE COMPONENT
// ============================================================================

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
  children?: ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps>;

// ============================================================================
// ALERT COMPONENTS
// ============================================================================

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'warning' | 'success' | 'info';
  children?: ReactNode;
  className?: string;
}

export interface AlertTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
  className?: string;
}

export interface AlertDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps>;
export const AlertTitle: React.FC<AlertTitleProps>;
export const AlertDescription: React.FC<AlertDescriptionProps>;

// ============================================================================
// INPUT COMPONENT
// ============================================================================

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  error?: string;
}

export const Input: React.FC<InputProps>;

// ============================================================================
// LABEL COMPONENT
// ============================================================================

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children?: ReactNode;
  className?: string;
  htmlFor?: string;
}

export const Label: React.FC<LabelProps>;

// ============================================================================
// CHECKBOX COMPONENT
// ============================================================================

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps>;

// ============================================================================
// SWITCH COMPONENT
// ============================================================================

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps>;

// ============================================================================
// SELECT COMPONENTS
// ============================================================================

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children?: ReactNode;
}

export interface SelectTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  className?: string;
}

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export interface SelectContentProps {
  children?: ReactNode;
  className?: string;
  position?: 'popper' | 'item-aligned';
}

export interface SelectItemProps {
  value: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}

export interface SelectGroupProps {
  children?: ReactNode;
  className?: string;
}

export interface SelectLabelProps {
  children?: ReactNode;
  className?: string;
}

export const Select: React.FC<SelectProps>;
export const SelectTrigger: React.FC<SelectTriggerProps>;
export const SelectValue: React.FC<SelectValueProps>;
export const SelectContent: React.FC<SelectContentProps>;
export const SelectItem: React.FC<SelectItemProps>;
export const SelectGroup: React.FC<SelectGroupProps>;
export const SelectLabel: React.FC<SelectLabelProps>;

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps>;

// ============================================================================
// DIALOG COMPONENTS
// ============================================================================

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export interface DialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  asChild?: boolean;
}

export interface DialogContentProps {
  children?: ReactNode;
  className?: string;
}

export interface DialogHeaderProps {
  children?: ReactNode;
  className?: string;
}

export interface DialogFooterProps {
  children?: ReactNode;
  className?: string;
}

export interface DialogTitleProps {
  children?: ReactNode;
  className?: string;
}

export interface DialogDescriptionProps {
  children?: ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps>;
export const DialogTrigger: React.FC<DialogTriggerProps>;
export const DialogContent: React.FC<DialogContentProps>;
export const DialogHeader: React.FC<DialogHeaderProps>;
export const DialogFooter: React.FC<DialogFooterProps>;
export const DialogTitle: React.FC<DialogTitleProps>;
export const DialogDescription: React.FC<DialogDescriptionProps>;

// ============================================================================
// PROGRESS COMPONENT
// ============================================================================

export interface ProgressProps {
  value?: number;
  max?: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps>;

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps>;

// ============================================================================
// SEPARATOR COMPONENT
// ============================================================================

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
  className?: string;
}

export const Separator: React.FC<SeparatorProps>;

// ============================================================================
// AVATAR COMPONENTS
// ============================================================================

export interface AvatarProps {
  children?: ReactNode;
  className?: string;
}

export interface AvatarImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export interface AvatarFallbackProps {
  children?: ReactNode;
  className?: string;
}

export const Avatar: React.FC<AvatarProps>;
export const AvatarImage: React.FC<AvatarImageProps>;
export const AvatarFallback: React.FC<AvatarFallbackProps>;

