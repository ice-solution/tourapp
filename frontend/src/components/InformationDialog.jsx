import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import Slide from '@mui/material/Slide'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import ButtonBase from '@mui/material/ButtonBase'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Divider from '@mui/material/Divider'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import HotelIcon from '@mui/icons-material/Hotel'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import EventNoteIcon from '@mui/icons-material/EventNote'

const InformationDialog = ({ open, onClose, tile }) => {
  const [selectedTitleId, setSelectedTitleId] = useState(null)
  const [cardVisible, setCardVisible] = useState(false)

  if (!tile || !tile.informationData) {
    return null
  }

  const { informationData } = tile
  const { category, backgroundImage, titles, items } = informationData

  // 使用新的 titles 結構，如果沒有則使用舊的 items 結構（向後兼容）
  const displayTitles = titles && titles.length > 0 
    ? titles 
    : (items && items.length > 0 
      ? items.map((item, index) => ({
          id: `item-${index}`,
          titleZh: item.subtitleZh || '',
          titleEn: item.subtitleEn || '',
          details: [item],
        }))
      : [])

  const selectedTitle = displayTitles.find(t => t.id === selectedTitleId)

  // 根據 category 選擇對應的 icon
  const getCategoryIcon = () => {
    const categoryLower = category?.toLowerCase() || ''
    switch (categoryLower) {
      case 'hotel':
        return HotelIcon
      case 'flight-hotel':
      case 'flight':
        return FlightTakeoffIcon
      case 'travel':
      case 'travel-guide':
        return MenuBookIcon
      case 'event':
        return EventNoteIcon
      default:
        return null
    }
  }

  const CategoryIcon = getCategoryIcon()

  const handleClose = () => {
    setSelectedTitleId(null)
    setCardVisible(false)
    onClose()
  }

  const handleTitleClick = (titleId) => {
    setSelectedTitleId(titleId)
  }

  const handleBack = () => {
    setSelectedTitleId(null)
  }

  // 當 dialog 打開時，顯示卡片動畫
  if (open && !cardVisible) {
    setTimeout(() => setCardVisible(true), 120)
  }
  if (!open) {
    setCardVisible(false)
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
            backgroundImage: backgroundImage
              ? `linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.7)), url(${backgroundImage})`
              : 'linear-gradient(180deg, rgba(58,44,80,0.9), rgba(58,44,80,0.95))',
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
            onClick={selectedTitleId ? handleBack : handleClose}
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
              {selectedTitle ? (selectedTitle.titleZh || selectedTitle.titleEn) : (tile.primary || tile.titleZh)}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mt: 0.5 }}>
              {selectedTitle ? (selectedTitle.titleEn || selectedTitle.titleZh) : (tile.secondary || tile.titleEn)}
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
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            {selectedTitle ? (
              // 顯示選中標題的詳細資料
              <Stack spacing={3}>
                {selectedTitle.details && selectedTitle.details.length > 0 ? (
                  selectedTitle.details.map((detail, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <Stack spacing={2}>
                        {(detail.subtitleZh || detail.subtitleEn) && (
                          <>
                            <Typography variant="h6" fontWeight={600} color="primary">
                              {detail.subtitleZh || detail.subtitleEn}
                            </Typography>
                            {detail.subtitleZh && detail.subtitleEn && detail.subtitleZh !== detail.subtitleEn && (
                              <Typography variant="subtitle2" color="text.secondary">
                                {detail.subtitleEn}
                              </Typography>
                            )}
                            <Divider />
                          </>
                        )}
                        {detail.contentZh && (
                          <Box
                            sx={{
                              '& p': { mb: 1.5 },
                              '& p:last-child': { mb: 0 },
                              '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
                            }}
                            dangerouslySetInnerHTML={{ __html: detail.contentZh }}
                          />
                        )}
                        {detail.contentEn && detail.contentEn !== detail.contentZh && (
                          <Box
                            sx={{
                              '& p': { mb: 1.5 },
                              '& p:last-child': { mb: 0 },
                              '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
                            }}
                            dangerouslySetInnerHTML={{ __html: detail.contentEn }}
                          />
                        )}
                      </Stack>
                    </Paper>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      暫無詳細資料 / No details available
                    </Typography>
                  </Box>
                )}
              </Stack>
            ) : (
              // 顯示標題列表
              <Stack spacing={2.5}>
                {displayTitles.length > 0 ? (
                  displayTitles.map((title) => (
                    <ButtonBase
                      key={title.id}
                      onClick={() => handleTitleClick(title.id)}
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
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: '#c9503d',
                            boxShadow: '0 4px 12px rgba(201, 80, 61, 0.15)',
                          },
                        }}
                      >
                        <Stack spacing={0.5}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: '#111' }}>
                            {title.titleZh || title.titleEn}
                          </Typography>
                          {title.titleEn && title.titleZh !== title.titleEn && (
                            <Typography variant="body2" sx={{ color: '#7a7a7a' }}>
                              {title.titleEn}
                            </Typography>
                          )}
                        </Stack>
                        {CategoryIcon && (
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 10,
                              right: 14,
                              opacity: 0.3,
                            }}
                          >
                            <CategoryIcon
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
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      暫無標題 / No titles available
                    </Typography>
                  </Box>
                )}
              </Stack>
            )}
          </Paper>
        </Slide>
      </Box>
    </Dialog>
  )
}

export default InformationDialog
