import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

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
    private elRef: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {

    
    window.addEventListener('resize', () => {
      window.innerWidth <= 1024 ? this.isTabletOrMobile = true : this.isTabletOrMobile = false;
      //console.log(this.isTabletOrMobile)
    });
    

    // Cerrar todo al cambiar ruta
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.updateNavbarCompact();
        this.closeAll()
      });

  }

  ngOnInit(): void {

    this.comprobarUser();
    this.updateNavbarCompact();
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

  comprobarUser() {
    this.authService.getUserInfo().subscribe({
      next: (response) => this.authService.setUser(response.user),
      error: () => this.authService.setUser(null),
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.setUser(null);
        this.closeAll();
        //this.router.navigate(['/dashboard/home']);
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

    //console.log(byData)

    this.isNavbarGrande = byData;
  }
}
