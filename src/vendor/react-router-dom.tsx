/**
 * Minimal `react-router-dom` compatibility shim for the PaikarMart source tree.
 *
 * The project runs on TanStack Start (TanStack Router owns the document shell),
 * so react-router-dom is not installed. This module implements the subset of
 * the react-router-dom API the PaikarMart codebase uses — BrowserRouter,
 * Routes/Route, Link, NavLink, Navigate, Outlet, useNavigate, useParams,
 * useLocation and useSearchParams — on top of the History API.
 */
import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

export interface LocationObject {
  pathname: string;
  search: string;
  hash: string;
  state: Record<string, unknown> | null;
  key: string;
}

export type Location = LocationObject;
export type To =
  | string
  | number
  | Partial<{ pathname: string; search: string; hash: string; state: unknown }>;

export interface NavigateOptions {
  replace?: boolean;
  state?: unknown;
}

export type NavigateFunction = (to: To, options?: NavigateOptions) => void;

export type SearchParamsInit =
  | string
  | Record<string, string | string[] | undefined>
  | URLSearchParams;

export interface RouteProps {
  path?: string;
  index?: boolean;
  element?: ReactNode;
  children?: ReactNode;
}

interface RouteDef {
  path: string;
  element?: ReactNode;
  children?: RouteDef[];
}

interface Match {
  def: RouteDef;
  params: Record<string, string>;
  pathname: string;
}

interface RouterContextValue {
  location: LocationObject;
  navigate: NavigateFunction;
}

interface MatchContextValue {
  params: Record<string, string | undefined>;
  matches: Match[];
  index: number;
}

const RouterContext = createContext<RouterContextValue | null>(null);
const MatchContext = createContext<MatchContextValue>({
  params: {},
  matches: [],
  index: 0,
});

let historyIdx = 0;

function readLocation(): LocationObject {
  if (typeof window === "undefined") {
    return { pathname: "/", search: "", hash: "", state: null, key: "default" };
  }
  const state = (window.history.state ?? {}) as {
    usr?: unknown;
    key?: string;
  };
  return {
    pathname: window.location.pathname || "/",
    search: window.location.search,
    hash: window.location.hash,
    state: (state.usr ?? null) as Record<string, unknown> | null,
    key: state.key || "default",
  };
}

function normalizeSearch(search: unknown): string {
  if (!search) return "";
  if (typeof search === "string") {
    const qs = search.startsWith("?") ? search.slice(1) : search;
    return qs ? `?${qs}` : "";
  }
  if (search instanceof URLSearchParams) {
    const qs = search.toString();
    return qs ? `?${qs}` : "";
  }
  if (typeof search === "object") {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(search as Record<string, unknown>)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) value.forEach((item) => sp.append(key, String(item)));
      else sp.set(key, String(value));
    }
    const qs = sp.toString();
    return qs ? `?${qs}` : "";
  }
  return "";
}

function resolveTo(
  to: Exclude<To, number>,
  current: LocationObject
): { pathname: string; search: string; hash: string } {
  if (typeof to === "string") {
    let rest = to;
    let hash = "";
    let search = "";
    const hashIdx = rest.indexOf("#");
    if (hashIdx >= 0) {
      hash = rest.slice(hashIdx);
      rest = rest.slice(0, hashIdx);
    }
    const searchIdx = rest.indexOf("?");
    if (searchIdx >= 0) {
      search = rest.slice(searchIdx);
      rest = rest.slice(0, searchIdx);
    }
    if (rest && !rest.startsWith("/")) {
      // Resolve relative paths against the current location.
      const currentSegments = current.pathname.split("/").filter(Boolean);
      const segments = rest.split("/").filter(Boolean);
      while (segments[0] === "." || segments[0] === "..") {
        const seg = segments.shift() as string;
        if (seg === "..") currentSegments.pop();
      }
      rest = "/" + [...currentSegments, ...segments].join("/");
    }
    return { pathname: rest || "/", search, hash };
  }
  return {
    pathname: to.pathname ?? current.pathname,
    search: normalizeSearch(to.search),
    hash: to.hash ?? "",
  };
}

