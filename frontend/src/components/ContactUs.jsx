import { useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    // 這裡可以添加實際的表單提交邏輯
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', phone: '', message: '' })
    }, 3000)
  }

  return (
    <Box sx={{ py: 6, bgcolor: 'white' }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom align="center" sx={{ color: '#c9503d', mb: 3 }}>
            聯絡我們
            <Typography component="span" variant="h4" fontWeight={400} sx={{ color: '#666', ml: 1 }}>
              Contact Us
            </Typography>
          </Typography>
          <Divider sx={{ mb: 4 }} />

          <Stack spacing={4}>
            {/* 聯絡資訊 */}
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#c9503d', mb: 2 }}>
                聯絡資訊 Contact Information
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <EmailIcon sx={{ color: '#c9503d' }} />
                  <Typography variant="body1">
                    Email: <a href="mailto:info@example.com" style={{ color: '#c9503d' }}>info@example.com</a>
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <PhoneIcon sx={{ color: '#c9503d' }} />
                  <Typography variant="body1">
                    Phone: <a href="tel:+85212345678" style={{ color: '#c9503d' }}>+852 1234 5678</a>
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <LocationOnIcon sx={{ color: '#c9503d', mt: 0.5 }} />
                  <Typography variant="body1">
                    Address: 香港中環金融街 88 號<br />
                    <span style={{ color: '#666' }}>88 Finance Street, Central, Hong Kong</span>
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Divider />

            {/* 聯絡表單 */}
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#c9503d', mb: 2 }}>
                發送訊息 Send Us a Message
              </Typography>
              
              {submitted && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  感謝您的訊息！我們會盡快回覆您。Thank you for your message! We will get back to you soon.
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="姓名 Name"
                    value={formData.name}
                    onChange={handleChange('name')}
                    fullWidth
                    required
                  />
                  <TextField
                    label="電子郵件 Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    fullWidth
                    required
                  />
                  <TextField
                    label="電話 Phone"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    fullWidth
                  />
                  <TextField
                    label="訊息 Message"
                    value={formData.message}
                    onChange={handleChange('message')}
                    fullWidth
                    multiline
                    minRows={4}
                    required
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: '#c9503d',
                      '&:hover': { bgcolor: '#a83d2e' },
                      py: 1.5,
                      mt: 2,
                    }}
                  >
                    發送 Send
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}

export default ContactUs

