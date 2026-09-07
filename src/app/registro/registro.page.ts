import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({ selector: 'app-registro', templateUrl: './registro.page.html', styleUrls: ['./registro.page.scss'] })
export class RegistroPage {
  showPassword = false;
  submitting = false;
  formularioRegistro = this.fb.group({ nombre: ['', [Validators.required, Validators.minLength(2)]], email: ['', [Validators.required, Validators.email]], contrasena: ['', [Validators.required, Validators.minLength(8)]], confirmarContrasena: ['', [Validators.required]] });
  constructor(private fb: FormBuilder, private router: Router, private alertController: AlertController, private auth: AuthService) {}
  get passwordsMatch(): boolean { const { contrasena, confirmarContrasena } = this.formularioRegistro.getRawValue(); return Boolean(contrasena && contrasena === confirmarContrasena); }
  async registrar(): Promise<void> {
    if (this.formularioRegistro.invalid || !this.passwordsMatch || this.submitting) { this.formularioRegistro.markAllAsTouched(); return; }
    this.submitting = true;
    const { nombre, email, contrasena } = this.formularioRegistro.getRawValue();
    try {
      await this.auth.register(nombre ?? '', email ?? '', contrasena ?? '');
      const alert = await this.alertController.create({ header: 'Cuenta creada', message: 'Ya puedes iniciar sesión con tu correo.', buttons: ['Continuar'] });
      await alert.present(); await alert.onDidDismiss(); await this.router.navigate(['/inicio']);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos crear tu cuenta.';
      const alert = await this.alertController.create({ header: 'Revisa tus datos', message, buttons: ['Entendido'] }); await alert.present();
    } finally { this.submitting = false; }
  }
}
