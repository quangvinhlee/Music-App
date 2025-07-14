"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

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
  errors?: Record<string, string>;
  isLoading?: boolean;
}

export default function CommonForm({
  schema,
  onSubmit,
  fields,
  button,
  errors = {},
  isLoading,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      className={`!bg-gray-800 !text-white border-gray-700 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 [&:-webkit-autofill]:!bg-gray-800 [&:-webkit-autofill]:!text-white [&:-webkit-autofill]:!shadow-[0_0_0_30px_#1f2937_inset] [&:-webkit-autofill]:![-webkit-text-fill-color:#ffffff] ${fieldError ? "border-red-500" : ""}`}
                    />
                  </FormControl>
                  {fieldError && (
                    <p className="text-red-500 text-sm mt-1">
                      {typeof fieldError === "string"
                        ? fieldError
                        : String(fieldError?.message || "Invalid input")}
                    </p>
                  )}
                </FormItem>
              )}
            />
          );
        })}

        {errors.form && (
          <p className="text-red-500 text-sm text-center">{errors.form}</p>
        )}

        <div className="flex justify-center">
          <Button
            type="submit"
            className="w-full max-w-sm cursor-pointer bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 shadow-lg"
            disabled={form.formState.isSubmitting || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </div>
            ) : (
              button
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
