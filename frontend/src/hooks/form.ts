import { createFormHookContexts, createFormHook } from "@tanstack/react-form";

import ErrorSummary from "@/components/form/ErrorSummary";
import CheckboxField from "@/components/form/fields/basic/CheckboxField";
import DateField from "@/components/form/fields/basic/DateField";
import MultiSelectField from "@/components/form/fields/basic/MultiSelectField";
import SelectField from "@/components/form/fields/basic/SelectField";
import SwitchField from "@/components/form/fields/basic/SwitchField";
import TextAreaField from "@/components/form/fields/basic/TextAreaField";
import TextField from "@/components/form/fields/basic/TextField";
import AddressField from "@/components/form/fields/complex/AddressField";
import DeadlinePickerField from "@/components/form/fields/complex/DeadlinePickerField";
import EmailField from "@/components/form/fields/complex/EmailField";
import NameField from "@/components/form/fields/complex/NameField";
import NewPasswordField from "@/components/form/fields/complex/NewPasswordField";
import PasswordField from "@/components/form/fields/complex/PasswordField";
import PhoneNumberField from "@/components/form/fields/complex/PhoneNumberField";
import PostalCodeField from "@/components/form/fields/complex/PostalCodeField";
import RichTextEditorField from "@/components/form/fields/complex/RichTextEditorField";
import SegmentedControlField from "@/components/form/fields/complex/SegmentedControlField";
import SelectBranchField from "@/components/form/fields/complex/SelectBranchField";
import SignatureCanvasField from "@/components/form/fields/complex/SignatureCanvasField";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    // Basic
    TextField,
    TextAreaField,
    DateField,
    SelectField,
    MultiSelectField,
    CheckboxField,
    SwitchField,

    // Complex
    EmailField,
    PhoneNumberField,
    NameField,
    AddressField,
    PostalCodeField,
    PasswordField,
    NewPasswordField,
    SelectBranchField,
    SegmentedControlField,
    DeadlinePickerField,
    RichTextEditorField,
    SignatureCanvasField,
  },
  formComponents: {
    ErrorSummary,
  },
  fieldContext,
  formContext,
});

export { useAppForm, withFieldGroup, useFieldContext, useFormContext };
