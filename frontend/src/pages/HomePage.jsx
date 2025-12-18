import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { NavBar, Banner, Footer } from '../components'
import AboutUs from '../components/AboutUs'
import ContactUs from '../components/ContactUs'

const HomePage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url(/bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          zIndex: 0,
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <NavBar />
        
        <Container maxWidth="md" sx={{ py: 4 }}>
          {/* Banner Section */}
          <Box sx={{ mb: 4 }}>
            <Banner
              title="歡迎來到我們的平台"
              subtitle="Welcome to Our Platform"
              description="提供優質服務，創造美好回憶"
              imageUrl="/bg.jpg"
              textColor="#ffffff"
            />
          </Box>

          {/* About Us Section */}
          <AboutUs />

          {/* Contact Us Section */}
          <ContactUs />
        </Container>

        <Footer />
      </Box>
    </Box>
  )
}

export default HomePage
