import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ButtonBase from '@mui/material/ButtonBase'

const NavigationCard = ({ card, onClick }) => {
  const IconComponent = card.icon

  const handleClick = () => {
    if (onClick) {
      onClick(card)
    }
  }

  return (
    <ButtonBase onClick={handleClick} className="flex w-full" sx={{ borderRadius: '24px' }}>
      <Paper
        elevation={0}
        className="flex h-full min-h-[148px] w-full flex-col items-center justify-between rounded-[24px] bg-white px-3 py-5 text-center shadow transition hover:-translate-y-1 hover:shadow-lg"
      >
        <Box
          className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
          sx={{
            background: 'linear-gradient(145deg, rgba(233,90,70,0.1), rgba(233,90,70,0.25))',
          }}
        >
          {IconComponent && <IconComponent htmlColor="#c9503d" fontSize="medium" />}
        </Box>
        <Stack spacing={0.5}>
          <Typography variant="body2" fontWeight={700} className="leading-5 text-[#2c2c2c]">
            {card.primary || card.titleZh}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {card.secondary || card.titleEn}
          </Typography>
        </Stack>
      </Paper>
    </ButtonBase>
  )
}

export default NavigationCard


