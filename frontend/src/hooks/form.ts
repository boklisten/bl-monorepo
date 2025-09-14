import { createFormHookContexts, createFormHook } from "@tanstack/react-form";

import ErrorSummary from "@/components/form/ErrorSummary";
import DateInputField from "@/components/form/fields/DateInputField";
import MultiSelectField from "@/components/form/fields/MultiSelectField";
import NewPasswordInputField from "@/components/form/fields/NewPasswordInputField";
import PasswordInputField from "@/components/form/fields/PasswordInputField";
import RichTextEditorField from "@/components/form/fields/RichTextEditorField";
import SegmentedControlField from "@/components/form/fields/SegmentedControlField";
import SegmentedDeadlineField from "@/components/form/fields/SegmentedDeadlineField";
import SelectField from "@/components/form/fields/SelectField";
import SignatureCanvasField from "@/components/form/fields/SignatureCanvasField";
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
    RichTextEditorField,
    SegmentedControlField,
    SegmentedDeadlineField,
    SelectField,
    SignatureCanvasField,
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
