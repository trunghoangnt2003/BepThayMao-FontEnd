import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AccessTokenStore } from '@bepthaymao/core';
import { filter } from 'rxjs';
import { AuthSessionService } from './features/auth/data-access/auth-session.service';
import { LineIconComponent, LineIconName } from './shared/icon/line-icon';

interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly icon: LineIconName;
}
interface NavGroup {
  readonly title: string;
  readonly items: readonly NavItem[];
}

const SIDE_KEY = 'btm.side';
const MOBILE_QUERY = '(max-width: 56rem)';

const OWNER_NAV: readonly NavGroup[] = [
  {
    title: 'Vận hành',
    items: [
      { path: '/owner/overview', label: 'Tổng quan', icon: 'home' },
      { path: '/owner/orders', label: 'Đơn hàng', icon: 'orders' },
      { path: '/owner/stock', label: 'Còn món', icon: 'toggle' },
    ],
  },
  {
    title: 'Quản trị',
    items: [
      { path: '/owner/dishes', label: 'Thực đơn', icon: 'bowl' },
      { path: '/owner/content', label: 'Giới thiệu quán', icon: 'image' },
      { path: '/owner/branches', label: 'Cơ sở', icon: 'store' },
      { path: '/owner/legal', label: 'Pháp lý và chính sách', icon: 'doc' },
    ],
  },
];
const MANAGER_NAV: readonly NavGroup[] = [
  {
    title: 'Vận hành',
    items: [
      { path: '/manager/overview', label: 'Tổng quan', icon: 'home' },
      { path: '/manager/orders', label: 'Đơn hàng', icon: 'orders' },
      { path: '/manager/stock', label: 'Còn món', icon: 'toggle' },
    ],
  },
  {
    title: 'Cơ sở',
    items: [{ path: '/manager/settings', label: 'Thông số cơ sở', icon: 'settings' }],
  },
];

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDE_KEY) === 'collapsed';
  } catch {
    return false;
  }
}

function saveCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(SIDE_KEY, collapsed ? 'collapsed' : 'open');
  } catch {
    // Bộ nhớ trình duyệt bị chặn: chỉ mất ghi nhớ, sidebar vẫn dùng được.
  }
}

/** Khung admin toàn trang: sidebar thu gọn thành thanh icon trên desktop, ngăn kéo có nền mờ dưới 56rem. */
@Component({
  selector: 'adm-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LineIconComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: { '(document:keydown.escape)': 'closeDrawer()' },
})
export class App {
  protected readonly store = inject(AccessTokenStore);
  protected readonly staffSession = computed(() => {
    const session = this.store.session();
    return session?.role === 'Customer' ? null : session;
  });
  protected readonly nav = computed(() =>
    this.staffSession()?.role === 'Owner' ? OWNER_NAV : MANAGER_NAV,
  );
  protected readonly collapsed = signal(readCollapsed());
  protected readonly drawerOpen = signal(false);
  protected readonly mobile = signal(false);
  protected readonly menuLabel = computed(() => {
    if (this.mobile()) return this.drawerOpen() ? 'Đóng menu' : 'Mở menu';
    return this.collapsed() ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng';
  });
  protected readonly menuExpanded = computed(() =>
    this.mobile() ? this.drawerOpen() : !this.collapsed(),
  );
  private readonly side = viewChild<ElementRef<HTMLElement>>('side');
  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  private readonly auth = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  readonly lang = 'vi';

  constructor() {
    const query = this.matchMedia();
    if (query) {
      this.mobile.set(query.matches);
      const onChange = (event: MediaQueryListEvent): void => {
        this.mobile.set(event.matches);
        this.drawerOpen.set(false);
      };
      query.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => {
        query.removeEventListener('change', onChange);
      });
    }
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.drawerOpen.set(false);
      });
  }

  private matchMedia(): MediaQueryList | null {
    const view = this.document.defaultView;
    return view && typeof view.matchMedia === 'function' ? view.matchMedia(MOBILE_QUERY) : null;
  }

  protected toggleMenu(): void {
    if (!this.mobile()) {
      const next = !this.collapsed();
      this.collapsed.set(next);
      saveCollapsed(next);
      return;
    }
    if (this.drawerOpen()) {
      this.closeDrawer();
      return;
    }
    this.drawerOpen.set(true);
    // inert chỉ gỡ sau lần render kế tiếp, nên focus sau render.
    afterNextRender(
      () => {
        this.side()?.nativeElement.querySelector<HTMLElement>('a')?.focus();
      },
      { injector: this.injector },
    );
  }

  protected closeDrawer(): void {
    if (!this.drawerOpen()) return;
    this.drawerOpen.set(false);
    afterNextRender(
      () => {
        this.menuButton()?.nativeElement.focus();
      },
      { injector: this.injector },
    );
  }

  protected focusMain(event: Event): void {
    event.preventDefault();
    this.document.getElementById('main')?.focus();
  }

  logout(): void {
    this.auth.logout().subscribe(() => {
      void this.router.navigateByUrl('/login');
    });
  }
}
