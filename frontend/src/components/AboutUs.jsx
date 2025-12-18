import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'

const AboutUs = () => {
  return (
    <Box sx={{ py: 6, bgcolor: '#f7f7f7' }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom align="center" sx={{ color: '#c9503d', mb: 3 }}>
            關於我們
            <Typography component="span" variant="h4" fontWeight={400} sx={{ color: '#666', ml: 1 }}>
              About Us
            </Typography>
          </Typography>
          <Divider sx={{ mb: 4 }} />
          
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#c9503d' }}>
                我們的使命 Our Mission
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                我們致力於為客戶提供最優質的旅遊體驗，透過精心策劃的行程和專業的服務，讓每一次旅程都成為難忘的回憶。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                We are committed to providing our clients with the highest quality travel experiences. Through carefully planned itineraries and professional service, we make every journey an unforgettable memory.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#c9503d' }}>
                我們的價值 Our Values
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                誠信、專業、創新是我們的核心價值。我們相信，只有以客戶為中心，持續改進服務品質，才能贏得客戶的信任與支持。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Integrity, professionalism, and innovation are our core values. We believe that only by putting customers first and continuously improving service quality can we win the trust and support of our clients.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#c9503d' }}>
                我們的團隊 Our Team
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                我們擁有一支經驗豐富、充滿熱忱的專業團隊，每一位成員都致力於為客戶提供最貼心的服務。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                We have an experienced and passionate professional team. Every member is committed to providing the most attentive service to our clients.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}

export default AboutUs

