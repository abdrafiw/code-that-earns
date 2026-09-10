import { useReducer } from 'react';

export type FormErrors<T> = Partial<Record<keyof T, string>>;

type FormState<T> = { values: T; errors: FormErrors<T> };
type FormAction<T> =
  | { type: 'field'; field: keyof T; value: T[keyof T] }
  | { type: 'errors'; errors: FormErrors<T> }
  | { type: 'reset'; values: T };

function reducer<T>(state: FormState<T>, action: FormAction<T>): FormState<T> {
  if (action.type === 'reset') return { values: action.values, errors: {} };
  if (action.type === 'errors') return { ...state, errors: action.errors };

  const errors = { ...state.errors };
  delete errors[action.field];
  return {
    values: { ...state.values, [action.field]: action.value },
    errors,
  };
}

export function useTypedForm<T>(initialValues: T) {
  const [state, dispatch] = useReducer(reducer<T>, {
    values: initialValues,
    errors: {},
  });

  const setField = <K extends keyof T>(field: K, value: T[K]) =>
    dispatch({ type: 'field', field, value });

  return {
    ...state,
    setField,
    setErrors: (errors: FormErrors<T>) => dispatch({ type: 'errors', errors }),
    reset: () => dispatch({ type: 'reset', values: initialValues }),
  };
}
