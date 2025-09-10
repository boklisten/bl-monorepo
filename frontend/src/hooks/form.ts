import { createFormHookContexts, createFormHook } from "@tanstack/react-form";

import DateInputField from "@/components/form/fields/DateInputField";
import MultiSelectField from "@/components/form/fields/MultiSelectField";
import SegmentedControlField from "@/components/form/fields/SegmentedControlField";
import SegmentedDeadlineField from "@/components/form/fields/SegmentedDeadlineField";
import TextAreaField from "@/components/form/fields/TextAreaField";
import TextField from "@/components/form/fields/TextField";
import SubmitButton from "@/components/form/SubmitButton";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    DateInputField,
    MultiSelectField,
    SegmentedControlField,
    SegmentedDeadlineField,
    TextAreaField,
    TextField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});

export { useAppForm, useFieldContext, useFormContext };
