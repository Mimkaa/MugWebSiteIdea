import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // Do not detach any route.
    return false;
  }
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    // We are not storing any routes.
  }
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    // Never reattach a stored route.
    return false;
  }
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    // Since we don't store routes, always return null.
    return null;
  }
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // For the '/home' route, force a reload by returning false.
    if (future.routeConfig && future.routeConfig.path === 'home') {
      return false;
    }
    // Otherwise, use the default behavior.
    return future.routeConfig === curr.routeConfig;
  }
}
