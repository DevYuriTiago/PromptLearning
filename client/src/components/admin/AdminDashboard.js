import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Book as BookIcon,
} from '@mui/icons-material';
import ContentManager from './ContentManager';
import UserManager from './UserManager';
import AnalyticsDashboard from './AnalyticsDashboard';
import SecuritySettings from './SecuritySettings';
import PDFUploader from './PDFUploader';

// Componentes Admin
import PDFViewer from './PDFViewer';

// Contexto e Hooks
import { useAuth } from '../../hooks/useAuth';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 3, height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

const AdminDashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [value, setValue] = useState(0);
  const [selectedPDF, setSelectedPDF] = useState(null);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handlePDFSelect = (pdf) => {
    setSelectedPDF(pdf);
  };

  const tabStyle = {
    minHeight: 72,
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: theme.palette.text.primary,
    '&.Mui-selected': {
      color: '#00ff00',
    },
  };

  const tabsStyle = {
    borderRight: 1,
    borderColor: 'divider',
    '& .MuiTabs-indicator': {
      backgroundColor: '#00ff00',
      boxShadow: '0 0 10px rgba(0,255,0,0.5)',
    },
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Cabeçalho */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(45deg, rgba(0,255,0,0.1) 0%, rgba(0,255,0,0.05) 100%)',
              border: '1px solid rgba(0,255,0,0.2)',
              boxShadow: '0 0 10px rgba(0,255,0,0.1)',
            }}
          >
            <Typography
              component="h1"
              variant="h4"
              color="primary"
              gutterBottom
              sx={{ textShadow: '0 0 10px rgba(0,255,0,0.3)' }}
            >
              Painel Administrativo
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Bem-vindo, {user?.email}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              height: 'calc(100vh - 200px)', // Ajuste conforme necessário para seu layout
              bgcolor: 'background.paper',
            }}
          >
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={value}
              onChange={handleChange}
              aria-label="Admin dashboard tabs"
              sx={tabsStyle}
            >
              <Tab
                icon={<DashboardIcon />}
                label="Analytics"
                {...a11yProps(0)}
                sx={tabStyle}
              />
              <Tab
                icon={<PeopleIcon />}
                label="Usuários"
                {...a11yProps(1)}
                sx={tabStyle}
              />
              <Tab
                icon={<BookIcon />}
                label="Conteúdo"
                {...a11yProps(2)}
                sx={tabStyle}
              />
              <Tab
                icon={<SecurityIcon />}
                label="Segurança"
                {...a11yProps(3)}
                sx={tabStyle}
              />
            </Tabs>

            <Box sx={{ flexGrow: 1, height: '100%', overflow: 'auto' }}>
              <TabPanel value={value} index={0}>
                <AnalyticsDashboard />
              </TabPanel>
              <TabPanel value={value} index={1}>
                <UserManager />
              </TabPanel>
              <TabPanel value={value} index={2}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <ContentManager onPDFSelect={handlePDFSelect} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <PDFUploader />
                    {selectedPDF && <PDFViewer pdfId={selectedPDF.id} />}
                  </Grid>
                </Grid>
              </TabPanel>
              <TabPanel value={value} index={3}>
                <SecuritySettings />
              </TabPanel>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
