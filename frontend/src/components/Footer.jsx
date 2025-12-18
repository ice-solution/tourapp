import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'

const Footer = ({ actions = [], value = 0, onChange }) => {
  // 如果沒有 actions，顯示簡單的版權信息
  if (!actions || actions.length === 0) {
    return (
      <Box sx={{ bgcolor: '#f7f7f7', py: 3, mt: 4 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © 2025 All Rights Reserved
            </Typography>
          </Box>
        </Container>
      </Box>
    )
  }

  return (
    <Box className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl">
      <Container maxWidth="sm" disableGutters>
        <BottomNavigation
          value={value}
          onChange={onChange}
          showLabels
          sx={{
            '& .MuiBottomNavigationAction-label': {
              fontWeight: 600,
              lineHeight: 1.1,
            },
          }}
        >
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <BottomNavigationAction
                key={action.id || action.labelEn || index}
                icon={<Icon />}
                label={
                  <span className="flex flex-col text-xs">
                    <span>{action.labelZh}</span>
                    <span className="text-[10px] uppercase tracking-wide text-[#666]">
                      {action.labelEn}
                    </span>
                  </span>
                }
                value={index}
              />
            )
          })}
        </BottomNavigation>
      </Container>
    </Box>
  )
}

export default Footer


