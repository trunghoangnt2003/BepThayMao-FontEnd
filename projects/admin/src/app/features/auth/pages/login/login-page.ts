import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({ selector: 'adm-login-page', template: '<h1 tabindex="-1">Đăng nhập quản trị</h1>' })
export class LoginPage {
  readonly form = new FormGroup({
    identifier: new FormControl('', {
      nonNullable: true,
      validators: [(control) => Validators.required(control)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [(control) => Validators.required(control)],
    }),
  });

  submit(): void {
    return;
  }
}
