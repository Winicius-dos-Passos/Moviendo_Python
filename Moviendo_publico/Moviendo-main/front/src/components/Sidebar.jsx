import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Film, 
  List, 
  BarChart3, 
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Film, label: 'Biblioteca', path: '/biblioteca' },
    { icon: List, label: 'Listas', path: '/listas' },
    { icon: BarChart3, label: 'Estatísticas', path: '/estatisticas' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-black border-r border-purple-900/30 flex flex-col items-center py-6 z-50">
      <nav className="flex-1 flex flex-col gap-4 w-full px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ scale: 1.05, x: 2 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative w-full h-14 rounded-xl flex items-center justify-center
                  transition-all duration-200 group
                  ${active 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' 
                    : 'text-gray-400 hover:text-purple-400 hover:bg-purple-950/30'
                  }
                `}
              >
                <Icon className="w-6 h-6" />
                
                <div className="absolute left-full ml-4 px-3 py-2 bg-purple-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-purple-900" />
                </div>
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-8 bg-white rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
