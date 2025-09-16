import { createFormHookContexts, createFormHook } from "@tanstack/react-form";

import ErrorSummary from "@/shared/form/ErrorSummary";
import CheckboxField from "@/shared/form/fields/basic/CheckboxField";
import DateField from "@/shared/form/fields/basic/DateField";
import MultiSelectField from "@/shared/form/fields/basic/MultiSelectField";
import SelectField from "@/shared/form/fields/basic/SelectField";
import SwitchField from "@/shared/form/fields/basic/SwitchField";
import TextAreaField from "@/shared/form/fields/basic/TextAreaField";
import TextField from "@/shared/form/fields/basic/TextField";
import AddressField from "@/shared/form/fields/complex/AddressField";
import DeadlinePickerField from "@/shared/form/fields/complex/DeadlinePickerField";
import EmailField from "@/shared/form/fields/complex/EmailField";
import NameField from "@/shared/form/fields/complex/NameField";
import NewPasswordField from "@/shared/form/fields/complex/NewPasswordField";
import PasswordField from "@/shared/form/fields/complex/PasswordField";
import PhoneNumberField from "@/shared/form/fields/complex/PhoneNumberField";
import PostalCodeField from "@/shared/form/fields/complex/PostalCodeField";
import RichTextEditorField from "@/shared/form/fields/complex/RichTextEditorField";
import SegmentedControlField from "@/shared/form/fields/complex/SegmentedControlField";
import SelectBranchField from "@/shared/form/fields/complex/SelectBranchField";
import SignatureCanvasField from "@/shared/form/fields/complex/SignatureCanvasField";

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
