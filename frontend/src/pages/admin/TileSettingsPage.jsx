import { useEffect, useMemo, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import ImageIcon from '@mui/icons-material/Image'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import ScheduleIcon from '@mui/icons-material/Schedule'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import TravelExploreIcon from '@mui/icons-material/TravelExplore'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import DinnerDiningIcon from '@mui/icons-material/DinnerDining'
import LanguageIcon from '@mui/icons-material/Language'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft'
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter'
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight'
import { api } from '../../utils/api.js'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'

const ICON_OPTIONS = [
  { value: 'assignment', label: '登記', icon: <AssignmentTurnedInIcon fontSize="small" /> },
  { value: 'event', label: '行程', icon: <ScheduleIcon fontSize="small" /> },
  { value: 'travel', label: '旅遊', icon: <TravelExploreIcon fontSize="small" /> },
  { value: 'flight', label: '航班酒店', icon: <FlightTakeoffIcon fontSize="small" /> },
  { value: 'info', label: '資訊', icon: <InfoOutlinedIcon fontSize="small" /> },
  { value: 'trophy', label: '精英', icon: <EmojiEventsIcon fontSize="small" /> },
  { value: 'dinner', label: '晚宴', icon: <DinnerDiningIcon fontSize="small" /> },
  { value: 'language', label: '語言', icon: <LanguageIcon fontSize="small" /> },
  { value: 'survey', label: '問卷', icon: <QuestionAnswerIcon fontSize="small" /> },
  { value: 'gallery', label: '相片集', icon: <PhotoLibraryIcon fontSize="small" /> },
  { value: 'external', label: '外部連結', icon: <OpenInNewIcon fontSize="small" /> },
]

const INFORMATION_CATEGORIES = [
  { value: 'hotel', label: '酒店' },
  { value: 'travel', label: '旅遊資訊' },
  { value: 'event', label: '活動內容' },
]

// Tiptap 編輯器組件
const TiptapEditor = ({ value, onChange, onBlur, placeholder }) => {
  const imageInputRef = useRef(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || '請輸入內容...',
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
  })

  const handleImageUpload = () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.onchange = async (event) => {
      const file = event.target.files?.[0]
      if (file) {
        // 檢查檔案大小（最大 2MB）
        const maxSize = 2 * 1024 * 1024
        if (file.size > maxSize) {
          alert('圖片大小不能超過 2MB')
          return
        }

        // 讀取圖片並轉換為 base64
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64 = e.target.result
          if (editor) {
            editor.chain().focus().setImage({ src: base64 }).run()
          }
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '')
    }
  }, [value, editor])

  useEffect(() => {
    if (editor && onBlur) {
      const handleBlur = () => {
        onBlur()
      }
      editor.on('blur', handleBlur)
      return () => {
        editor.off('blur', handleBlur)
      }
    }
  }, [editor, onBlur])

  if (!editor) {
    return null
  }

  return (
    <Box
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        backgroundColor: 'white',
        '& .ProseMirror': {
          minHeight: '200px',
          padding: '16px',
          fontSize: '14px',
          '&:focus': {
            outline: 'none',
          },
          '& p.is-editor-empty:first-child::before': {
            color: '#999',
            float: 'left',
            height: 0,
            pointerEvents: 'none',
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
            margin: '10px auto',
            borderRadius: '4px',
            cursor: 'pointer',
          },
          '& p[style*="text-align"]': {
            textAlign: 'inherit',
          },
        },
      }}
    >
      <Box
        sx={{
          borderBottom: '1px solid #e0e0e0',
          p: 1,
          display: 'flex',
          gap: 0.5,
          flexWrap: 'wrap',
        }}
      >
        <Button
          size="small"
          variant={editor.isActive('bold') ? 'contained' : 'outlined'}
          onClick={() => editor.chain().focus().toggleBold().run()}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          <strong>B</strong>
        </Button>
        <Button
          size="small"
          variant={editor.isActive('italic') ? 'contained' : 'outlined'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          <em>I</em>
        </Button>
        <Button
          size="small"
          variant={editor.isActive('strike') ? 'contained' : 'outlined'}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </Button>
        <Divider orientation="vertical" flexItem />
        <Button
          size="small"
          variant={editor.isActive('heading', { level: 1 }) ? 'contained' : 'outlined'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          H1
        </Button>
        <Button
          size="small"
          variant={editor.isActive('heading', { level: 2 }) ? 'contained' : 'outlined'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          H2
        </Button>
        <Button
          size="small"
          variant={editor.isActive('heading', { level: 3 }) ? 'contained' : 'outlined'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          H3
        </Button>
        <Divider orientation="vertical" flexItem />
        <Button
          size="small"
          variant={editor.isActive('bulletList') ? 'contained' : 'outlined'}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          •
        </Button>
        <Button
          size="small"
          variant={editor.isActive('orderedList') ? 'contained' : 'outlined'}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          1.
        </Button>
        <Divider orientation="vertical" flexItem />
        <Button
          size="small"
          variant={editor.isActive({ textAlign: 'left' }) ? 'contained' : 'outlined'}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          sx={{ minWidth: 'auto', px: 1 }}
          title="左對齊"
        >
          <FormatAlignLeftIcon fontSize="small" />
        </Button>
        <Button
          size="small"
          variant={editor.isActive({ textAlign: 'center' }) ? 'contained' : 'outlined'}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          sx={{ minWidth: 'auto', px: 1 }}
          title="居中"
        >
          <FormatAlignCenterIcon fontSize="small" />
        </Button>
        <Button
          size="small"
          variant={editor.isActive({ textAlign: 'right' }) ? 'contained' : 'outlined'}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          sx={{ minWidth: 'auto', px: 1 }}
          title="右對齊"
        >
          <FormatAlignRightIcon fontSize="small" />
        </Button>
        <Divider orientation="vertical" flexItem />
        <Button
          size="small"
          variant="outlined"
          onClick={handleImageUpload}
          sx={{ minWidth: 'auto', px: 1 }}
          title="插入圖片"
        >
          <ImageIcon fontSize="small" />
        </Button>
        <Divider orientation="vertical" flexItem />
        <Button
          size="small"
          variant="outlined"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          sx={{ minWidth: 'auto', px: 1 }}
          title="撤銷"
        >
          ↶
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          sx={{ minWidth: 'auto', px: 1 }}
          title="重做"
        >
          ↷
        </Button>
      </Box>
      <EditorContent editor={editor} />
    </Box>
  )
}

const TileSettingsPage = () => {
  const { eventId } = useParams()
  const [tiles, setTiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [addingItem, setAddingItem] = useState(null) // 追蹤正在添加項目的 tileId
  const [expandedDates, setExpandedDates] = useState({}) // 追蹤每個日期組的展開狀態
  const [expandedTitles, setExpandedTitles] = useState({}) // 追蹤每個標題的展開狀態
  const fileInputRefs = useRef({}) // 追蹤每個 tile 的 file input

  useEffect(() => {
    loadTiles()
  }, [eventId])

  const loadTiles = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/events/${eventId}`)
      if (response.success) {
        setTiles(response.data.event?.tiles || [])
      } else {
        setError('載入九宮格設定失敗')
      }
    } catch (error) {
      setError(error.message || '載入九宮格設定失敗')
      setTiles([])
    } finally {
      setLoading(false)
    }
  }

  const addTile = async () => {
    try {
      setError('')
      const newTile = {
        titleZh: '',
        titleEn: '',
        iconKey: 'event',
        type: 'schedule',
        scheduleItems: [],
        externalUrl: '',
        order: tiles.length,
        isVisible: true,
      }
      const response = await api.post(`/events/${eventId}/tiles`, newTile)
      if (response.success) {
        await loadTiles()
      } else {
        setError('新增格仔失敗')
      }
    } catch (error) {
      setError(error.message || '新增格仔失敗')
    }
  }

  const removeTile = async (tileId) => {
    try {
      const response = await api.delete(`/events/${eventId}/tiles/${tileId}`)
      if (response.success) {
        await loadTiles()
      }
    } catch (error) {
      setError(error.message || '刪除格仔失敗')
    }
  }

  const updateTile = (tileId, field, value) => {
    // 先更新本地狀態，讓用戶可以即時看到變化
    setTiles((prev) =>
      prev.map((t) => {
        const id = t._id || t.id
        if (id === tileId) {
          // 如果 field 是 'informationData'，需要合併對象
          if (field === 'informationData' && typeof value === 'object') {
            return { ...t, informationData: { ...t.informationData, ...value } }
          }
          return { ...t, [field]: value }
        }
        return t
      })
    )
  }

  const updateInformationData = (tileId, field, value) => {
    // 專門用於更新 informationData 的函數
    setTiles((prev) =>
      prev.map((t) => {
        const id = t._id || t.id
        if (id === tileId) {
          return {
            ...t,
            informationData: {
              ...t.informationData,
              [field]: value,
            },
          }
        }
        return t
      })
    )
  }

  const saveTile = async (tileId, reload = false) => {
    const tile = tiles.find((t) => (t._id || t.id) === tileId)
    if (!tile) return

    // 移除 tile 層級的 MongoDB _id 等內部字段，但保留 scheduleItems 中的 _id
    const { _id, __v, ...tileData } = tile
    
    // 確保 scheduleItems 中的 _id 被保留（如果有的話）
    if (tileData.scheduleItems && Array.isArray(tileData.scheduleItems)) {
      tileData.scheduleItems = tileData.scheduleItems.map(item => {
        // 保留 scheduleItem 的 _id（如果存在）
        const { _id: itemId, ...itemData } = item
        if (itemId) {
          return { ...itemData, _id: itemId }
        }
        return itemData
      })
    }

    try {
      const response = await api.put(`/events/${eventId}/tiles/${tileId}`, tileData)
      if (response.success) {
        // 只有當明確要求時才重新載入，避免不必要的頁面刷新
        if (reload) {
          await loadTiles()
        } else {
          // 即使不重新載入，也要更新本地狀態中的 _id（如果後端返回了新的 _id）
          if (response.data?.tile) {
            setTiles((prev) => {
              const updated = [...prev]
              const tileIndex = updated.findIndex((t) => (t._id || t.id) === tileId)
              if (tileIndex !== -1 && response.data.tile.scheduleItems) {
                // 更新 scheduleItems 的 _id
                updated[tileIndex] = {
                  ...updated[tileIndex],
                  scheduleItems: response.data.tile.scheduleItems.map((savedItem, idx) => {
                    const currentItem = updated[tileIndex].scheduleItems?.[idx]
                    return {
                      ...savedItem,
                      // 保留用戶可能正在編輯的其他字段
                      ...(currentItem && {
                        date: currentItem.date || savedItem.date,
                        timeRange: currentItem.timeRange || savedItem.timeRange,
                        timeLabel: currentItem.timeLabel || savedItem.timeLabel,
                        descriptionZh: currentItem.descriptionZh || savedItem.descriptionZh,
                        descriptionEn: currentItem.descriptionEn || savedItem.descriptionEn,
                      })
                    }
                  })
                }
              }
              return updated
            })
          }
        }
      } else {
        // 保存失敗時不重新載入，保留用戶輸入的內容
        setError('更新格仔失敗')
      }
    } catch (error) {
      // 保存失敗時不重新載入，保留用戶輸入的內容
      setError(error.message || '更新格仔失敗')
    }
  }

  const toggleVisibility = async (tileId) => {
    const tile = tiles.find((t) => (t._id || t.id) === tileId)
    if (!tile) return
    
    // 先更新本地狀態
    updateTile(tileId, 'isVisible', !tile.isVisible)
    // 然後保存到後端
    await saveTile(tileId)
  }

  const addScheduleItem = (tileIndex, date = '') => {
    setTiles((prev) => {
      const updated = [...prev]
      const tile = updated[tileIndex]
      if (!tile.scheduleItems) tile.scheduleItems = []
      tile.scheduleItems.push({
        date: date || '',
        timeRange: { start: '', end: '' },
        timeLabel: '',
        descriptionZh: '',
        descriptionEn: '',
      })
      return updated
    })
  }

  const updateScheduleItem = (tileIndex, itemIndex, field, value) => {
    setTiles((prev) => {
      const updated = [...prev]
      updated[tileIndex].scheduleItems[itemIndex][field] = value
      return updated
    })
  }

  const updateScheduleTimeRange = (tileIndex, itemIndex, key, value) => {
    setTiles((prev) => {
      const updated = [...prev]
      updated[tileIndex].scheduleItems[itemIndex].timeRange[key] = value
      return updated
    })
  }

  const removeScheduleItem = (tileIndex, itemIndex) => {
    setTiles((prev) => {
      const updated = [...prev]
      updated[tileIndex].scheduleItems.splice(itemIndex, 1)
      return updated
    })
  }

  // Information titles and details functions
  const addInformationTitle = (tileIndex, tileId) => {
    if (addingItem === tileId) return
    
    setAddingItem(tileId)
    setTiles((prev) => {
      const updated = [...prev]
      const tile = { ...updated[tileIndex] }
      if (!tile.informationData) {
        tile.informationData = { category: '', backgroundImage: '', titles: [], items: [] }
      }
      tile.informationData = { ...tile.informationData }
      if (!tile.informationData.titles) {
        tile.informationData.titles = []
      }
      tile.informationData.titles = [...tile.informationData.titles]
      // 添加新標題，包含一個空的 detail
      tile.informationData.titles.push({
        id: `title-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        titleZh: '',
        titleEn: '',
        details: [],
      })
      const newUpdated = [...updated]
      newUpdated[tileIndex] = tile
      return newUpdated
    })
    setTimeout(() => setAddingItem(null), 500)
  }

  const updateInformationTitle = (tileIndex, titleIndex, field, value) => {
    setTiles((prev) => {
      const updated = [...prev]
      const tile = { ...updated[tileIndex] }
      tile.informationData = { ...tile.informationData }
      if (!tile.informationData.titles) {
        tile.informationData.titles = []
      }
      tile.informationData.titles = [...tile.informationData.titles]
      tile.informationData.titles[titleIndex] = {
        ...tile.informationData.titles[titleIndex],
        [field]: value,
      }
      updated[tileIndex] = tile
      return updated
    })
  }

  const removeInformationTitle = (tileIndex, titleIndex) => {
    setTiles((prev) => {
      const updated = [...prev]
      const tile = { ...updated[tileIndex] }
      tile.informationData = { ...tile.informationData }
      if (!tile.informationData.titles) {
        tile.informationData.titles = []
      }
      tile.informationData.titles = tile.informationData.titles.filter((_, i) => i !== titleIndex)
      updated[tileIndex] = tile
      return updated
    })
  }

  const addInformationDetail = (tileIndex, titleIndex) => {
    setTiles((prev) => {
      const updated = [...prev]
      const tile = { ...updated[tileIndex] }
      tile.informationData = { ...tile.informationData }
      if (!tile.informationData.titles) {
        tile.informationData.titles = []
      }
      tile.informationData.titles = [...tile.informationData.titles]
      if (!tile.informationData.titles[titleIndex].details) {
        tile.informationData.titles[titleIndex].details = []
      }
      tile.informationData.titles[titleIndex].details = [
        ...tile.informationData.titles[titleIndex].details,
        {
          subtitleZh: '',
          subtitleEn: '',
          contentZh: '',
          contentEn: '',
        },
      ]
      updated[tileIndex] = tile
      return updated
    })
  }

  const updateInformationDetail = (tileIndex, titleIndex, detailIndex, field, value) => {
    setTiles((prev) => {
      const updated = [...prev]
      const tile = { ...updated[tileIndex] }
      tile.informationData = { ...tile.informationData }
      if (!tile.informationData.titles) {
        tile.informationData.titles = []
      }
      tile.informationData.titles = [...tile.informationData.titles]
      if (!tile.informationData.titles[titleIndex].details) {
        tile.informationData.titles[titleIndex].details = []
      }
      tile.informationData.titles[titleIndex].details = [
        ...tile.informationData.titles[titleIndex].details,
      ]
      tile.informationData.titles[titleIndex].details[detailIndex] = {
        ...tile.informationData.titles[titleIndex].details[detailIndex],
        [field]: value,
      }
      updated[tileIndex] = tile
      return updated
    })
  }

  const removeInformationDetail = (tileIndex, titleIndex, detailIndex) => {
    setTiles((prev) => {
      const updated = [...prev]
      const tile = { ...updated[tileIndex] }
      tile.informationData = { ...tile.informationData }
      if (!tile.informationData.titles) {
        tile.informationData.titles = []
      }
      tile.informationData.titles = [...tile.informationData.titles]
      if (!tile.informationData.titles[titleIndex].details) {
        tile.informationData.titles[titleIndex].details = []
      }
      tile.informationData.titles[titleIndex].details = tile.informationData.titles[
        titleIndex
      ].details.filter((_, i) => i !== detailIndex)
      updated[tileIndex] = tile
      return updated
    })
  }

  // 向後兼容：保留舊的 items 函數（用於遷移）
  const addInformationItem = (tileIndex, tileId) => {
    if (addingItem === tileId) return
    setAddingItem(tileId)
    setTiles((prev) => {
      const updated = [...prev]
      const tile = { ...updated[tileIndex] }
      if (!tile.informationData) {
        tile.informationData = { category: '', backgroundImage: '', titles: [], items: [] }
      }
      tile.informationData = { ...tile.informationData }
      if (!tile.informationData.items) {
        tile.informationData.items = []
      }
      tile.informationData.items = [...tile.informationData.items]
      tile.informationData.items.push({
        subtitleZh: '',
        subtitleEn: '',
        contentZh: '',
        contentEn: '',
      })
      const newUpdated = [...updated]
      newUpdated[tileIndex] = tile
      return newUpdated
    })
    setTimeout(() => setAddingItem(null), 500)
  }

  const updateInformationItem = (tileIndex, itemIndex, field, value) => {
    setTiles((prev) => {
      const updated = [...prev]
      const tile = { ...updated[tileIndex] }
      tile.informationData = { ...tile.informationData }
      if (!tile.informationData.items) {
        tile.informationData.items = []
      }
      tile.informationData.items = [...tile.informationData.items]
      tile.informationData.items[itemIndex] = {
        ...tile.informationData.items[itemIndex],
        [field]: value,
      }
      updated[tileIndex] = tile
      return updated
    })
  }

  const removeInformationItem = (tileIndex, itemIndex) => {
    setTiles((prev) => {
      const updated = [...prev]
      const tile = { ...updated[tileIndex] }
      tile.informationData = { ...tile.informationData }
      if (!tile.informationData.items) {
        tile.informationData.items = []
      }
      tile.informationData.items = tile.informationData.items.filter((_, i) => i !== itemIndex)
      updated[tileIndex] = tile
      return updated
    })
  }

  // 處理資訊類別背景圖片上傳
  const handleInformationImageUpload = async (tileId, file) => {
    if (!file) return

    // 檢查檔案大小（最大 2MB）
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      setError('圖片大小不能超過 2MB')
      return
    }

    // 檢查檔案類型
    if (!file.type.startsWith('image/')) {
      setError('請上傳圖片檔案')
      return
    }

    try {
      // 讀取圖片並轉換為 base64
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target.result
        updateInformationData(tileId, 'backgroundImage', base64)
        setError('')
        setMessage('圖片上傳成功')
        setTimeout(() => setMessage(''), 3000)
        setTimeout(() => saveTile(tileId, false), 100)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setError('圖片處理失敗：' + error.message)
    }
  }

  const handleInformationFileInputChange = (tileId, event) => {
    const file = event.target.files?.[0]
    if (file) {
      handleInformationImageUpload(tileId, file)
    }
    // 重置 input，允許重新選擇同一檔案
    event.target.value = ''
  }


  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setMessage('')
      
      // 前端驗證：檢查所有格仔是否都有完整的標題
      const incompleteTiles = tiles.filter((tile) => !tile.titleZh || !tile.titleEn)
      if (incompleteTiles.length > 0) {
        setError('請填寫所有格仔的中文與英文標題')
        setSaving(false)
        return
      }
      
      // 保存所有 tiles（使用嚴格驗證）
      for (const tile of tiles) {
        const { _id, __v, ...tileData } = tile
        const tileId = tile._id || tile.id
        if (tileId) {
          await api.put(`/events/${eventId}/tiles/${tileId}`, tileData)
        }
      }
      setMessage('已儲存九宮格設定')
      await loadTiles()
    } catch (error) {
      setError(error.message || '儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  const orderedTiles = useMemo(() => [...tiles].sort((a, b) => (a.order || 0) - (b.order || 0)), [tiles])

  if (loading) {
    return (
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>
          九宮格設定
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
        九宮格設定
      </Typography>
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <Paper elevation={0} className="rounded-lg p-6">
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={3} alignItems={{ md: 'center' }}>
          <Typography variant="subtitle1" fontWeight={600}>
            功能入口清單（依照排序顯示）
          </Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="新增格仔">
              <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={addTile} sx={{ borderRadius: 1 }}>
                新增格仔
              </Button>
            </Tooltip>
          </Stack>
        </Stack>
        <Divider sx={{ my: 3 }} />
        <Stack spacing={3}>
          {orderedTiles.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body1" color="text.secondary">
                尚無格仔，請點擊「新增格仔」來建立第一個功能入口
              </Typography>
            </Box>
          ) : (
            orderedTiles.map((tile, index) => {
            const tileId = tile._id || tile.id
            return (
              <Paper key={tileId || index} elevation={1} className="rounded-lg border border-[#ececec] p-5">
                <Stack spacing={3}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <DragIndicatorIcon sx={{ color: '#bbb' }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        #{index + 1} {tile.titleZh || '未命名'}
                      </Typography>
                      <Chip
                        label={tile.isVisible ? '顯示中' : '已隱藏'}
                        color={tile.isVisible ? 'success' : 'default'}
                        onClick={() => toggleVisibility(tileId)}
                        size="small"
                        variant={tile.isVisible ? 'filled' : 'outlined'}
                      />
                    </Stack>
                    <IconButton color="error" onClick={() => removeTile(tileId)}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      label="中文標題"
                      value={tile.titleZh || ''}
                      onChange={(event) => updateTile(tileId, 'titleZh', event.target.value)}
                      onBlur={() => saveTile(tileId)}
                      fullWidth
                    />
                    <TextField
                      label="英文標題"
                      value={tile.titleEn || ''}
                      onChange={(event) => updateTile(tileId, 'titleEn', event.target.value)}
                      onBlur={() => saveTile(tileId)}
                      fullWidth
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      label="Icon Key"
                      select
                      value={tile.iconKey || 'event'}
                      onChange={(event) => {
                        updateTile(tileId, 'iconKey', event.target.value)
                        saveTile(tileId)
                      }}
                      fullWidth
                    >
                      {ICON_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {option.icon}
                            <span>{option.label}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="類別"
                      select
                      value={tile.type || 'schedule'}
                      onChange={(event) => {
                        const newType = event.target.value
                        updateTile(tileId, 'type', newType)
                        // 初始化新類型所需的資料結構
                        if (newType === 'information' && !tile.informationData) {
                          updateTile(tileId, 'informationData', {
                            category: '',
                            backgroundImage: '',
                            items: [],
                          })
                        }
                        saveTile(tileId)
                      }}
                      fullWidth
                    >
                      <MenuItem value="schedule">Schedule（活動時間表）</MenuItem>
                      <MenuItem value="information">Information（資訊類別）</MenuItem>
                      <MenuItem value="external">External URL（外部連結）</MenuItem>
                      <MenuItem value="registration">Registration（登記）</MenuItem>
                    </TextField>
                    <TextField
                      label="顯示排序"
                      type="number"
                      value={tile.order || 0}
                      onChange={(event) => updateTile(tileId, 'order', Number(event.target.value))}
                      onBlur={() => saveTile(tileId)}
                      fullWidth
                    />
                  </Stack>

                  {tile.type === 'external' && (
                    <TextField
                      label="外部連結 URL"
                      value={tile.externalUrl || ''}
                      onChange={(event) => updateTile(tileId, 'externalUrl', event.target.value)}
                      onBlur={() => saveTile(tileId)}
                      fullWidth
                    />
                  )}

                  {tile.type === 'registration' && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      此類型會導航到登記頁面，點擊後用戶將進入多步驟登記流程。
                    </Alert>
                  )}

                  {tile.type === 'schedule' && (
                    <Stack spacing={3}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" fontWeight={600}>
                          行程內容（按日期組織）
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AddCircleOutlineIcon />}
                          onClick={() => {
                            addScheduleItem(index)
                            setTimeout(() => saveTile(tileId), 100)
                          }}
                        >
                          新增日期組
                        </Button>
                      </Stack>
                      <Stack spacing={3}>
                        {(() => {
                          // 按日期分組
                          const groupedByDate = (tile.scheduleItems || []).reduce((acc, item, itemIndex) => {
                            const dateKey = (() => {
                              if (!item.date) return '未指定日期'
                              try {
                                if (typeof item.date === 'string') {
                                  if (item.date.includes('T')) {
                                    return new Date(item.date).toISOString().split('T')[0]
                                  }
                                  if (item.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                    return item.date
                                  }
                                }
                                if (item.date instanceof Date) {
                                  return item.date.toISOString().split('T')[0]
                                }
                                const date = new Date(item.date)
                                if (!isNaN(date.getTime())) {
                                  return date.toISOString().split('T')[0]
                                }
                              } catch {}
                              return '未指定日期'
                            })()
                            
                            if (!acc[dateKey]) {
                              acc[dateKey] = []
                            }
                            acc[dateKey].push({ ...item, originalIndex: itemIndex })
                            return acc
                          }, {})

                          const dateGroups = Object.entries(groupedByDate).sort(([dateA], [dateB]) => {
                            if (dateA === '未指定日期') return 1
                            if (dateB === '未指定日期') return -1
                            return dateA.localeCompare(dateB)
                          })

                          return dateGroups.map(([dateKey, items]) => {
                            const dateGroupKey = `${tileId}-${dateKey}`
                            const isExpanded = expandedDates[dateGroupKey] !== false // 默認展開
                            
                            return (
                              <Paper key={dateKey} elevation={0} className="rounded-lg border border-[#ececec] p-4">
                                <Stack spacing={2}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" alignItems="center" spacing={1} flex={1}>
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          setExpandedDates(prev => ({
                                            ...prev,
                                            [dateGroupKey]: !isExpanded
                                          }))
                                        }}
                                        sx={{ color: '#c9503d' }}
                                      >
                                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                      </IconButton>
                                      <Stack direction="row" alignItems="center" spacing={2} flex={1}>
                                        <TextField
                                          label="日期"
                                          type="date"
                                          value={dateKey === '未指定日期' ? '' : dateKey}
                                          onChange={(event) => {
                                            const newDate = event.target.value
                                            // 更新該日期組下所有項目的日期
                                            items.forEach((item) => {
                                              const originalIndex = tile.scheduleItems.findIndex((si, idx) => {
                                                // 通過比較來找到原始項目
                                                return idx === item.originalIndex
                                              })
                                              if (originalIndex !== -1) {
                                                updateScheduleItem(index, originalIndex, 'date', newDate)
                                              }
                                            })
                                            setTimeout(() => saveTile(tileId), 100)
                                          }}
                                          onBlur={() => saveTile(tileId)}
                                          InputLabelProps={{ shrink: true }}
                                          sx={{ minWidth: 200 }}
                                        />
                                        <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#c9503d' }}>
                                          {dateKey === '未指定日期' ? dateKey : new Date(dateKey + 'T00:00:00').toLocaleDateString('zh-TW', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric',
                                            weekday: 'long'
                                          })}
                                        </Typography>
                                        <Chip 
                                          label={`${items.length} 個活動`} 
                                          size="small" 
                                          sx={{ bgcolor: '#f5f5f5' }}
                                        />
                                      </Stack>
                                    </Stack>
                                    <Stack direction="row" spacing={1}>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<AddCircleOutlineIcon />}
                                        onClick={() => {
                                          addScheduleItem(index, dateKey === '未指定日期' ? '' : dateKey)
                                          setTimeout(() => saveTile(tileId), 100)
                                        }}
                                      >
                                        新增活動
                                      </Button>
                                      <Button
                                        color="error"
                                        size="small"
                                        onClick={() => {
                                          // 移除該日期組下的所有項目
                                          const indicesToRemove = items.map(item => item.originalIndex).sort((a, b) => b - a)
                                          indicesToRemove.forEach(idx => {
                                            removeScheduleItem(index, idx)
                                          })
                                          setTimeout(() => saveTile(tileId), 100)
                                        }}
                                      >
                                        移除日期組
                                      </Button>
                                    </Stack>
                                  </Stack>
                                  <Collapse in={isExpanded}>
                                    <Divider sx={{ my: 1 }} />
                                    <Stack spacing={2}>
                                      {items.map((item, itemIndexInGroup) => {
                                        // 找到原始索引
                                        const originalIndex = tile.scheduleItems.findIndex((si, idx) => {
                                          // 通過比較日期、時間等來找到對應的項目
                                          if (idx === item.originalIndex) return true
                                          return false
                                        })
                                        if (originalIndex === -1) return null
                                        
                                        return (
                                          <Paper key={`${dateKey}-${itemIndexInGroup}`} elevation={0} sx={{ bgcolor: '#f9f9f9', p: 1.5, borderRadius: 2 }}>
                                            <Stack spacing={1.5}>
                                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                                  活動 {itemIndexInGroup + 1}
                                                </Typography>
                                                <Button
                                                  color="error"
                                                  size="small"
                                                  onClick={() => {
                                                    removeScheduleItem(index, originalIndex)
                                                    setTimeout(() => saveTile(tileId), 100)
                                                  }}
                                                >
                                                  移除
                                                </Button>
                                              </Stack>
                                              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                                                <TextField
                                                  label="開始時間"
                                                  type="time"
                                                  value={item.timeRange?.start || ''}
                                                  onChange={(event) => updateScheduleTimeRange(index, originalIndex, 'start', event.target.value)}
                                                  onBlur={() => saveTile(tileId)}
                                                  InputLabelProps={{ shrink: true }}
                                                  fullWidth
                                                  size="small"
                                                  inputProps={{ step: 300 }}
                                                />
                                                <TextField
                                                  label="結束時間"
                                                  type="time"
                                                  value={item.timeRange?.end || ''}
                                                  onChange={(event) => updateScheduleTimeRange(index, originalIndex, 'end', event.target.value)}
                                                  onBlur={() => saveTile(tileId)}
                                                  InputLabelProps={{ shrink: true }}
                                                  fullWidth
                                                  size="small"
                                                  inputProps={{ step: 300 }}
                                                />
                                                <TextField
                                                  label="標題"
                                                  value={item.timeLabel || ''}
                                                  onChange={(event) => updateScheduleItem(index, originalIndex, 'timeLabel', event.target.value)}
                                                  onBlur={() => saveTile(tileId)}
                                                  helperText="例如：早上、下午、晚上"
                                                  fullWidth
                                                  size="small"
                                                  InputLabelProps={{ shrink: true }}
                                                />
                                              </Stack>
                                              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                                                <TextField
                                                  label="內容（中文）"
                                                  value={item.descriptionZh || ''}
                                                  onChange={(event) => updateScheduleItem(index, originalIndex, 'descriptionZh', event.target.value)}
                                                  onBlur={() => saveTile(tileId)}
                                                  fullWidth
                                                  multiline
                                                  minRows={1}
                                                  size="small"
                                                  InputLabelProps={{ shrink: true }}
                                                />
                                                <TextField
                                                  label="內容（英文）"
                                                  value={item.descriptionEn || ''}
                                                  onChange={(event) => updateScheduleItem(index, originalIndex, 'descriptionEn', event.target.value)}
                                                  onBlur={() => saveTile(tileId)}
                                                  fullWidth
                                                  multiline
                                                  minRows={1}
                                                  size="small"
                                                  InputLabelProps={{ shrink: true }}
                                                />
                                              </Stack>
                                            </Stack>
                                          </Paper>
                                        )
                                      })}
                                    </Stack>
                                  </Collapse>
                                </Stack>
                              </Paper>
                            )
                          })
                        })()}
                      </Stack>
                    </Stack>
                  )}

                  {tile.type === 'information' && (
                    <Stack spacing={3}>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <TextField
                          label="資訊類別"
                          select
                          value={tile.informationData?.category || ''}
                          onChange={(event) => {
                            updateInformationData(tileId, 'category', event.target.value)
                            setTimeout(() => saveTile(tileId, false), 300)
                          }}
                          fullWidth
                        >
                          {INFORMATION_CATEGORIES.map((cat) => (
                            <MenuItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Stack>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          背景圖片上傳
                        </Typography>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          最大檔案大小：2MB
                        </Alert>
                        <Box
                          sx={{
                            border: '2px dashed #ccc',
                            borderRadius: 2,
                            p: 3,
                            textAlign: 'center',
                            cursor: 'pointer',
                            bgcolor: tile.informationData?.backgroundImage ? 'transparent' : '#f5f5f5',
                            transition: 'all 0.3s',
                            '&:hover': {
                              borderColor: '#c9503d',
                              bgcolor: '#fff5f5',
                            },
                          }}
                          onClick={() => {
                            if (!fileInputRefs.current[tileId]) {
                              fileInputRefs.current[tileId] = document.createElement('input')
                              fileInputRefs.current[tileId].type = 'file'
                              fileInputRefs.current[tileId].accept = 'image/*'
                              fileInputRefs.current[tileId].onchange = (e) => handleInformationFileInputChange(tileId, e)
                            }
                            fileInputRefs.current[tileId].click()
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
                            e.currentTarget.style.bgcolor = tile.informationData?.backgroundImage ? 'transparent' : '#f5f5f5'
                          }}
                          onDrop={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            e.currentTarget.style.borderColor = '#ccc'
                            e.currentTarget.style.bgcolor = tile.informationData?.backgroundImage ? 'transparent' : '#f5f5f5'
                            const file = e.dataTransfer.files?.[0]
                            if (file) {
                              handleInformationImageUpload(tileId, file)
                            }
                          }}
                        >
                          {tile.informationData?.backgroundImage ? (
                            <Box>
                              <img
                                src={tile.informationData.backgroundImage}
                                alt="Background preview"
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
                                    if (!fileInputRefs.current[tileId]) {
                                      fileInputRefs.current[tileId] = document.createElement('input')
                                      fileInputRefs.current[tileId].type = 'file'
                                      fileInputRefs.current[tileId].accept = 'image/*'
                                      fileInputRefs.current[tileId].onchange = (e) => handleInformationFileInputChange(tileId, e)
                                    }
                                    fileInputRefs.current[tileId].click()
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
                                    updateInformationData(tileId, 'backgroundImage', '')
                                    setTimeout(() => saveTile(tileId, false), 100)
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
                                點擊或拖放圖片到此處上傳
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                或輸入圖片 URL
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        <TextField
                          label="或輸入圖片 URL"
                          value={tile.informationData?.backgroundImage && !tile.informationData.backgroundImage.startsWith('data:') ? tile.informationData.backgroundImage : ''}
                          onChange={(event) => {
                            updateInformationData(tileId, 'backgroundImage', event.target.value)
                          }}
                          onBlur={() => saveTile(tileId, false)}
                          fullWidth
                          sx={{ mt: 2 }}
                          helperText="如果已上傳圖片（base64），此欄位將被忽略"
                        />
                      </Box>
                      <Divider />
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" fontWeight={600}>
                          標題列表（點擊標題可管理該標題下的詳細資料）
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AddCircleOutlineIcon />}
                          disabled={addingItem === tileId}
                          onClick={() => {
                            addInformationTitle(index, tileId)
                            setTimeout(() => saveTile(tileId, false), 100)
                          }}
                        >
                          新增標題
                        </Button>
                      </Stack>
                      <Stack spacing={2}>
                        {(tile.informationData?.titles || []).map((title, titleIndex) => {
                          const titleKey = `title-${tileId}-${titleIndex}`
                          const isExpanded = expandedTitles[titleKey] !== undefined 
                            ? expandedTitles[titleKey] 
                            : titleIndex === 0 // 默認展開第一個
                          
                          return (
                            <Paper key={title.id || titleIndex} elevation={0} className="rounded-lg border border-[#ececec]">
                              <Box
                                sx={{
                                  p: 2,
                                  cursor: 'pointer',
                                  '&:hover': { bgcolor: '#f5f5f5' },
                                }}
                                onClick={() => {
                                  setExpandedTitles(prev => ({
                                    ...prev,
                                    [titleKey]: !isExpanded,
                                  }))
                                }}
                              >
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Stack direction="row" spacing={1} alignItems="center" flex={1}>
                                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    <Typography variant="subtitle1" fontWeight={600}>
                                      標題 #{titleIndex + 1}: {title.titleZh || title.titleEn || '未命名標題'}
                                    </Typography>
                                  </Stack>
                                  <Button
                                    color="error"
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeInformationTitle(index, titleIndex)
                                      setTimeout(() => saveTile(tileId, false), 100)
                                    }}
                                  >
                                    移除標題
                                  </Button>
                                </Stack>
                              </Box>
                              <Collapse in={isExpanded}>
                                <Box sx={{ p: 3, pt: 0 }}>
                                  <Stack spacing={3}>
                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                      <TextField
                                        label="標題（中文）"
                                        value={title.titleZh || ''}
                                        onChange={(event) => {
                                          updateInformationTitle(index, titleIndex, 'titleZh', event.target.value)
                                        }}
                                        onBlur={() => saveTile(tileId, false)}
                                        fullWidth
                                      />
                                      <TextField
                                        label="標題（英文）"
                                        value={title.titleEn || ''}
                                        onChange={(event) => {
                                          updateInformationTitle(index, titleIndex, 'titleEn', event.target.value)
                                        }}
                                        onBlur={() => saveTile(tileId, false)}
                                        fullWidth
                                      />
                                    </Stack>
                                    <Divider />
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                      <Typography variant="body2" fontWeight={600}>
                                        詳細資料
                                      </Typography>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<AddCircleOutlineIcon />}
                                        onClick={() => {
                                          addInformationDetail(index, titleIndex)
                                          setTimeout(() => saveTile(tileId, false), 100)
                                        }}
                                      >
                                        新增詳細資料
                                      </Button>
                                    </Stack>
                                    <Stack spacing={2}>
                                      {(title.details || []).map((detail, detailIndex) => (
                                        <Paper key={detailIndex} elevation={0} sx={{ p: 2, bgcolor: '#fafafa', borderRadius: 1 }}>
                                          <Stack spacing={2}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                              <Typography variant="body2" fontWeight={600} color="text.secondary">
                                                詳細資料 #{detailIndex + 1}
                                              </Typography>
                                              <Button
                                                color="error"
                                                size="small"
                                                onClick={() => {
                                                  removeInformationDetail(index, titleIndex, detailIndex)
                                                  setTimeout(() => saveTile(tileId, false), 100)
                                                }}
                                              >
                                                移除
                                              </Button>
                                            </Stack>
                                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                              <TextField
                                                label="副標題（中文）"
                                                value={detail.subtitleZh || ''}
                                                onChange={(event) => {
                                                  updateInformationDetail(index, titleIndex, detailIndex, 'subtitleZh', event.target.value)
                                                }}
                                                onBlur={() => saveTile(tileId, false)}
                                                fullWidth
                                                size="small"
                                              />
                                              <TextField
                                                label="副標題（英文）"
                                                value={detail.subtitleEn || ''}
                                                onChange={(event) => {
                                                  updateInformationDetail(index, titleIndex, detailIndex, 'subtitleEn', event.target.value)
                                                }}
                                                onBlur={() => saveTile(tileId, false)}
                                                fullWidth
                                                size="small"
                                              />
                                            </Stack>
                                            <Box>
                                              <Typography variant="body2" fontWeight={600} gutterBottom>
                                                內容（中文）
                                              </Typography>
                                              <TiptapEditor
                                                value={detail.contentZh || ''}
                                                onChange={(value) => {
                                                  updateInformationDetail(index, titleIndex, detailIndex, 'contentZh', value)
                                                }}
                                                onBlur={() => saveTile(tileId, false)}
                                                placeholder="請輸入內容..."
                                              />
                                            </Box>
                                            <Box>
                                              <Typography variant="body2" fontWeight={600} gutterBottom>
                                                內容（英文）
                                              </Typography>
                                              <TiptapEditor
                                                value={detail.contentEn || ''}
                                                onChange={(value) => {
                                                  updateInformationDetail(index, titleIndex, detailIndex, 'contentEn', value)
                                                }}
                                                onBlur={() => saveTile(tileId, false)}
                                                placeholder="Please enter content..."
                                              />
                                            </Box>
                                          </Stack>
                                        </Paper>
                                      ))}
                                      {(!title.details || title.details.length === 0) && (
                                        <Alert severity="info">
                                          此標題下暫無詳細資料，請點擊「新增詳細資料」按鈕添加
                                        </Alert>
                                      )}
                                    </Stack>
                                  </Stack>
                                </Box>
                              </Collapse>
                            </Paper>
                          )
                        })}
                        {(!tile.informationData?.titles || tile.informationData.titles.length === 0) && (
                          <Alert severity="info">
                            暫無標題，請點擊「新增標題」按鈕添加標題
                          </Alert>
                        )}
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              </Paper>
            )
          })
          )}
        </Stack>
        <Divider sx={{ my: 3 }} />
        <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ borderRadius: 1 }}>
          {saving ? '儲存中...' : '儲存九宮格設定'}
        </Button>
      </Paper>
    </Stack>
  )
}

export default TileSettingsPage
