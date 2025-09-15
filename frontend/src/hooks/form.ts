import { createFormHookContexts, createFormHook } from "@tanstack/react-form";

import ErrorSummary from "@/components/form/ErrorSummary";
import AddressField from "@/components/form/fields/AddressField";
import CheckboxField from "@/components/form/fields/CheckboxField";
import DateField from "@/components/form/fields/DateField";
import EmailField from "@/components/form/fields/EmailField";
import MultiSelectField from "@/components/form/fields/MultiSelectField";
import NameField from "@/components/form/fields/NameField";
import NewPasswordField from "@/components/form/fields/NewPasswordField";
import PasswordField from "@/components/form/fields/PasswordField";
import PhoneNumberField from "@/components/form/fields/PhoneNumberField";
import PostalCodeField from "@/components/form/fields/PostalCodeField";
import RichTextEditorField from "@/components/form/fields/RichTextEditorField";
import SegmentedControlField from "@/components/form/fields/SegmentedControlField";
import SegmentedDeadlineField from "@/components/form/fields/SegmentedDeadlineField";
import SelectBranchField from "@/components/form/fields/SelectBranchField";
import SelectField from "@/components/form/fields/SelectField";
import SignatureCanvasField from "@/components/form/fields/SignatureCanvasField";
import TextAreaField from "@/components/form/fields/TextAreaField";
import TextField from "@/components/form/fields/TextField";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    // Builtin
    TextField,
    TextAreaField,
    DateField,
    SelectField,
    MultiSelectField,
    CheckboxField,

    // Opinionated
    EmailField,
    PhoneNumberField,
    NameField,
    AddressField,
    PostalCodeField,
    PasswordField,
    NewPasswordField,

    // Custom
    RichTextEditorField,
    SegmentedControlField,
    SegmentedDeadlineField,
    SignatureCanvasField,
    SelectBranchField,
  },
  formComponents: {
    ErrorSummary,
  },
  fieldContext,
  formContext,
});

export { useAppForm, withFieldGroup, useFieldContext, useFormContext };
