"use client";

import * as React from "react";
import { Field } from "@base-ui/react/field";
import { cn } from "@/lib/utils";

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof Field.Label> {}

function Label({ className, ...props }: LabelProps) {
  return (
    <Field.Label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
}

export { Label };
