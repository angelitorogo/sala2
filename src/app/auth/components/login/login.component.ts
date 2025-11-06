import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  formLogin: FormGroup;

  constructor(private fb: FormBuilder,
              private _router: Router,
              private _authService: AuthService
  ) {
    this.formLogin = this.fb.group({
      email: new FormControl('angelitorogo@hotmail.com',[Validators.required, Validators.email]),
      password: new FormControl('Rod00gom!',Validators.required),
    });
  }


  submit() {

    const { email, password } = this.formLogin.value;

    this._authService.login(email, password).subscribe({
      next: () => {
        this._router.navigate(['/dashboard/home']);
      },
      error: (err) => {
        const error = 'Login fallido: ' + (err.error.message || 'Error desconocido');
        console.log(error)
      },
    });

  }

}
