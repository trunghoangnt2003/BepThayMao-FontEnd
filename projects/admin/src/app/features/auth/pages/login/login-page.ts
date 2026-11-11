import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HlmButton, HlmInput, HlmLabel } from '@bepthaymao/ui';
import { AuthSessionService } from '../../data-access/auth-session.service';

@Component({
  selector: 'adm-login-page',
  imports: [ReactiveFormsModule, HlmButton, HlmInput, HlmLabel],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private readonly auth = inject(AuthSessionService);
  private readonly router = inject(Router);
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
    if (this.form.invalid) return;
    const { identifier, password } = this.form.getRawValue();
    this.auth.login(identifier, password).subscribe((pair) => {
      void this.router.navigateByUrl(
        pair.role === 'Owner' ? '/owner/branches' : '/manager/settings',
      );
    });
  }
}
