# MARA+ Environment Configuration

## Overview
This document outlines the environment setup and configuration for the MARA+ educational platform, including Firebase integration and API configurations.

## Environment Variables

### Firebase Configuration
```env
FIREBASE_PROJECT_ID=maraplus-ecd9d
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=mara-plus-dev.firebaseapp.com
FIREBASE_DATABASE_URL=https://mara-plus-dev-default-rtdb.firebaseio.com
FIREBASE_STORAGE_BUCKET=mara-plus-dev.appspot.com
```

### Claude AI Configuration
```env
CLAUDE_API_KEY=your_claude_api_key
CLAUDE_MODEL=claude-3-sonnet-20240229
```

### MRSM Academic Data Sources
```env
MRSM_PORTAL_URL=https://portal.mrsm.edu.my
MRSM_API_KEY=your_mrsm_api_key
```

### Development Settings
```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Security
```env
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key
```

## Firebase Setup Results

### ✅ Connectivity Test
- **Status**: Connected (Mock Mode)
- **Project ID**: maraplus-ecd9d
- **Database URL**: https://maraplus-ecd9d-default-rtdb.firebaseio.com
- **Test Result**: Firestore read/write operations successful

### ✅ Collection Provisioning
The following base collections have been initialized:

1. **users** - Student and teacher user profiles
2. **modules** - Educational content modules
3. **xp_tracking** - Experience points and gamification data
4. **reflections** - Student learning reflections
5. **mood_logs** - Student mood and wellness tracking
6. **ai_sessions** - AI interaction logs and context

### 🔧 Service Account Configuration
- **File**: `firebase-service-account.json`
- **Service Account Email**: firebase-adminsdk-fbsvc@maraplus-ecd9d.iam.gserviceaccount.com
- **Project ID**: maraplus-ecd9d

## Next Steps

1. **Replace Mock Credentials**: Update `firebase-service-account.json` with valid private key
2. **Security Review**: Implement Firestore security rules
3. **Environment Validation**: Test all environment variables in production
4. **Monitoring Setup**: Configure logging and monitoring for Firebase operations

## Scripts and Tools

### Firebase Initialization
```bash
# Test Firebase connectivity (mock mode)
node firebase-mock-init.js

# Initialize with real credentials
node firebase-init.js
```

### Data Upload
```bash
# Upload sample data
node firebase/firestoreUploader.js sample

# Upload custom data
node firebase/firestoreUploader.js custom <collection> <file-path>
```

## Security Notes

- All credentials should be stored securely and never committed to version control
- Firebase security rules should be implemented before production deployment
- API keys should be rotated regularly
- Use environment-specific configurations for development, staging, and production

---

*Generated on: ${new Date().toISOString()}*
*MARA+ Platform Environment Setup v1.0*