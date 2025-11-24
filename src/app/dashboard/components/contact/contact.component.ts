// src/app/features/contact/contact.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MailService } from '../../services/mail.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit {

  formContact: FormGroup;

  // Estado del envío
  isSubmitting = false;
  submitSuccess: string | null = null;
  submitError: string | null = null;

  // Captcha simple (A + B)
  captchaA = 0;
  captchaB = 0;
  captchaResultEsperado = 0;
  captchaError = false;

  constructor(
    private fb: FormBuilder,
    private mailService: MailService,
  ) {
    this.formContact = this.fb.group({
      nombre:       new FormControl('pepe', [Validators.required, Validators.minLength(2)]),
      apellido:     new FormControl('pepito pepin', [Validators.required, Validators.minLength(2)]),
      email:        new FormControl('pepe@pepe.com', [Validators.required, Validators.email]),
      asunto:       new FormControl('prueba', [Validators.required, Validators.minLength(3)]),
      text:         new FormControl('Este es un mensaje de prueba', [Validators.required, Validators.minLength(10)]),
      captcha:      new FormControl('', [Validators.required]),  // sólo front
    });
  }

  ngOnInit(): void {
    this.generarCaptcha();
  }

  private generarCaptcha(): void {
    // Números pequeños para que sea amable
    this.captchaA = Math.floor(Math.random() * 9) + 1; // 1-9
    this.captchaB = Math.floor(Math.random() * 9) + 1; // 1-9
    this.captchaResultEsperado = this.captchaA + this.captchaB;
    this.captchaError = false;
    this.formContact.get('captcha')?.reset('');
  }

  submit(): void {
    this.submitSuccess = null;
    this.submitError = null;
    this.captchaError = false;

    if (this.formContact.invalid) {
      this.formContact.markAllAsTouched();
      return;
    }

    const captchaValue = Number(this.formContact.value.captcha);
    if (captchaValue !== this.captchaResultEsperado) {
      this.captchaError = true;
      this.generarCaptcha(); // Generamos uno nuevo
      return;
    }

    const { nombre, apellido, email, asunto, text } = this.formContact.value;

    this.isSubmitting = true;

    this.mailService.createMail({ nombre, apellido, email, asunto, text }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = 'Tu mensaje se ha enviado correctamente. ¡Gracias por contactar!';
        this.formContact.reset();
        this.generarCaptcha();
      },
      error: (err: any) => {
        console.error('[Contact] Error al enviar mail', err);
        this.isSubmitting = false;
        this.submitError =
          'Ha ocurrido un error al enviar el mensaje. Inténtalo de nuevo en unos minutos.';
        this.generarCaptcha();
      }
    });
  }

  // Helpers para mostrar errores en plantillas
  hasError(controlName: string, error: string): boolean {
    const ctrl = this.formContact.get(controlName);
    return !!ctrl && ctrl.touched && ctrl.hasError(error);
  }

}
