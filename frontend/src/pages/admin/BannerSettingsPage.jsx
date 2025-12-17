import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import ImageIcon from '@mui/icons-material/Image'
import Divider from '@mui/material/Divider'
import { api } from '../../utils/api.js'

// Banner 圖片建議尺寸
const BANNER_IMAGE_SIZE = {
  width: 1200,
  height: 400,
  aspectRatio: 3, // 寬高比 3:1
  maxSizeMB: 2, // 最大檔案大小 2MB
}

const BannerSettingsPage = () => {
  const { eventId } = useParams()
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const fileInputRefs = useRef({})

  useEffect(() => {
    loadBanners()
  }, [eventId])

  const loadBanners = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/events/${eventId}`)
      if (response.success && response.data.event?.banners) {
        setBanners(response.data.event.banners || [])
      }
    } catch (error) {
      setError(error.message || '載入 Banner 設定失敗')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (index, field, value) => {
    setBanners((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addBanner = () => {
    setBanners((prev) => [
      ...prev,
      {
        title: '',
        description: '',
        imageUrl: '',
        actionLabel: '',
        actionUrl: '',
      },
    ])
  }

  const removeBanner = (index) => {
    setBanners((prev) => prev.filter((_, i) => i !== index))
    delete fileInputRefs.current[index]
  }

  const handleImageUpload = async (index, file) => {
    if (!file) return

    // 檢查檔案大小
    const maxSize = BANNER_IMAGE_SIZE.maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      setError(`圖片大小不能超過 ${BANNER_IMAGE_SIZE.maxSizeMB}MB`)
      return
    }

    // 檢查檔案類型
    if (!file.type.startsWith('image/')) {
      setError('請上傳圖片檔案')
      return
    }

    try {
      // 讀取圖片並檢查尺寸
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const width = img.width
          const height = img.height
          const aspectRatio = width / height

          // 檢查尺寸（允許一些誤差）
          if (Math.abs(aspectRatio - BANNER_IMAGE_SIZE.aspectRatio) > 0.2) {
            setError(`圖片尺寸建議為 ${BANNER_IMAGE_SIZE.width} x ${BANNER_IMAGE_SIZE.height} (寬高比 3:1)，當前為 ${width} x ${height}`)
            return
          }

          // 將圖片轉換為 base64
          const base64 = e.target.result
          updateField(index, 'imageUrl', base64)
          setError('')
          setMessage('圖片上傳成功')
          setTimeout(() => setMessage(''), 3000)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setError('圖片處理失敗：' + error.message)
    }
  }

  const handleFileInputChange = (index, event) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImageUpload(index, file)
    }
    // 重置 input，允許重新選擇同一檔案
    event.target.value = ''
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setMessage('')
      const response = await api.put(`/events/${eventId}/banners`, { banners })
      if (response.success) {
        setMessage('已儲存 Banner 設定')
        await loadBanners()
      }
    } catch (error) {
      setError(error.message || '儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>
          Banner 輪播圖設定
        </Typography>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={700}>
        Banner 輪播圖設定
      </Typography>
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <Button variant="outlined" startIcon={<AddPhotoAlternateIcon />} onClick={addBanner} sx={{ alignSelf: 'flex-start', borderRadius: 1 }}>
        新增 Banner
      </Button>
      <Stack spacing={2}>
        {banners.map((banner, index) => (
          <Paper key={index} className="rounded-lg p-6" elevation={0}>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <DragIndicatorIcon sx={{ color: '#bbb' }} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Banner {index + 1}
                  </Typography>
                </Stack>
                <IconButton color="error" onClick={() => removeBanner(index)}>
                  <DeleteOutlineIcon />
                </IconButton>
              </Stack>
              <Stack spacing={2}>
                <TextField
                  label="標題"
                  value={banner.title || ''}
                  onChange={(event) => updateField(index, 'title', event.target.value)}
                  fullWidth
                />
                <TextField
                  label="描述"
                  multiline
                  minRows={2}
                  value={banner.description || ''}
                  onChange={(event) => updateField(index, 'description', event.target.value)}
                  fullWidth
                />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    圖片上傳
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    建議尺寸：{BANNER_IMAGE_SIZE.width} x {BANNER_IMAGE_SIZE.height} 像素 (寬高比 3:1)
                    <br />
                    最大檔案大小：{BANNER_IMAGE_SIZE.maxSizeMB}MB
                  </Alert>
                  <Box
                    sx={{
                      border: '2px dashed #ccc',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: banner.imageUrl ? 'transparent' : '#f5f5f5',
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: '#c9503d',
                        bgcolor: '#fff5f5',
                      },
                    }}
                    onClick={() => {
                      if (!fileInputRefs.current[index]) {
                        fileInputRefs.current[index] = document.createElement('input')
                        fileInputRefs.current[index].type = 'file'
                        fileInputRefs.current[index].accept = 'image/*'
                        fileInputRefs.current[index].onchange = (e) => handleFileInputChange(index, e)
                      }
                      fileInputRefs.current[index].click()
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      e.currentTarget.style.borderColor = '#c9503d'
                      e.currentTarget.style.bgcolor = '#fff5f5'
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      e.currentTarget.style.borderColor = '#ccc'
                      e.currentTarget.style.bgcolor = banner.imageUrl ? 'transparent' : '#f5f5f5'
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      e.currentTarget.style.borderColor = '#ccc'
                      e.currentTarget.style.bgcolor = banner.imageUrl ? 'transparent' : '#f5f5f5'
                      const file = e.dataTransfer.files?.[0]
                      if (file) {
                        handleImageUpload(index, file)
                      }
                    }}
                  >
                    {banner.imageUrl ? (
                      <Box>
                        <img
                          src={banner.imageUrl}
                          alt="Banner preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '200px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                          }}
                        />
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CloudUploadIcon />}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!fileInputRefs.current[index]) {
                                fileInputRefs.current[index] = document.createElement('input')
                                fileInputRefs.current[index].type = 'file'
                                fileInputRefs.current[index].accept = 'image/*'
                                fileInputRefs.current[index].onchange = (e) => handleFileInputChange(index, e)
                              }
                              fileInputRefs.current[index].click()
                            }}
                          >
                            更換圖片
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            sx={{ ml: 1 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              updateField(index, 'imageUrl', '')
                            }}
                          >
                            移除圖片
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Box>
                        <CloudUploadIcon sx={{ fontSize: 48, color: '#999', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          點擊上傳圖片
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          或拖放圖片到此處
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <TextField
                    label="或輸入圖片 URL"
                    value={banner.imageUrl?.startsWith('http') ? banner.imageUrl : ''}
                    onChange={(event) => {
                      const url = event.target.value
                      // 如果輸入的是 URL，直接更新；如果是 base64，會被上傳功能覆蓋
                      if (url.startsWith('http') || url === '') {
                        updateField(index, 'imageUrl', url)
                      }
                    }}
                    fullWidth
                    placeholder="https://example.com/image.jpg"
                    helperText={banner.imageUrl?.startsWith('data:') ? '已上傳圖片，輸入 URL 將替換上傳的圖片' : '輸入圖片網址'}
                  />
                </Box>
                <Divider />
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    label="按鈕文字"
                    value={banner.actionLabel || ''}
                    onChange={(event) => updateField(index, 'actionLabel', event.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="連結 URL"
                    value={banner.actionUrl || ''}
                    onChange={(event) => updateField(index, 'actionUrl', event.target.value)}
                    fullWidth
                  />
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
      <Button
        variant="contained"
        onClick={handleSave}
        disabled={saving}
        sx={{ borderRadius: 1, alignSelf: 'flex-start' }}
      >
        {saving ? '儲存中...' : '儲存 Banner 設定'}
      </Button>
    </Stack>
  )
}

export default BannerSettingsPage

