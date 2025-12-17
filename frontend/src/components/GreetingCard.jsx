import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'

const GreetingCard = ({
  greeting = 'Good Afternoon 午安',
  userName = 'User',
  temperature = '18℃',
  weather = '中雨 Rain',
  backgroundColor = '#e7f0b5',
}) => {
  return (
    <Paper elevation={0} className="rounded-[24px] px-5 py-6" sx={{ backgroundColor }}>
      <Typography variant="h6" fontWeight={700}>
        {greeting}, {userName}
      </Typography>
      <Paper
        elevation={0}
        className="mt-5 flex items-center justify-between rounded-[20px] bg-white px-6 py-4 text-left shadow-lg"
      >
        <Stack direction="column" spacing={1}>
          <Typography variant="body2" fontWeight={600} color="secondary">
            {temperature}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {weather}
          </Typography>
        </Stack>
        <Box
          className="h-10 w-10 rounded-full bg-gradient-to-br from-[#f7a645] to-[#ef5f67] shadow-lg"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <CloudOutlinedIcon htmlColor="#ffffff" />
        </Box>
      </Paper>
    </Paper>
  )
}

export default GreetingCard


