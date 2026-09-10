import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

type BaseProps = {
  label: string;
  error?: string;
  helper?: string;
  required?: boolean;
};

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & { as?: 'input' };
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { as: 'textarea' };

export type FormFieldProps = InputProps | TextareaProps;

function isTextarea(props: FormFieldProps): props is TextareaProps {
  return (props as TextareaProps).as === 'textarea';
}

const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(
  (props, ref) => {
    const { label, error, helper, required } = props;

    return (
      <div className="w-full">
        <label className="label">
          {label}
          {required && <span className="ml-0.5 text-error-500">*</span>}
        </label>
        {isTextarea(props) ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={`input min-h-[110px] resize-y ${error ? 'input-error' : ''}`}
            {...(props as TextareaProps)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            className={`input ${error ? 'input-error' : ''}`}
            {...(props as InputProps)}
          />
        )}
        {error ? (
          <p className="error-text">{error}</p>
        ) : helper ? (
          <p className="helper">{helper}</p>
        ) : null}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
export default FormField;
