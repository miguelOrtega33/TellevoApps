import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Share } from '@capacitor/share';
import { MenuController } from '@ionic/angular';
import { AuthService } from './services/auth.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Inicio', url: '/tellevo', icon: 'home' },
    { title: 'Buscar viajes', url: '/viajes', icon: 'car' },
    { title: 'Publicar ruta', url: '/mapa', icon: 'map' },
  ];

  constructor(public router: Router, private menu: MenuController, public auth: AuthService) {}

  compartirApp(){
    Share.share({
      title: 'Tellevo',
      text: 'Encuentra y comparte rutas con Tellevo.',
      dialogTitle: 'Compartir Tellevo',
    });
}
cerrarSesion(){
  this.auth.logout();
  this.router.navigate(["/inicio"]);
  this.menu.close();
}
abrirMapa() {
  this.router.navigate(["/mapa"]);
  this.menu.close();
}
}
