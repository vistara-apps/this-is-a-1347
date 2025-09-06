# SpeakTaskr - Voice-Activated Task Management

**Your Voice, Your Tasks, Seamlessly Organized.**

SpeakTaskr is a voice-activated AI agent that captures spoken thoughts, turns them into actionable tasks and calendar events, and sets intelligent reminders for users within the Base ecosystem.

## 🚀 Features

### Core Features
- **Instant Voice-to-Task Creation**: Speak directly into the app to create new to-do items
- **Spoken Calendar Scheduling**: Schedule events and meetings by speaking details
- **Intelligent Reminder Setting**: AI automatically suggests and sets context-aware reminders
- **Task Prioritization & Sequencing**: AI-driven suggestions on task order and importance

### Technical Features
- Real-time voice transcription using OpenAI Whisper
- Natural language understanding for task/event parsing
- Smart date/time parsing with context awareness
- Real-time data synchronization with Supabase
- Browser and in-app notifications
- Wallet integration with RainbowKit
- Premium features with micro-transaction support

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **State Management**: Zustand
- **Voice Processing**: OpenAI Whisper API
- **AI Processing**: OpenAI GPT-4
- **Database**: Supabase (PostgreSQL)
- **Wallet Integration**: RainbowKit, Wagmi
- **Notifications**: React Hot Toast, Browser Notifications
- **Date Handling**: date-fns

## 📋 Prerequisites

Before running the application, you'll need:

1. **OpenAI API Key** - For voice transcription and AI processing
2. **Supabase Project** - For data persistence and real-time features
3. **Node.js 18+** - For running the development server

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vistara-apps/this-is-a-1347.git
   cd this-is-a-1347
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   # OpenAI API Configuration
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_OPENAI_BASE_URL=https://api.openai.com/v1

   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # Optional: Farcaster/Neynar API Configuration
   VITE_NEYNAR_API_KEY=your_neynar_api_key_here
   VITE_NEYNAR_BASE_URL=https://api.neynar.com/v2
   ```

4. **Set up Supabase database**
   
   Run the SQL schema in your Supabase SQL editor:
   ```sql
   -- The complete schema is available in src/lib/supabase.js
   -- Copy the DATABASE_SCHEMA constant and run it in Supabase
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🏗 Architecture

### Project Structure
```
src/
├── components/          # React components
│   ├── AppShell.jsx    # Main layout wrapper
│   ├── VoiceInputButton.jsx  # Voice recording interface
│   ├── TaskList.jsx    # Task management interface
│   ├── CalendarView.jsx # Calendar interface
│   ├── ReminderConfigurator.jsx # Reminder settings
│   ├── NotificationSystem.jsx # Notification management
│   └── PremiumModal.jsx # Premium feature modal
├── hooks/              # Custom React hooks
│   ├── useVoiceProcessor.js # Voice processing logic
│   └── usePaymentContext.js # Payment handling
├── lib/                # External service integrations
│   └── supabase.js     # Database operations
├── store/              # State management
│   └── index.js        # Zustand stores
├── config/             # Configuration
│   └── index.js        # App configuration
└── App.jsx             # Main application component
```

### Data Models

#### User
```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  farcaster_id TEXT UNIQUE,
  wallet_address TEXT UNIQUE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Task
```sql
CREATE TABLE tasks (
  task_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  reminder_settings JSONB DEFAULT '{"enabled": false}',
  tags TEXT[] DEFAULT '{}',
  estimated_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Calendar Event
```sql
CREATE TABLE calendar_events (
  event_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT,
  attendees TEXT[] DEFAULT '{}',
  reminder_settings JSONB DEFAULT '{"enabled": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎯 Usage

### Voice Commands

**Creating Tasks:**
- "Remind me to buy groceries at 5 PM"
- "Call mom tomorrow morning"
- "Finish the quarterly report by end of week"

**Scheduling Events:**
- "Schedule a meeting with John tomorrow at 3 PM about the project review"
- "Doctor appointment next Tuesday at 2 PM"
- "Team standup meeting on Friday at 10 AM"

### Features

1. **Voice Input**: Click the microphone button and speak your task or event
2. **Task Management**: View, edit, complete, and delete tasks
3. **Calendar View**: See upcoming events in a clean calendar interface
4. **Reminders**: Configure custom reminders for tasks and events
5. **Notifications**: Receive browser and in-app notifications
6. **Premium Features**: AI-powered task prioritization and sequencing

## 🔐 Security

- Row Level Security (RLS) enabled on all database tables
- User data isolated by wallet address
- API keys stored securely in environment variables
- Real-time subscriptions filtered by user ID

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy**

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder to your hosting provider**

## 🧪 Development

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/vistara-apps/this-is-a-1347/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## 🔮 Roadmap

- [ ] Farcaster Frame integration
- [ ] Advanced AI task sequencing
- [ ] Team collaboration features
- [ ] Mobile app (React Native)
- [ ] Voice command shortcuts
- [ ] Integration with external calendars
- [ ] Advanced analytics and insights

## 🙏 Acknowledgments

- OpenAI for Whisper and GPT-4 APIs
- Supabase for the backend infrastructure
- RainbowKit for wallet integration
- The Base ecosystem for the platform

---

Built with ❤️ for the Base ecosystem