export function BrowserRouter({ children }: { children?: ReactNode }) {
  const [location, setLocation] = useState<LocationObject>(readLocation);
  const locationRef = useRef(location);
  locationRef.current = location;

  const navigate = useCallback<NavigateFunction>((to, options = {}) => {
    if (typeof to === "number") {
      window.history.go(to);
      return;
    }
    const resolved = resolveTo(to, locationRef.current);
    const url = resolved.pathname + resolved.search + resolved.hash;
    const key = Math.random().toString(36).slice(2);
    const state = { usr: options.state ?? null, key, idx: ++historyIdx };
    if (options.replace) window.history.replaceState(state, "", url);
    else window.history.pushState(state, "", url);
    setLocation({
      pathname: resolved.pathname,
      search: resolved.search,
      hash: resolved.hash,
      state: (state.usr ?? null) as Record<string, unknown> | null,
      key,
    });
  }, []);

  useEffect(() => {
    const onPopState = () => setLocation(readLocation());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Seed the history entry so back/forward works after a full page load.
  useEffect(() => {
    const state = window.history.state as { key?: string } | null;
    if (!state || !state.key) {
      window.history.replaceState(
        { usr: null, key: "default", idx: ++historyIdx },
        "",
        window.location.href
      );
    }
  }, []);

  const value = useMemo<RouterContextValue>(() => ({ location, navigate }), [location, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useLocation(): LocationObject {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("react-router-dom shim: useLocation() requires <BrowserRouter>.");
  return ctx.location;
}

export function useNavigate(): NavigateFunction {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("react-router-dom shim: useNavigate() requires <BrowserRouter>.");
  return ctx.navigate;
}

export function useParams<T = Record<string, string | undefined>>(): T {
  return useContext(MatchContext).params as T;
}

export function useSearchParams(): [
  URLSearchParams,
  (next: SearchParamsInit | ((prev: URLSearchParams) => SearchParamsInit), options?: NavigateOptions) => void,
] {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const setSearchParams = useCallback(
    (
      next: SearchParamsInit | ((prev: URLSearchParams) => SearchParamsInit),
      options: NavigateOptions = {}
    ) => {
      const base = typeof next === "function" ? next(searchParams) : next;
      const search = normalizeSearch(base);
      navigate({ pathname: location.pathname, search }, options);
    },
    [navigate, searchParams, location.pathname]
  );

  return [searchParams, setSearchParams];
}

/* ------------------------------------------------------------------ */
/* Route definitions and matching                                      */
/* ------------------------------------------------------------------ */

export function Route(_props: RouteProps): null {
  return null;
}
Route.__isPaikarRoute = true;

export function Routes({ children }: { children?: ReactNode }) {
  const router = useContext(RouterContext);
  if (!router) throw new Error("react-router-dom shim: <Routes> requires <BrowserRouter>.");

  const defs = useMemo(() => collectRoutes(children), [children]);
  const chain = useMemo(
    () => matchRoutes(defs, router.location.pathname),
    [defs, router.location.pathname]
  );

  if (!chain || chain.length === 0) return null;

  const params: Record<string, string | undefined> = {};
  for (const match of chain) Object.assign(params, match.params);

  return <MatchRenderer matches={chain} index={0} params={params} />;
}

function MatchRenderer({
  matches,
  index,
  params,
}: {
  matches: Match[];
  index: number;
  params: Record<string, string | undefined>;
}) {
  const match = matches[index];
  if (!match) return null;
  return (
    <MatchContext.Provider value={{ params, matches, index }}>
      {match.def.element ?? null}
    </MatchContext.Provider>
  );
}

export function Outlet(): ReactNode {
  const ctx = useContext(MatchContext);
  const next = ctx.index + 1;
  if (next >= ctx.matches.length) return null;
  return <MatchRenderer matches={ctx.matches} index={next} params={ctx.params} />;
}

export function Navigate({
  to,
  replace,
  state,
}: {
  to: To;
  replace?: boolean;
  state?: unknown;
}): null {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace, state });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeof to === "object" ? JSON.stringify(to) : to, replace, JSON.stringify(state) ?? ""]);
  return null;
}

/* ------------------------------------------------------------------ */
/* Link components                                                     */
/* ------------------------------------------------------------------ */

function isModifiedClick(event: ReactMouseEvent): boolean {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function toHref(to: To): string {
  if (typeof to === "string") return to;
  if (typeof to === "number") return "";
  const pathname = to.pathname ?? "";
  const search = normalizeSearch(to.search);
  return pathname + search + (to.hash ?? "");
}

export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "style"> {
  to: To;
  replace?: boolean;
  state?: unknown;
  className?: string | ((args: { isActive?: boolean; isPending?: boolean }) => string | undefined);
  style?:
    | React.CSSProperties
    | ((args: { isActive?: boolean; isPending?: boolean }) => React.CSSProperties | undefined);
}

export const Link = ({
  to,
  replace,
  state,
  onClick,
  target,
  className,
  style,
  ...rest
}: LinkProps) => {
  const navigate = useNavigate();
  const external = typeof to === "string" && /^https?:\/\//i.test(to);
  const resolvedClassName =
    typeof className === "function" ? className({}) : className;
  const resolvedStyle = typeof style === "function" ? style({}) : style;

  if (external || (target && target !== "_self")) {
    return (
      <a
        href={toHref(to)}
        target={target}
        onClick={onClick}
        className={resolvedClassName}
        style={resolvedStyle}
        {...rest}
      />
    );
  }

  const handleClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || isModifiedClick(event)) return;
    event.preventDefault();
    navigate(to, { replace, state });
  };

  return (
    <a
      href={toHref(to)}
      onClick={handleClick}
      className={resolvedClassName}
      style={resolvedStyle}
      {...rest}
    />
  );
};

