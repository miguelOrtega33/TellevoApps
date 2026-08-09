import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RestablecerContrasenaPage } from './restablecer-contrasena.page';

describe('RestablecerContrasenaPage', () => {
  let component: RestablecerContrasenaPage;
  let fixture: ComponentFixture<RestablecerContrasenaPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RestablecerContrasenaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
