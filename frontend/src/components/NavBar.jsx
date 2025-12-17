import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Stack from '@mui/material/Stack'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'

const NavBar = ({ title = 'Travel Agency', showNotifications = true, notificationCount = 0 }) => {
  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffffff', color: '#1f1f1f' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Stack spacing={0} className="text-left">
          <Typography variant="subtitle2" fontWeight={700} className="uppercase text-[#257b4a]">
            {title}
          </Typography>
        </Stack>
        {showNotifications && (
          <IconButton aria-label="notifications">
            <Badge color="secondary" variant="dot" badgeContent={notificationCount || undefined}>
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default NavBar


