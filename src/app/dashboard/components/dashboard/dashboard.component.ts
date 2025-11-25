import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { ViewportService } from '../../services/viewport.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

type SubmenuKey = 'cine' | 'series';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  scrollPosition: number = 0;
  navbar!: HTMLElement | null;
  navCollapse!: HTMLElement | null;
  @ViewChild('navCollapse') navCollapseMenu!: ElementRef<HTMLElement>;
  currentYear = new Date().getFullYear();
  isMenuOpen = false;
  @ViewChild('submenuCine') submenuCine!: ElementRef;
  @ViewChild('submenuSeries') submenuSeries!: ElementRef;
  @ViewChild('toggleBtn') toggleBtn!: ElementRef<HTMLElement>;
  @ViewChild('footerWrap') footerWrap!: ElementRef<HTMLElement>;
  @ViewChild('footerIcon') footerIcon!: ElementRef<HTMLElement>;
  @ViewChild('footerIconMobile') footerIconMobile!: ElementRef<HTMLElement>;
  @ViewChild('footerBottom') footerBottom!: ElementRef<HTMLElement>;
  @ViewChild('container') container!: ElementRef<HTMLElement>;
  @ViewChild('navBar') navBar!: ElementRef<HTMLElement>;
  @ViewChild('searchBar') searchBar!: ElementRef<HTMLElement>;

  public currentUrl = '';
  public currentRoutePath = '';

  searchForm!: FormGroup;
   
   
  isTabletOrMobile = window.innerWidth <= 1024;
  public isNavbarGrande = true;

  submenus: Record<SubmenuKey, boolean> = {
    cine: false,
    series: false,
  };

  private routerSub?: Subscription;
  private unlistenDocClick?: () => void;

  constructor(
    public authService: AuthService,
    public router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    public viewport: ViewportService,
    private fb: FormBuilder,  
  ) {

    
      window.addEventListener('resize', () => {
        window.innerWidth <= 725 ? this.isTabletOrMobile = true : this.isTabletOrMobile = false;
        //console.log(this.isTabletOrMobile)
      });
      

      // Cerrar todo al cambiar ruta
      this.routerSub = this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe((event) => {
          // URL completa después de redirecciones
          this.currentUrl = event.urlAfterRedirects;

          if(this.searchBar) {
            if(this.currentUrl == '/dashboard/home') {
              this.searchBar.nativeElement.classList.remove('save-search');
            } else {
              this.searchBar.nativeElement.classList.add('save-search');
            }
          }
          
          
          // Actualizamos el modo de navbar
          this.updateNavbarCompact();
          // Cerramos menús
          this.closeAll();
        });

    }

  ngOnInit(): void {

    // buscador: un solo campo obligatorio (cuando haya texto)
    this.searchForm = this.fb.group({
      query: ['', [Validators.minLength(2)]],
    });

    this.authService.comprobarUser();
    this.updateNavbarCompact();
    // URL actual al cargar el componente
    this.currentUrl = this.router.url;

    
    
  }

  ngAfterViewInit(): void {
   
    this.navbar = document.getElementById('navbar');
    this.navCollapse = document.getElementById('nav-collapse');

    if (this.navbar) {
      window.addEventListener('scroll', this.handleScroll.bind(this));
    }


    this.unlistenDocClick = this.renderer.listen('document', 'click', (evt: Event) => {
      const target = evt.target as Node;

      // ⛔️ Si el click es en el botón hamburguesa, no cierres nada
      if (this.toggleBtn && this.toggleBtn.nativeElement.contains(target)) {
        return;
      }

      // 1) Menú móvil abierto → click fuera de nav-collapse → cerrar todo
      if (this.isMenuOpen && this.navCollapse &&
          !this.navCollapseMenu.nativeElement.contains(target)) {
        console.log('Click FUERA de nav-collapse (menú móvil) → cerrar todo');
        this.closeAll();
        return;
      }

      // 2) Submenús (desktop/móvil) → click FUERA del <li> correspondiente
      if (this.submenus.cine && this.submenuCine &&
          !this.submenuCine.nativeElement.contains(target)) {
        console.log('Click FUERA del submenu Cine → cerrar Cine');
        this.submenus.cine = false;
      }

      if (this.submenus.series && this.submenuSeries &&
          !this.submenuSeries.nativeElement.contains(target)) {
        console.log('Click FUERA del submenu Series → cerrar Series');
        this.submenus.series = false;
      }

      // 3) (Opcional) En desktop: si hay submenús abiertos y el click es fuera de nav-collapse, ciérralos
      if (this.anySubmenuOpen() && this.navCollapse &&
          !this.navCollapseMenu.nativeElement.contains(target)) {
        console.log('Click FUERA de nav-collapse con submenús abiertos → cerrar submenús');
        this.resetSubmenus();
      }
    });


  }

  ngOnDestroy(): void {

    this.routerSub?.unsubscribe();

    this.unlistenDocClick?.();

  }

  handleScroll(): void {
    this.onNavLinkClick();
    
  }

  logout() {


    this.authService.logout().subscribe({
      next: () => {
        this.authService.setUser(null);
        this.closeAll();

        if(this.currentUrl == '/dashboard/favorites') {
          this.router.navigate(['/dashboard/home']);
        }
        
        
      },
      error: (error) => console.error('Error al cerrar sesión:', error)
    });
  }

  toggleMenu(): void {

    this.isMenuOpen = !this.isMenuOpen;
    if (!this.isMenuOpen) {
      this.resetSubmenus();
    }

  }

  toggleSubmenu(key: SubmenuKey, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    // cierre de otros submenús
    (Object.keys(this.submenus) as SubmenuKey[]).forEach(k => {
      if (k !== key) this.submenus[k] = false;
    });
    this.submenus[key] = !this.submenus[key];
  }

  onNavLinkClick(): void {
    this.closeAll();
  }

  closeAll(): void {
    this.isMenuOpen = false;
    this.resetSubmenus();
  }

  private resetSubmenus(): void {
    (Object.keys(this.submenus) as SubmenuKey[]).forEach(k => (this.submenus[k] = false));
  }

  private anySubmenuOpen(): boolean {
    return this.submenus.cine || this.submenus.series;
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 1024 && (this.isMenuOpen || this.anySubmenuOpen())) {
      this.closeAll();
    }
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.isMenuOpen || this.anySubmenuOpen()) this.closeAll();
  }

  private updateNavbarCompact(): void {
    // 1) Intenta leer la metadata del child más profundo
    let r: ActivatedRoute | null = this.route;
    while (r?.firstChild) r = r.firstChild;

    const byData = !!r?.snapshot.data?.['navbarGrande'];

    this.isNavbarGrande = byData;
  }

  toogleFooter() {
  
    this.footerWrap.nativeElement.classList.toggle('nonExpanded-footer')

    this.footerIcon.nativeElement.innerHTML == '☰' ?
      this.footerIcon.nativeElement.innerHTML = '✖' : this.footerIcon.nativeElement.innerHTML = '☰';

    if(!this.isTabletOrMobile)  {
      this.footerBottom.nativeElement.classList.toggle('nonExpanded-footer')
    }

    if(this.isTabletOrMobile) {
      this.footerIconMobile.nativeElement.classList.toggle('nonExpanded-footer')
    } 
    
    
  }

  openLink(path: string) {
    this.toogleFooter();
    this.router.navigate([path]);
  }

  onSubmitSearch(): void {
    if (this.searchForm.invalid) {
      return;
    }
    const value = (this.searchForm.value.query ?? '').trim();
    if (!value) {
      return;
    }

    console.log('🔎 Buscar:', value);
    // Más adelante:
    // this.router.navigate(['/dashboard/buscar'], { queryParams: { q: value } });
  }

}
