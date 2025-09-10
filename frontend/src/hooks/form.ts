import { createFormHookContexts, createFormHook } from "@tanstack/react-form";

import ErrorSummary from "@/components/form/ErrorSummary";
import DateInputField from "@/components/form/fields/DateInputField";
import MultiSelectField from "@/components/form/fields/MultiSelectField";
import NewPasswordInputField from "@/components/form/fields/NewPasswordInputField";
import PasswordInputField from "@/components/form/fields/PasswordInputField";
import SegmentedControlField from "@/components/form/fields/SegmentedControlField";
import SegmentedDeadlineField from "@/components/form/fields/SegmentedDeadlineField";
import TextAreaField from "@/components/form/fields/TextAreaField";
import TextField from "@/components/form/fields/TextField";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    DateInputField,
    MultiSelectField,
    NewPasswordInputField,
    PasswordInputField,
    SegmentedControlField,
    SegmentedDeadlineField,
    TextAreaField,
    TextField,
  },
  formComponents: {
    ErrorSummary,
  },
  fieldContext,
  formContext,
});

export { useAppForm, useFieldContext, useFormContext };
