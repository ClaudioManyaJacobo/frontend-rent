import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const valid = /^\+?\d{7,15}$/.test(value);
    return valid ? null : { phone: 'Formato de teléfono inválido' };
  };
}

export function rucValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const valid = /^\d{11}$/.test(value);
    return valid ? null : { ruc: 'El RUC debe tener 11 dígitos' };
  };
}

export function dniValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const valid = /^\d{8}$/.test(value);
    return valid ? null : { dni: 'El DNI debe tener 8 dígitos' };
  };
}

export function placaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const valid = /^[A-Za-z]{3}-\d{3}$/.test(value);
    return valid ? null : { placa: 'Formato de placa inválido (ABC-123)' };
  };
}
