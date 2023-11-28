import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2'

import { AuthService } from '../../services/auth.service';


@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

  private fb          = inject( FormBuilder );
  private authService = inject( AuthService );
  private router      = inject( Router )


  public myForm: FormGroup = this.fb.group({
    email:    ['', [ Validators.required ]],
    password: ['', [ Validators.required, Validators.minLength(4) ]],
  });

  public alertError(param: any = {}): void {

    // this.stopLoading();

    Swal.fire({
      allowOutsideClick: true,
      backdrop: true,
      title: param.title || 'Error!',
      text: param.text || "Su solicitud no pudo ser procesada, por favor intente nuevamente",
      icon: param.icon || 'error',
      customClass: {
        confirmButton: 'rounded-full w-20 bg-gray-400 ring-0'
      }
    })
  }

  public startLoading({ title = 'Cargando', html = 'Por favor espere' }): void {

    Swal.fire({ title, html, allowOutsideClick: false, timer: 500000, didOpen: () => { Swal.showLoading() }, })

  }

  public stopLoading(): void {
    Swal.close();
  }



  login() {
    this.startLoading({});

    const { email, password } = this.myForm.value;

    setTimeout(() => {


      if(email === 'admin' && password === 'admin'){

        this.authService.login(email, password)
          .subscribe({
            next: () => {},
            error: (message) => {}
          })
        this.stopLoading();
        this.router.navigateByUrl('/dashboard')
      }else{
          const param = {
            icon: 'error',
            title: 'Error!',
            text:'Usuario y/o contraseña incorrecto'
          }
          this.alertError(param);

        }
    }, 1000);



  }

}
