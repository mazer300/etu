import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.less']
})
export class LoginComponent {
    loginForm: FormGroup;
    isSubmitting = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]]
        });

        // Если пользователь уже авторизован, перенаправляем на ленту
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/news']);
        }
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            this.isSubmitting = true;
            this.errorMessage = '';

            const formData = this.loginForm.value;

            this.authService.login({
                email: formData.email,
                password: formData.password
            }).subscribe({
                next: (user) => {
                    this.isSubmitting = false;
                    this.router.navigate(['/news']);
                },
                error: (error) => {
                    this.isSubmitting = false;
                    this.errorMessage = error.error?.message || 'Ошибка входа. Проверьте email и пароль.';
                    console.error('Login error:', error);
                }
            });
        } else {
            this.markFormGroupTouched();
        }
    }

    private markFormGroupTouched(): void {
        Object.keys(this.loginForm.controls).forEach(key => {
            const control = this.loginForm.get(key);
            control?.markAsTouched();
        });
    }

    get email() { return this.loginForm.get('email'); }
    get password() { return this.loginForm.get('password'); }
}