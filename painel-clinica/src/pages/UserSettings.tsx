import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UserSettings = () => {
  const { user } = useAuth();
  const { currentBranch } = useBranch();
  const [activeTab, setActiveTab] = useState(0);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Estados do perfil
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    position: '',
    department: '',
    avatar: ''
  });

  // Estados de segurança
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estados de notificações
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    appointmentReminders: true,
    financialAlerts: true,
    systemUpdates: false
  });

  // Estados de preferências
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    currency: 'BRL'
  });

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleProfileEdit = () => {
    setEditingProfile(true);
  };

  const handleProfileSave = () => {
    // Aqui você implementaria a lógica para salvar o perfil
    setEditingProfile(false);
    setSnackbarMessage('Perfil atualizado com sucesso!');
    setSnackbarOpen(true);
  };

  const handleProfileCancel = () => {
    setEditingProfile(false);
    // Resetar dados
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      position: '',
      department: '',
      avatar: ''
    });
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbarMessage('As senhas não coincidem!');
      setSnackbarOpen(true);
      return;
    }
    
    // Aqui você implementaria a lógica para alterar a senha
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setSnackbarMessage('Senha alterada com sucesso!');
    setSnackbarOpen(true);
  };

  const handleNotificationChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  const handlePreferenceChange = (setting: string) => (event: any) => {
    setPreferences(prev => ({
      ...prev,
      [setting]: event.target.value
    }));
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        {/* Cabeçalho */}
        <Box mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary.main" gutterBottom>
            ⚙️ Configurações do Usuário
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie suas informações pessoais, segurança e preferências
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Sidebar com Tabs */}
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ borderRadius: 2 }}>
              <Tabs
                orientation="vertical"
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  '& .MuiTab-root': {
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    minHeight: 60,
                    px: 2,
                    py: 1.5
                  }
                }}
              >
                <Tab
                  icon={<PersonIcon />}
                  iconPosition="start"
                  label="Perfil"
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Tab
                  icon={<SecurityIcon />}
                  iconPosition="start"
                  label="Segurança"
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Tab
                  icon={<NotificationsIcon />}
                  iconPosition="start"
                  label="Notificações"
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Tab
                  icon={<PaletteIcon />}
                  iconPosition="start"
                  label="Preferências"
                  sx={{ justifyContent: 'flex-start' }}
                />
              </Tabs>
            </Paper>
          </Grid>

          {/* Conteúdo Principal */}
          <Grid item xs={12} md={9}>
            <Paper elevation={2} sx={{ borderRadius: 2, minHeight: 600 }}>
              
              {/* Tab 1: Perfil */}
              <TabPanel value={activeTab} index={0}>
                <Box px={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" fontWeight="bold">
                      👤 Informações do Perfil
                    </Typography>
                    {!editingProfile && (
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={handleProfileEdit}
                      >
                        Editar
                      </Button>
                    )}
                  </Box>

                  <Grid container spacing={3}>
                    {/* Avatar e informações básicas */}
                    <Grid item xs={12} md={4}>
                      <Card elevation={1}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Avatar
                            sx={{
                              width: 120,
                              height: 120,
                              mx: 'auto',
                              mb: 2,
                              bgcolor: 'primary.main',
                              fontSize: '3rem'
                            }}
                          >
                            {user?.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="h6" gutterBottom>
                            {user?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {user?.role}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {currentBranch?.name || 'Sem filial'}
                          </Typography>
                          {editingProfile && (
                            <Button size="small" sx={{ mt: 2 }}>
                              Alterar Foto
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Formulário de dados */}
                    <Grid item xs={12} md={8}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Nome Completo"
                            value={profileData.name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                            disabled={!editingProfile}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="E-mail"
                            value={profileData.email}
                            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                            disabled={!editingProfile}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Telefone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                            disabled={!editingProfile}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Cargo"
                            value={profileData.position}
                            onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                            disabled={!editingProfile}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Departamento"
                            value={profileData.department}
                            onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                            disabled={!editingProfile}
                            size="small"
                          />
                        </Grid>
                      </Grid>

                      {editingProfile && (
                        <Box display="flex" gap={2} mt={3}>
                          <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleProfileSave}
                          >
                            Salvar
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={handleProfileCancel}
                          >
                            Cancelar
                          </Button>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Tab 2: Segurança */}
              <TabPanel value={activeTab} index={1}>
                <Box px={3}>
                  <Typography variant="h5" fontWeight="bold" mb={3}>
                    🔒 Segurança da Conta
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card elevation={1}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Alterar Senha
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                label="Senha Atual"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData(prev => ({ 
                                  ...prev, 
                                  currentPassword: e.target.value 
                                }))}
                                size="small"
                                InputProps={{
                                  endAdornment: (
                                    <IconButton
                                      onClick={() => setShowPassword(!showPassword)}
                                      edge="end"
                                      size="small"
                                    >
                                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                  )
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                type="password"
                                label="Nova Senha"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({ 
                                  ...prev, 
                                  newPassword: e.target.value 
                                }))}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                type="password"
                                label="Confirmar Nova Senha"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ 
                                  ...prev, 
                                  confirmPassword: e.target.value 
                                }))}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Button
                                variant="contained"
                                fullWidth
                                onClick={handlePasswordChange}
                                disabled={!passwordData.currentPassword || !passwordData.newPassword}
                              >
                                Alterar Senha
                              </Button>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card elevation={1}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Sessões Ativas
                          </Typography>
                          <Typography variant="body2" color="text.secondary" mb={2}>
                            Gerencie suas sessões ativas em diferentes dispositivos
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemIcon>
                                <PersonIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary="Dispositivo Atual"
                                secondary="Chrome - Windows • Agora"
                              />
                              <ListItemSecondaryAction>
                                <Typography variant="caption" color="success.main">
                                  Ativo
                                </Typography>
                              </ListItemSecondaryAction>
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Tab 3: Notificações */}
              <TabPanel value={activeTab} index={2}>
                <Box px={3}>
                  <Typography variant="h5" fontWeight="bold" mb={3}>
                    🔔 Configurações de Notificação
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card elevation={1}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Canais de Notificação
                          </Typography>
                          <List>
                            <ListItem>
                              <ListItemIcon>
                                <EmailIcon />
                              </ListItemIcon>
                              <ListItemText primary="E-mail" />
                              <ListItemSecondaryAction>
                                <Switch
                                  checked={notificationSettings.emailNotifications}
                                  onChange={handleNotificationChange('emailNotifications')}
                                />
                              </ListItemSecondaryAction>
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <SmsIcon />
                              </ListItemIcon>
                              <ListItemText primary="SMS" />
                              <ListItemSecondaryAction>
                                <Switch
                                  checked={notificationSettings.smsNotifications}
                                  onChange={handleNotificationChange('smsNotifications')}
                                />
                              </ListItemSecondaryAction>
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <NotificationsIcon />
                              </ListItemIcon>
                              <ListItemText primary="Push Notifications" />
                              <ListItemSecondaryAction>
                                <Switch
                                  checked={notificationSettings.pushNotifications}
                                  onChange={handleNotificationChange('pushNotifications')}
                                />
                              </ListItemSecondaryAction>
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card elevation={1}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Tipos de Notificação
                          </Typography>
                          <List>
                            <ListItem>
                              <ListItemText primary="Lembretes de Consultas" />
                              <ListItemSecondaryAction>
                                <Switch
                                  checked={notificationSettings.appointmentReminders}
                                  onChange={handleNotificationChange('appointmentReminders')}
                                />
                              </ListItemSecondaryAction>
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Alertas Financeiros" />
                              <ListItemSecondaryAction>
                                <Switch
                                  checked={notificationSettings.financialAlerts}
                                  onChange={handleNotificationChange('financialAlerts')}
                                />
                              </ListItemSecondaryAction>
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Atualizações do Sistema" />
                              <ListItemSecondaryAction>
                                <Switch
                                  checked={notificationSettings.systemUpdates}
                                  onChange={handleNotificationChange('systemUpdates')}
                                />
                              </ListItemSecondaryAction>
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Tab 4: Preferências */}
              <TabPanel value={activeTab} index={3}>
                <Box px={3}>
                  <Typography variant="h5" fontWeight="bold" mb={3}>
                    🎨 Preferências do Sistema
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card elevation={1}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Aparência
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Tema</InputLabel>
                                <Select
                                  value={preferences.theme}
                                  onChange={handlePreferenceChange('theme')}
                                  label="Tema"
                                >
                                  <MenuItem value="light">Claro</MenuItem>
                                  <MenuItem value="dark">Escuro</MenuItem>
                                  <MenuItem value="auto">Automático</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Idioma</InputLabel>
                                <Select
                                  value={preferences.language}
                                  onChange={handlePreferenceChange('language')}
                                  label="Idioma"
                                >
                                  <MenuItem value="pt-BR">Português (Brasil)</MenuItem>
                                  <MenuItem value="en-US">English (US)</MenuItem>
                                  <MenuItem value="es-ES">Español</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card elevation={1}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Formatos e Localização
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Fuso Horário</InputLabel>
                                <Select
                                  value={preferences.timezone}
                                  onChange={handlePreferenceChange('timezone')}
                                  label="Fuso Horário"
                                >
                                  <MenuItem value="America/Sao_Paulo">São Paulo (GMT-3)</MenuItem>
                                  <MenuItem value="America/New_York">New York (GMT-5)</MenuItem>
                                  <MenuItem value="Europe/London">London (GMT+0)</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Formato de Data</InputLabel>
                                <Select
                                  value={preferences.dateFormat}
                                  onChange={handlePreferenceChange('dateFormat')}
                                  label="Formato de Data"
                                >
                                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Moeda</InputLabel>
                                <Select
                                  value={preferences.currency}
                                  onChange={handlePreferenceChange('currency')}
                                  label="Moeda"
                                >
                                  <MenuItem value="BRL">Real (R$)</MenuItem>
                                  <MenuItem value="USD">Dólar ($)</MenuItem>
                                  <MenuItem value="EUR">Euro (€)</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Snackbar para feedbacks */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserSettings;