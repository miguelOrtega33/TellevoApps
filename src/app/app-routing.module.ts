import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AutenticadoGuard } from './guard/autenticado.guard';
import { NoAutenticadoGuard } from './guard/no-autenticado.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'registro',
    loadChildren: () => import('./registro/registro.module').then( m => m.RegistroPageModule),
    canActivate: [NoAutenticadoGuard]
  },
  {
    path: 'viajes',
    loadChildren: () => import('./viajes/viajes.module').then( m => m.ViajesPageModule),
    canActivate: [AutenticadoGuard]
  },
  {
    path: 'inicio',
    loadChildren: () => import('./inicio/inicio.module').then( m => m.InicioPageModule),
    canActivate: [NoAutenticadoGuard]
  },
  {
    path: 'restablecer-contrasena',
    loadChildren: () => import('./restablecer-contrasena/restablecer-contrasena.module').then( m => m.RestablecerContrasenaPageModule),
    canActivate: [NoAutenticadoGuard]
  },
  {
    path: 'tellevo',
    loadChildren: () => import('./tellevo/tellevo.module').then( m => m.TellevoPageModule),
    canActivate: [AutenticadoGuard]
  },   {
    path: 'mapa',
    loadChildren: () => import('./mapa/mapa.module').then( m => m.MapaPageModule),
    canActivate: [AutenticadoGuard]
  },

 
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
