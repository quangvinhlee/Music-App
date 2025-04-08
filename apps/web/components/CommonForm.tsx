"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface CommonFormProps {
  schema: z.ZodSchema<any>;
  onSubmit: SubmitHandler<any>;
  fields: {
    name: string;
    label: string;
    type: string;
    placeholder: string;
  }[];
  button: string;
  extraFields?: React.ReactNode;
  errors?: Record<string, string>; // 👈 server-side errors
}

export default function CommonForm({
  schema,
  onSubmit,
  fields,
  button,
  extraFields,
  errors = {},
}: CommonFormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
    reValidateMode: "onChange",
    mode: "onSubmit",
    defaultValues: fields.reduce<Record<string, string>>((acc, field) => {
      acc[field.name] = "";
      return acc;
    }, {}),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {fields.map(({ name, label, type, placeholder }) => {
          const fieldError =
            form.formState.errors[name]?.message || errors[name];

          return (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={placeholder}
                      type={type}
                      {...field}
                      className={fieldError ? "border-red-500" : ""}
                    />
                  </FormControl>
                  {fieldError && (
                    <p className="text-red-500 text-sm mt-1">{fieldError}</p>
                  )}
                </FormItem>
              )}
            />
          );
        })}

        {extraFields && <div className="mt-4">{extraFields}</div>}

        <div className="flex justify-center">
          <Button
            type="submit"
            className="w-full max-w-sm cursor-pointer"
            disabled={form.formState.isSubmitting}
          >
            {button}
          </Button>
        </div>
      </form>
    </Form>
  );
}
