import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({ selector: 'app-restablecer-contrasena', templateUrl: './restablecer-contrasena.page.html', styleUrls: ['./restablecer-contrasena.page.scss'] })
export class RestablecerContrasenaPage {
  submitting = false;
  form = this.fb.group({ email: ['', [Validators.required, Validators.email]], contrasena: ['', [Validators.required, Validators.minLength(8)]], confirmarContrasena: ['', Validators.required] });
  constructor(private fb: FormBuilder, private auth: AuthService, private alertController: AlertController, private router: Router) {}
  get passwordsMatch(): boolean { const value = this.form.getRawValue(); return Boolean(value.contrasena && value.contrasena === value.confirmarContrasena); }
  async restablecer(): Promise<void> {
    if (this.form.invalid || !this.passwordsMatch || this.submitting) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const value = this.form.getRawValue();
    const updated = await this.auth.resetPassword(value.email ?? '', value.contrasena ?? '');
    this.submitting = false;
    const alert = await this.alertController.create({ header: updated ? 'Contraseña actualizada' : 'Cuenta no encontrada', message: updated ? 'Ya puedes iniciar sesión con tu nueva contraseña.' : 'Verifica el correo ingresado o crea una cuenta.', buttons: ['Entendido'] });
    await alert.present(); await alert.onDidDismiss();
    if (updated) { await this.router.navigate(['/inicio']); }
  }
}
