import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

const ItineraryDialog = ({ open, onClose, tabs = [] }) => {
  const [tabIndex, setTabIndex] = useState(0)

  const handleTabChange = (_event, newValue) => {
    setTabIndex(newValue)
  }

  if (!tabs || tabs.length === 0) {
    return null
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ className: 'rounded-[28px]' }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          會議行程 Itinerary
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': { fontWeight: 600, fontSize: '0.75rem' },
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.label} label={tab.label} />
          ))}
        </Tabs>
        <Stack spacing={2} className="pt-4">
          {tabs[tabIndex]?.sections?.map((section, index) => (
            <Paper
              key={section.title || index}
              elevation={0}
              className="rounded-3xl border border-[#f2b9b0] bg-[#fff8f6] px-4 py-3"
            >
              <Stack direction="row" spacing={3} alignItems="flex-start">
                <Typography variant="subtitle2" fontWeight={700} className="min-w-[88px]">
                  {section.title}
                </Typography>
                <Divider orientation="vertical" flexItem className="!border-[#f2d7cf]" />
                <Stack spacing={0.5}>
                  {section.details?.map((line, lineIndex) => (
                    <Typography key={lineIndex} variant="body2">
                      {line}
                    </Typography>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

export default ItineraryDialog


