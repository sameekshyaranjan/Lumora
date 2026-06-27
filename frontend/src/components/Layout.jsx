import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  const location = useLocation();
  // We don't want the navbar to overlay on top of the feed videos, 
  // or maybe we do, but let's make it transparent/fixed on the feed 
  // so it doesn't break the immersive experience.
  const isFeedPage = location.pathname === '/courses';

  return (
    <div className={`app-layout ${isFeedPage ? 'feed-layout' : ''}`}>
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
