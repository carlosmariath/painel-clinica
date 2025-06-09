# 🚀 Guia de Implementação Backend - Sistema de Gestão Clínica

## 📋 Visão Geral

Este documento detalha as funcionalidades que precisam ser implementadas no backend para suportar as novas features de configurações de usuário, perfil, segurança, notificações e preferências.

---

## 🗄️ Estrutura do Banco de Dados

### 1. **Tabela: `user_profiles`**
Armazena informações estendidas do perfil do usuário.

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20),
    position VARCHAR(100),
    department VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    date_of_birth DATE,
    address JSONB, -- {street, city, state, postal_code, country}
    social_links JSONB, -- {linkedin, twitter, etc}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### 2. **Tabela: `user_security_settings`**
Configurações de segurança do usuário.

```sql
CREATE TABLE user_security_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(32),
    password_last_changed TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP WITH TIME ZONE,
    allowed_ip_addresses JSONB, -- Array de IPs permitidos
    session_timeout_minutes INTEGER DEFAULT 480, -- 8 horas
    force_password_change BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### 3. **Tabela: `user_sessions`**
Rastreamento de sessões ativas do usuário.

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(500) NOT NULL,
    device_info JSONB, -- {browser, os, device_type, user_agent}
    ip_address INET,
    location JSONB, -- {city, country, lat, lng}
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX idx_user_sessions_user_id (user_id),
    INDEX idx_user_sessions_token (session_token),
    INDEX idx_user_sessions_active (is_active, expires_at)
);
```

### 4. **Tabela: `user_notification_settings`**
Configurações de notificações do usuário.

```sql
CREATE TABLE user_notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Canais de notificação
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    in_app_notifications BOOLEAN DEFAULT TRUE,
    
    -- Tipos de notificação
    appointment_reminders BOOLEAN DEFAULT TRUE,
    appointment_confirmations BOOLEAN DEFAULT TRUE,
    financial_alerts BOOLEAN DEFAULT TRUE,
    system_updates BOOLEAN DEFAULT FALSE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    security_alerts BOOLEAN DEFAULT TRUE,
    
    -- Configurações avançadas
    notification_frequency VARCHAR(20) DEFAULT 'immediate', -- immediate, daily, weekly
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### 5. **Tabela: `user_preferences`**
Preferências do sistema e interface do usuário.

```sql
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Aparência
    theme VARCHAR(20) DEFAULT 'light', -- light, dark, auto
    language VARCHAR(10) DEFAULT 'pt-BR',
    
    -- Formatação e localização
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    time_format VARCHAR(10) DEFAULT '24h', -- 12h, 24h
    currency VARCHAR(5) DEFAULT 'BRL',
    number_format VARCHAR(20) DEFAULT 'pt-BR', -- locale para formatação de números
    
    -- Interface
    sidebar_collapsed BOOLEAN DEFAULT FALSE,
    items_per_page INTEGER DEFAULT 20,
    default_dashboard_view VARCHAR(50) DEFAULT 'overview',
    
    -- Configurações específicas do negócio
    default_appointment_duration INTEGER DEFAULT 60, -- minutos
    working_hours_start TIME DEFAULT '08:00',
    working_hours_end TIME DEFAULT '18:00',
    working_days JSONB DEFAULT '[1,2,3,4,5]', -- Array de dias da semana (0=domingo)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### 6. **Tabela: `notifications`**
Sistema de notificações in-app.

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- info, warning, error, success
    category VARCHAR(50), -- appointment, financial, system, security
    
    -- Dados estruturados
    data JSONB, -- Dados específicos da notificação
    action_url VARCHAR(500), -- URL para ação relacionada
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    priority INTEGER DEFAULT 1, -- 1=baixa, 2=média, 3=alta, 4=crítica
    expires_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_read (is_read),
    INDEX idx_notifications_created (created_at DESC)
);
```

### 7. **Tabela: `password_history`**
Histórico de senhas para evitar reutilização.

```sql
CREATE TABLE password_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_password_history_user_id (user_id)
);
```

---

## 🛡️ APIs de Segurança

### 1. **Autenticação e Autorização**

#### `POST /api/auth/change-password`
```json
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

