import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environments';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';

import { AuthStatus, CheckTokenResponse, LoginResponse, User } from '../interfaces';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl: string = environment.baseUrl;
  private http = inject( HttpClient );
  private _router = inject( Router);

  private _currentUser = signal<User|null>(null);
  private _authStatus = signal<AuthStatus>( AuthStatus.checking );

  public currentUser = computed( () => this._currentUser() );
  public authStatus = computed( () => this._authStatus() );


  constructor() {
    this.checkAuthStatus().subscribe();
  }


  /**
   *
   * @param user setea el usuario que inicia session en la variable
   * @param token setea el token en el localStorage del navegador
   * @returns retorna true o false si puede iniciar sesion el usuario
   */
  private setAuthentication(user: User, token:string): boolean {
    this._currentUser.set( user );
    this._authStatus.set( AuthStatus.authenticated );
    localStorage.setItem('token', token);
    return true;
  }



  /**
   *
   * @param email email del usuario para iniciar sesion
   * @param password password del usuario para iniciar sesionn
   * @returns retorna un observable para indicar si los datos son correctos poder iniciar sesion
   */
  login( email: string, password: string ): Observable<boolean> {
    const url  = `${ this.baseUrl }/auth/login`;
    const body = { email, password };
    const userActual: User = {
      _id:      '0',
      email:    'admin@misena.edu.co',
      name:     'admin',
      isActive: true,
      roles:    ['Admin']
    }

    const tokenActual = 'asdsa56d45asd456df4.asdsa56d45asd456df4.asdsa56d45asd456df4'
    this.setAuthentication( userActual, tokenActual )
    return of(true)
  }


  /**
   *
   * @description: metodo que valida si el usuario tiene sesion activa
   */
  checkAuthStatus():Observable<boolean> {
    const url   = `${ this.baseUrl }/auth/check-token`;
    const token = localStorage.getItem('token');
    if ( !token ) {
      this.logout();
      return of(false);
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${ token }`);
      return this.http.get<CheckTokenResponse>(url, { headers })
        .pipe(
          map( ({ user, token }) => this.setAuthentication( user, token )),
          catchError(() => {
            this._authStatus.set( AuthStatus.notAuthenticated );
            return of(false);
          })
        );
  }


  /**
   * metodo para cerrar la sesion del usuario activo
   */
  logout() {
    localStorage.removeItem('token');
    this._currentUser.set(null);
    this._authStatus.set( AuthStatus.notAuthenticated );
    this._router.navigate(['auth/login'])
  }


}
