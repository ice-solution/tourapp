import { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import Slide from '@mui/material/Slide'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import ButtonBase from '@mui/material/ButtonBase'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const GuideDialog = ({ open, onClose, title, subtitle, backgroundImage, options, icon: IconComponent }) => {
  const [cardVisible, setCardVisible] = useState(false)

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setCardVisible(true), 120)
      return () => clearTimeout(timer)
    }
    setCardVisible(false)
    return undefined
  }, [open])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          overflow: 'hidden',
        },
      }}
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* 背景圖片 */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.7)), url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* 頂部標題與返回按鈕 */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            pt: 8,
            px: 3,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
              mt: 0.5,
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Stack spacing={0}>
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white', lineHeight: 1.2 }}>
              {title}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mt: 0.5 }}>
              {subtitle}
            </Typography>
          </Stack>
        </Box>

        {/* 從底部滑出的白色卡片 */}
        <Slide direction="up" in={cardVisible} timeout={400}>
          <Paper
            elevation={12}
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              borderTopLeftRadius: '32px',
              borderTopRightRadius: '32px',
              backgroundColor: '#fdfdfd',
              minHeight: '60%',
              zIndex: 3,
              pt: 4,
              px: 3,
              pb: 4,
              boxShadow: '0 -20px 60px rgba(0,0,0,0.25)',
            }}
          >
            <Stack spacing={2.5}>
              {options.map((option) => (
                <ButtonBase
                  key={option.id}
                  onClick={() => {
                    if (option.onClick) {
                      option.onClick(option.id)
                    } else {
                      console.log('Selected:', option.id)
                    }
                  }}
                  sx={{
                    width: '100%',
                    display: 'block',
                    textAlign: 'left',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      position: 'relative',
                      width: '100%',
                      px: 3,
                      py: 2.5,
                      borderRadius: '18px',
                      backgroundColor: 'white',
                      border: '1px solid rgba(0, 0, 0, 0.06)',
                      overflow: 'hidden',
                    }}
                  >
                    <Stack spacing={0.5}>
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#111' }}>
                        {option.titleZh}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7a7a7a' }}>
                        {option.titleEn}
                      </Typography>
                    </Stack>
                    {IconComponent && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 10,
                          right: 14,
                          opacity: 0.3,
                        }}
                      >
                        <IconComponent
                          sx={{
                            color: '#f8a1b5',
                            fontSize: 38,
                            transform: 'rotate(-5deg)',
                          }}
                        />
                      </Box>
                    )}
                  </Paper>
                </ButtonBase>
              ))}
            </Stack>
          </Paper>
        </Slide>
      </Box>
    </Dialog>
  )
}

export default GuideDialog


