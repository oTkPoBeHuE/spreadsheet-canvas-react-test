import { Outlet, Router, RouterProvider, Route, RootRoute, useNavigate } from '@tanstack/react-router';

import { GridDataProvider } from '@/shared/state/gridStore';
import { GridShowcasePage } from '@/pages/GridShowcasePage';

const Root = () => (
  <GridDataProvider>
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Outlet />
    </div>
  </GridDataProvider>
);

const rootRoute = new RootRoute({
  component: Root,
});

const RedirectToDefault = () => {
  const navigate = useNavigate();
  // redirect to default grid
  navigate({ to: '/$grid', params: { grid: 'glide' } });
  return null;
};

const homeRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: RedirectToDefault,
});

const gridRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/$grid',
  component: GridShowcasePage,
});

const routeTree = rootRoute.addChildren([homeRoute, gridRoute]);

export const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const AppRouter = () => <RouterProvider router={router} />;