**Validações:**
- Verificar senha atual
- Validar força da nova senha
- Verificar se nova senha não está no histórico
- Armazenar no histórico de senhas

#### `POST /api/auth/enable-2fa`
```json
{
  "secret": "string",
  "token": "string"
}
```

#### `POST /api/auth/disable-2fa`
```json
{
  "currentPassword": "string",
  "token": "string"
}
```

#### `GET /api/auth/sessions`
Retorna sessões ativas do usuário.

#### `DELETE /api/auth/sessions/:sessionId`
Encerra uma sessão específica.

#### `DELETE /api/auth/sessions/all`
Encerra todas as sessões (exceto atual).

---

## 👤 APIs de Perfil

### 1. **Gerenciamento de Perfil**

#### `GET /api/profile`
```json
{
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "string",
    "branchId": "uuid"
  },
  "profile": {
    "phone": "string",
    "position": "string",
    "department": "string",
    "avatarUrl": "string",
    "bio": "string",
    "dateOfBirth": "date",
    "address": {
      "street": "string",
      "city": "string",
      "state": "string",
      "postalCode": "string",
      "country": "string"
    },
    "socialLinks": {
      "linkedin": "string",
      "twitter": "string"
    }
  }
}
```

#### `PUT /api/profile`
Atualiza informações do perfil.

#### `POST /api/profile/avatar`
Upload de avatar (multipart/form-data).

#### `DELETE /api/profile/avatar`
Remove avatar do usuário.

---

## 🔔 APIs de Notificações

### 1. **Configurações de Notificação**

#### `GET /api/notifications/settings`
Retorna configurações atuais.

#### `PUT /api/notifications/settings`
```json
{
  "emailNotifications": true,
  "smsNotifications": false,
  "pushNotifications": true,
  "appointmentReminders": true,
  "financialAlerts": true,
  "systemUpdates": false,
  "notificationFrequency": "immediate",
  "quietHoursStart": "22:00",
  "quietHoursEnd": "08:00"
}
```

### 2. **Gerenciamento de Notificações**

#### `GET /api/notifications`
```query
?page=1&limit=20&category=appointment&unreadOnly=false
```

#### `PUT /api/notifications/:id/read`
Marca notificação como lida.

#### `PUT /api/notifications/read-all`
Marca todas como lidas.

#### `DELETE /api/notifications/:id`
Arquiva/remove notificação.

#### `POST /api/notifications/send`
```json
{
  "userIds": ["uuid"],
  "title": "string",
  "message": "string",
  "type": "info",
  "category": "system",
  "data": {},
  "actionUrl": "string",
  "priority": 2
}
```

---

## ⚙️ APIs de Preferências

### 1. **Configurações do Sistema**

#### `GET /api/preferences`
Retorna preferências atuais.

#### `PUT /api/preferences`
```json
{
  "theme": "light",
  "language": "pt-BR",
  "timezone": "America/Sao_Paulo",
  "dateFormat": "DD/MM/YYYY",
  "timeFormat": "24h",
  "currency": "BRL",
  "sidebarCollapsed": false,
  "itemsPerPage": 20,
  "defaultDashboardView": "overview",
  "defaultAppointmentDuration": 60,
  "workingHoursStart": "08:00",
  "workingHoursEnd": "18:00",
  "workingDays": [1, 2, 3, 4, 5]
}
```

---

## 📊 APIs de Relatórios e Analytics

### 1. **Atividade do Usuário**

#### `GET /api/analytics/user-activity`
```json
{
  "loginHistory": [
    {
      "timestamp": "2024-01-01T10:00:00Z",
      "ipAddress": "192.168.1.1",
      "device": "Chrome/Windows",
      "location": "São Paulo, BR"
    }
  ],
  "sessionStats": {
    "averageSessionDuration": 120,
    "totalSessions": 45,
    "activeDevices": 2
  }
}
```

