/**
 * Type Declarations for shadcn/ui Components
 * Consolidated type definitions for all UI components
 * Created: January 4, 2026
 */

import { ReactNode, HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, LabelHTMLAttributes } from 'react';

// ============================================================================
// CARD COMPONENTS
// ============================================================================

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
}

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
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
}

export const Button: React.FC<ButtonProps>;

// ============================================================================
// BADGE COMPONENT
// ============================================================================

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
  children?: ReactNode;
}

export const Badge: React.FC<BadgeProps>;

// ============================================================================
// ALERT COMPONENTS
// ============================================================================

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
  children?: ReactNode;
}

export interface AlertTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
}

export interface AlertDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
}

export const Alert: React.FC<AlertProps>;
export const AlertTitle: React.FC<AlertTitleProps>;
export const AlertDescription: React.FC<AlertDescriptionProps>;

// ============================================================================
// INPUT COMPONENT
// ============================================================================

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // Additional custom props if any
}

export const Input: React.FC<InputProps>;

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  // Additional custom props if any
}

export const Textarea: React.FC<TextareaProps>;

// ============================================================================
// LABEL COMPONENT
// ============================================================================

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children?: ReactNode;
}

export const Label: React.FC<LabelProps>;

// ============================================================================
// CHECKBOX COMPONENT
// ============================================================================

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps>;

// ============================================================================
// SWITCH COMPONENT
// ============================================================================

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps>;

// ============================================================================
// SELECT COMPONENTS
// ============================================================================

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  disabled?: boolean;
  children?: ReactNode;
}

export interface SelectTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

export interface SelectContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface SelectItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children?: ReactNode;
}

export interface SelectValueProps {
  placeholder?: string;
}

export const Select: React.FC<SelectProps>;
export const SelectTrigger: React.FC<SelectTriggerProps>;
export const SelectContent: React.FC<SelectContentProps>;
export const SelectItem: React.FC<SelectItemProps>;
export const SelectValue: React.FC<SelectValueProps>;

// ============================================================================
// PROGRESS COMPONENT
// ============================================================================

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

export const Progress: React.FC<ProgressProps>;

// ============================================================================
// LOADER COMPONENT
// ============================================================================

export interface Loader2Props extends HTMLAttributes<SVGElement> {
  className?: string;
}

// Note: Loader2 is typically imported from lucide-react, but if you have a custom one:
export const Loader2: React.FC<Loader2Props>;

