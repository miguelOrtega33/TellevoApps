import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoAutenticadoGuard implements CanActivate {

  constructor(private router: Router, private auth: AuthService) { }

  canActivate(
  ): boolean | UrlTree {
    return !this.auth.isAuthenticated || this.router.createUrlTree(['/tellevo']);
  }
}
