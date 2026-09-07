import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({ selector: 'app-inicio', templateUrl: './inicio.page.html', styleUrls: ['./inicio.page.scss'] })
export class InicioPage {
  showPassword = false;
  submitting = false;
  formularioLogin = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required]],
  });

  constructor(private fb: FormBuilder, private alertController: AlertController, private router: Router, private auth: AuthService) {}

  async ingresar(): Promise<void> {
    if (this.formularioLogin.invalid || this.submitting) {
      this.formularioLogin.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const { email, contrasena } = this.formularioLogin.getRawValue();
    const isValid = await this.auth.login(email ?? '', contrasena ?? '');
    this.submitting = false;
    if (isValid) {
      await this.router.navigate(['/tellevo']);
      return;
    }
    const alert = await this.alertController.create({
      header: 'No pudimos iniciar sesión',
      message: 'Revisa tu correo y contraseña, o crea una cuenta si aún no tienes una.',
      buttons: ['Entendido'],
    });
    await alert.present();
  }
}
