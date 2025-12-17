import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const Banner = ({
  title = 'Travel Agency',
  subtitle = 'Hong Kong 2025',
  description = 'Explore the beauty of Hong Kong.',
  backgroundGradient = 'linear-gradient(135deg, #ffddb2 0%, #f8a1b5 35%, #8ad0f0 100%)',
  imageUrl,
  textColor = '#3a2c50',
}) => {
  return (
    <Paper
      elevation={0}
      className="relative overflow-hidden rounded-[32px]"
      sx={{
        background: imageUrl
          ? `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${imageUrl})`
          : backgroundGradient,
        backgroundSize: imageUrl ? 'cover' : 'auto',
        backgroundPosition: imageUrl ? 'center' : 'auto',
        color: textColor,
      }}
    >
      <Box className="p-6 md:p-8">
        <Typography variant="subtitle1" className="uppercase tracking-[0.2em]" fontWeight={600}>
          {subtitle}
        </Typography>
        <Typography variant="h4" component="h1" fontWeight={800} className="mt-2">
          {title}
        </Typography>
        <Typography variant="body1" className="mt-4 max-w-[280px] opacity-80">
          {description}
        </Typography>
      </Box>
      <Box
        className="absolute bottom-0 right-0 translate-x-8 translate-y-8 h-40 w-40 rounded-full opacity-20 blur-3xl"
        sx={{ backgroundColor: '#ffffff' }}
      />
    </Paper>
  )
}

export default Banner


