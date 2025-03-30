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
}

export default function CommonForm({
  schema,
  onSubmit,
  fields,
  button,
  extraFields,
}: CommonFormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: fields.reduce<Record<string, string>>((acc, field) => {
      acc[field.name] = "";
      return acc;
    }, {}),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {fields.map(({ name, label, type, placeholder }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input placeholder={placeholder} type={type} {...field} />
                </FormControl>
                {form.formState.errors[name] && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors[name]?.message}
                  </p>
                )}
              </FormItem>
            )}
          />
        ))}

        {extraFields && <div className="mt-4">{extraFields}</div>}

        <div className="flex justify-center">
          <Button type="submit" className="w-full max-w-sm cursor-pointer">
            {button}
          </Button>
        </div>
      </form>
    </Form>
  );
}
