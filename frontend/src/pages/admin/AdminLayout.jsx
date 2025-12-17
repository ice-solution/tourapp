import { useEffect, useMemo } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import AssignmentIcon from '@mui/icons-material/Assignment'
import ColorLensIcon from '@mui/icons-material/ColorLens'
import ImageIcon from '@mui/icons-material/Image'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import CloudQueueIcon from '@mui/icons-material/CloudQueue'
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import SettingsIcon from '@mui/icons-material/Settings'
import Divider from '@mui/material/Divider'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

const NAV_ITEMS = [
  { label: 'Event ID', subLabel: '建立 / 管理活動頁', path: 'overview', icon: DashboardCustomizeIcon },
  { label: 'Theme', subLabel: '背景與主題設定', path: 'theme', icon: ColorLensIcon },
  { label: 'Banner', subLabel: '輪播圖設定', path: 'banners', icon: ImageIcon },
  { label: '九宮格', subLabel: '功能入口排序', path: 'tiles', icon: ViewModuleIcon },
  { label: 'Event 用戶', subLabel: '登入權限管理', path: 'users', icon: PeopleOutlineIcon },
  { label: '登記管理', subLabel: '查看與管理登記', path: 'registrations', icon: AssignmentIndIcon },
  { label: '登記表單配置', subLabel: 'JSON 配置表單選項', path: 'registration-form-config', icon: SettingsIcon },
  { label: '天氣', subLabel: '地點與 7 日預報', path: 'weather', icon: CloudQueueIcon },
]

const drawerWidth = 288

const AdminLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const { isAuthenticated, logout } = useAdminAuth()
  const eventId = params.eventId

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return null
  }

  const activePath = useMemo(() => {
    if (location.pathname === '/admin/events') return '/admin/events'
    return location.pathname.split('/').slice(-1)[0] || 'overview'
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f7f7f7' }}>
      <AppBar position="fixed" sx={{ ml: `${drawerWidth}px`, width: { sm: `calc(100% - ${drawerWidth}px)` }, backgroundColor: '#c9503d' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1 }}>
              Manulife Event Admin
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              管理 App 活動內容與設定
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutOutlinedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            paddingTop: 8,
            backgroundColor: '#ffffff',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          {!eventId && (
            <>
              <List>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={activePath === '/admin/events'}
                    onClick={() => navigate('/admin/events')}
                    sx={{ borderRadius: 1, mx: 1, my: 0.5 }}
                  >
                    <ListItemIcon>
                      <AssignmentIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="活動列表" secondary="選擇或建立活動" />
                  </ListItemButton>
                </ListItem>
              </List>
            </>
          )}
          {eventId && (
            <>
              <List>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => navigate('/admin/events')}
                    sx={{ borderRadius: 1, mx: 1, my: 0.5 }}
                  >
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText primary="返回活動列表" secondary={`當前: ${eventId}`} />
                  </ListItemButton>
                </ListItem>
              </List>
              <Divider sx={{ mx: 2, my: 1 }} />
              <List>
                {NAV_ITEMS.map((item) => {
                  const IconComponent = item.icon
                  const selected = activePath === item.path
                  return (
                    <ListItem key={item.path} disablePadding>
                      <ListItemButton
                        selected={selected}
                        onClick={() => navigate(`/admin/events/${eventId}/${item.path}`)}
                        sx={{ borderRadius: 1, mx: 1, my: 0.5 }}
                      >
                        <ListItemIcon>
                          <IconComponent color={selected ? 'primary' : 'inherit'} />
                        </ListItemIcon>
                        <ListItemText primary={item.label} secondary={item.subLabel} />
                      </ListItemButton>
                    </ListItem>
                  )
                })}
              </List>
            </>
          )}
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4, mt: 8, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}

export default AdminLayout
