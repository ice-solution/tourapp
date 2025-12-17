import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'

const Footer = ({ actions = [], value = 0, onChange }) => {
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


