import { Outlet, useLocation } from 'react-router-dom'
import TopNav from '../components/TopNav'
import { motion } from 'framer-motion'

const DashboardLayout = () => {
  const location = useLocation()

  return (
    <div className="flex flex-col h-screen bg-[#0B0F14] overflow-hidden">
      {/* Horizontal top navbar only */}
      <TopNav />

      {/* Main scrollable content */}
      <main className="flex-1 overflow-y-auto">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="p-5 lg:p-8 min-h-full"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}

export default DashboardLayout