---

## 🔐 Middleware de Segurança

### 1. **Rate Limiting**
```javascript
// Limite de tentativas de login
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas
  message: "Muitas tentativas de login"
});

// Limite geral de API
const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // máximo 100 requests
});
```

### 2. **Validação de Sessão**
```javascript
const validateSession = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  // Verificar se sessão está ativa
  const session = await UserSession.findOne({
    sessionToken: token,
    isActive: true,
    expiresAt: { $gt: new Date() }
  });
  
  if (!session) {
    return res.status(401).json({ error: 'Sessão inválida' });
  }
  
  // Atualizar última atividade
  await UserSession.updateOne(
    { _id: session._id },
    { lastActivity: new Date() }
  );
  
  next();
};
```

### 3. **Auditoria de Ações**
```javascript
const auditLog = async (userId, action, details) => {
  await AuditLog.create({
    userId,
    action,
    details,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date()
  });
};
```

---

## 📧 Sistema de Notificações

### 1. **Email Templates**
Criar templates para:
- Confirmação de alteração de senha
- Alerta de novo login
- Notificação de sessão suspeita
- Lembretes de consulta
- Alertas financeiros

### 2. **Push Notifications**
Implementar com Firebase Cloud Messaging (FCM):
```javascript
const sendPushNotification = async (userId, title, message, data = {}) => {
  const user = await User.findById(userId);
  const settings = await NotificationSettings.findOne({ userId });
  
  if (!settings.pushNotifications) return;
  
  const payload = {
    notification: { title, body: message },
    data,
    token: user.fcmToken
  };
  
  await admin.messaging().send(payload);
};
```

---

## 🧪 Testes Sugeridos

### 1. **Testes de Segurança**
- Teste de força bruta em login
- Teste de bypass de 2FA
- Teste de sessões simultâneas
- Teste de escalação de privilégios

### 2. **Testes de API**
- Validação de entrada de dados
- Teste de rate limiting
- Teste de autorização
- Teste de performance

### 3. **Testes de Integração**
- Fluxo completo de alteração de senha
- Fluxo de configuração de notificações
- Fluxo de upload de avatar

---

## 📋 Checklist de Implementação

### Backend Core
- [ ] Estrutura do banco de dados
- [ ] Modelos/Schemas
- [ ] Migrations
- [ ] Seeds iniciais

### APIs de Autenticação
- [ ] Change password
- [ ] 2FA enable/disable
- [ ] Session management
- [ ] Password history

### APIs de Perfil
- [ ] Get/Update profile
- [ ] Avatar upload
- [ ] Profile validation

### APIs de Notificações
- [ ] Settings CRUD
- [ ] Notifications CRUD
- [ ] Send notifications
- [ ] Mark as read/unread

### APIs de Preferências
- [ ] Get/Update preferences
- [ ] Validation and defaults
- [ ] Theme/language support

### Segurança
- [ ] Rate limiting
- [ ] Session validation
- [ ] Audit logging
- [ ] Input sanitization

### Testes
- [ ] Unit tests
- [ ] Integration tests
- [ ] Security tests
- [ ] Performance tests

---

## 🚀 Próximos Passos

1. **Implementar estrutura base** do banco de dados
2. **Criar APIs básicas** de perfil e preferências
3. **Implementar sistema de notificações**
4. **Adicionar camadas de segurança**
5. **Realizar testes abrangentes**
6. **Documentar APIs** com Swagger/OpenAPI
7. **Configurar monitoramento** e logs
8. **Deploy e teste em produção**

---

## 📞 Contato

Para dúvidas sobre a implementação:
- Revisar este documento
- Consultar a documentação da API existente
- Verificar padrões já estabelecidos no projeto

**Boa implementação! 🚀**