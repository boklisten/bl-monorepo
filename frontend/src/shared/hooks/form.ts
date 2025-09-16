import { createFormHookContexts, createFormHook } from "@tanstack/react-form";

import ErrorSummary from "@/shared/components/form/ErrorSummary";
import CheckboxField from "@/shared/components/form/fields/basic/CheckboxField";
import DateField from "@/shared/components/form/fields/basic/DateField";
import MultiSelectField from "@/shared/components/form/fields/basic/MultiSelectField";
import SelectField from "@/shared/components/form/fields/basic/SelectField";
import SwitchField from "@/shared/components/form/fields/basic/SwitchField";
import TextAreaField from "@/shared/components/form/fields/basic/TextAreaField";
import TextField from "@/shared/components/form/fields/basic/TextField";
import AddressField from "@/shared/components/form/fields/complex/AddressField";
import DeadlinePickerField from "@/shared/components/form/fields/complex/DeadlinePickerField";
import EmailField from "@/shared/components/form/fields/complex/EmailField";
import NameField from "@/shared/components/form/fields/complex/NameField";
import NewPasswordField from "@/shared/components/form/fields/complex/NewPasswordField";
import PasswordField from "@/shared/components/form/fields/complex/PasswordField";
import PhoneNumberField from "@/shared/components/form/fields/complex/PhoneNumberField";
import PostalCodeField from "@/shared/components/form/fields/complex/PostalCodeField";
import RichTextEditorField from "@/shared/components/form/fields/complex/RichTextEditorField";
import SegmentedControlField from "@/shared/components/form/fields/complex/SegmentedControlField";
import SelectBranchField from "@/shared/components/form/fields/complex/SelectBranchField";
import SignatureCanvasField from "@/shared/components/form/fields/complex/SignatureCanvasField";

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
