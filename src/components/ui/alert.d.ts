import { ReactNode, HTMLAttributes } from 'react';

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

