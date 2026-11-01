import React from 'react';
import { Bell, Menu, Search, ShoppingBag, User, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { useCartStore, useCartDrawerStore } from '@/modules/cart';
import { useAuth } from '@/modules/auth';
import { useNotificationsStore } from '@/modules/notification';
import { LocationPicker } from './LocationPicker';

/**
 * Clean app header.
 * Mobile:  menu + brand + search + location + cart + bell + login
 * Desktop: menu + brand + inline search + location + cart + bell + avatar
 * Theme/language live in the side drawer to keep the bar calm.
 */
export const Navbar = ({ onMenuClick, isVisible }: { onMenuClick?: () => void; isVisible?: boolean }) => {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const openCart = useCartDrawerStore((state) => state.open);
  const { user, isAuthenticated } = useAuth();
  const { getUnreadCount } = useNotificationsStore();
  const unreadNotifications = getUnreadCount();
  const navigate = useNavigate();

  return (
    <header
      className={`absolute top-0 left-0 right-0 z-50 glass h-[60px] md:h-[64px] w-full border-b border-[var(--pm-border)]/60 select-none transition-transform duration-300 ease-in-out ${
        isVisible === false ? '-translate-y-full pointer-events-none shadow-none' : 'translate-y-0'
      }`}
    >
      <nav className="w-full mx-auto px-3 sm:px-4 lg:px-6 h-full flex items-center gap-2 sm:gap-3">
        {/* Left: menu + brand */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 text-[var(--pm-text)] hover:bg-[var(--pm-surface-hover)] active:bg-[var(--pm-surface-hover)] rounded-xl transition-colors cursor-pointer"
            title="Menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <Link to="/" className="font-black text-lg sm:text-xl tracking-tight group shrink-0">
            <span className="text-[var(--pm-accent)]">Paikar</span>
            <span className="text-[var(--pm-text)]">Mart</span>
          </Link>
        </div>

        {/* Center: search (desktop inline, mobile icon) */}
        <div className="hidden sm:block flex-1 max-w-md lg:max-w-xl mx-auto min-w-0">
          <SearchBar />
        </div>
        <button
          onClick={() => navigate('/search')}
          className="sm:hidden ml-auto p-2 text-[var(--pm-text-muted)] hover:text-[var(--pm-accent)] active:scale-95 transition-all rounded-xl cursor-pointer"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Right: location + cart + notifications + account */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 ml-auto sm:ml-0">
          <div className="shrink-0">
            <LocationPicker />
          </div>

          <button
            onClick={openCart}
            className="relative p-2 text-[var(--pm-text-muted)] hover:text-[var(--pm-text)] hover:bg-[var(--pm-surface-hover)] rounded-xl transition-all cursor-pointer"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--pm-accent)] text-white text-[8px] font-black rounded-full flex items-center justify-center border border-[var(--pm-surface)] shadow-xs">
                {totalItems}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 text-[var(--pm-text-muted)] hover:text-[var(--pm-text)] hover:bg-[var(--pm-surface-hover)] rounded-xl transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {isAuthenticated && unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-[var(--pm-danger)] text-white text-[8px] font-black rounded-full flex items-center justify-center border border-[var(--pm-surface)]">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Account: avatar (signed in) or login pill */}
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/profile')}
              className="ml-1 shrink-0 cursor-pointer"
              title={user?.fullName || 'Profile'}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.fullName || 'Profile'}
                  className="w-8 h-8 rounded-full object-cover border border-[var(--pm-border)] hover:border-[var(--pm-accent)] transition-colors"
                />
              ) : (
                <span className="w-8 h-8 rounded-full bg-[var(--pm-accent-soft)] text-[var(--pm-accent)] border border-[var(--pm-border)] flex items-center justify-center font-black text-sm hover:border-[var(--pm-accent)] transition-colors">
                  {user?.fullName?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                </span>
              )}
            </button>
          ) : (
            <Link
              to="/login"
              className="ml-1 inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--pm-accent)] hover:bg-[var(--pm-accent-hover)] text-white text-xs font-bold px-3.5 active:scale-95 transition-all shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Login</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
