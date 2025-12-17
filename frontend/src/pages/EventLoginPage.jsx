import { useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

const backgroundUrl =
  'https://images.unsplash.com/photo-1506976785307-8732e854ad89?auto=format&fit=crop&w=1200&q=80'

const EventLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Box
      className="min-h-screen"
      sx={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.75)), url(${backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box className="flex flex-col flex-1 px-6 pt-14 pb-10 text-white">
        <Stack spacing={1.5} className="mt-8">
          <Typography variant="h4" fontWeight={700}>
            墨爾本會議
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Melbourne Conference
          </Typography>
          <Typography variant="h4" fontWeight={800} color="#f2354b">
            2025
          </Typography>
        </Stack>

        <Box className="mt-auto">
          <Paper
            elevation={20}
            className="rounded-[32px] p-6"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(0,0,0,0.04)',
            }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  電郵 / Email
                </Typography>
                <TextField
                  fullWidth
                  placeholder="請使用公司電郵 e.g. xxxx@pruhk.com"
                  variant="outlined"
                  margin="dense"
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  密碼 / Password
                </Typography>
                <TextField
                  fullWidth
                  placeholder="請填寫 8 位數字顧問編號"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  margin="dense"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                          <VisibilityOffIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: 999,
                  py: 1.5,
                  fontWeight: 700,
                  backgroundColor: '#e43d47',
                  '&:hover': { backgroundColor: '#cf2933' },
                }}
              >
                登入 LOGIN
              </Button>
              <Typography variant="body2" align="center" color="text.secondary">
                <Link to="#" className="text-[#e43d47] no-underline">
                  忘記密碼 / Forget password
                </Link>
              </Typography>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export default EventLoginPage