export interface NavLinkProps extends LinkProps {
  end?: boolean;
  className?:
    | string
    | ((args: { isActive: boolean; isPending?: boolean }) => string | undefined);
  style?:
    | React.CSSProperties
    | ((args: { isActive: boolean; isPending?: boolean }) => React.CSSProperties | undefined);
}

export const NavLink = ({ to, end, className, style, ...rest }: NavLinkProps) => {
  const location = useLocation();
  const toPath = typeof to === "string" ? to : (to as { pathname?: string }).pathname ?? "";
  const toPathname = toPath.split("?")[0].split("#")[0] || "/";
  const isActive =
    location.pathname === toPathname ||
    (!end && toPathname !== "/" && location.pathname.startsWith(toPathname + "/"));

  const resolvedClassName =
    typeof className === "function" ? className({ isActive }) : className;
  const resolvedStyle = typeof style === "function" ? style({ isActive }) : style;

  return (
    <Link
      to={to}
      className={resolvedClassName}
      style={resolvedStyle}
      aria-current={isActive ? "page" : undefined}
      {...rest}
    />
  );
};

/* ------------------------------------------------------------------ */
/* Internal matching helpers                                           */
/* ------------------------------------------------------------------ */

function collectRoutes(children: ReactNode): RouteDef[] {
  const defs: RouteDef[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const props = child.props as RouteProps & { children?: ReactNode };
    if (child.type === Route) {
      const def: RouteDef = { path: props.index ? "" : props.path ?? "", element: props.element };
      const kids = collectRoutes(props.children);
      if (kids.length > 0) def.children = kids;
      defs.push(def);
    } else if (props.children) {
      defs.push(...collectRoutes(props.children));
    }
  });
  return defs;
}

function normalize(pattern: string): string {
  const collapsed = pattern.replace(/\/{2,}/g, "/");
  return collapsed.length > 1 ? collapsed.replace(/\/+$/, "") : collapsed || "/";
}

function joinPath(parent: string, child: string): string {
  if (!parent || parent === "/") return normalize("/" + child);
  return normalize(`${parent}/${child}`);
}

function matchPath(
  pattern: string,
  pathname: string
): Record<string, string> | null {
  const pat = normalize(pattern);
  if (pat === "/") {
    return pathname === "/" || pathname === "" ? {} : null;
  }
  const patSegments = pat.split("/").filter(Boolean);
  const pathSegments = pathname.split("/").filter(Boolean);
  const params: Record<string, string> = {};

  for (let i = 0; i < patSegments.length; i++) {
    const segment = patSegments[i] as string;
    if (segment === "*") {
      params["*"] = pathSegments.slice(i).join("/");
      return params;
    }
    if (segment.startsWith(":")) {
      const value = pathSegments[i];
      if (value === undefined) return null;
      params[segment.slice(1)] = decodeURIComponent(value);
    } else if (pathSegments[i] !== segment) {
      return null;
    }
  }

  if (pathSegments.length > patSegments.length) return null;
  return params;
}

function matchRoutes(defs: RouteDef[], pathname: string, parentPath = ""): Match[] | null {
  for (const def of defs) {
    const declared = def.path;
    let pattern: string;
    if (parentPath.endsWith("/*")) {
      // Children of a root splat are matched from the site root, which is how
      // the PaikarMart route tables are written.
      pattern = declared.startsWith("/") ? normalize(declared) : declared === "*" ? "/*" : "/" + declared;
    } else if (declared === "") {
      pattern = parentPath || "/";
    } else if (declared.startsWith("/")) {
      pattern = normalize(declared);
    } else {
      pattern = joinPath(parentPath, declared);
    }

    const params = matchPath(pattern, pathname);
    if (params) {
      const childMatches = def.children ? matchRoutes(def.children, pathname, pattern) : null;
      if (childMatches) {
        return [{ def, params, pathname: pattern }, ...childMatches];
      }
      if (def.element) {
        return [{ def, params, pathname: pattern }];
      }
    }
  }
  return null;
}

export default {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
  Outlet,
  useNavigate,
  useParams,
  useLocation,
  useSearchParams,
};
