# Google Cloud Functions Deployment Guide

## 🎯 Overview
Deploy the updated serverless functions that fix:
- ✅ Infinite retry loops (prevents duplicate vectors)
- ✅ Duplicate prevention checks  
- ✅ Graceful quota handling
- ✅ Limited retries (max 1 instead of infinite)

## 📁 Files to Deploy
- `study_buddy_backend/serverless/main.py` (wrapper functions)
- `study_buddy_backend/serverless/vector.py` (core logic with fixes)
- `study_buddy_backend/serverless/requirements.txt` (dependencies)

## 🚀 Deployment Steps

### Step 1: Navigate to Serverless Directory
```bash
cd "c:\Users\saatv\OneDrive\Desktop\study_buddy_fixed\study_buddy_backend\serverless"
```

### Step 2: Login to Google Cloud (if not already)
```bash
gcloud auth login
gcloud config set project studybuddy-681c2
```

### Step 3: Deploy Create Vectors Function
```bash
gcloud functions deploy create-vectors \
  --runtime python39 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point handle_create_vectors \
  --source . \
  --timeout 540 \
  --memory 2GB \
  --region asia-south1
```

### Step 4: Deploy Query Vectors Function  
```bash
gcloud functions deploy query-vectors \
  --runtime python39 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point handle_query_vectors \
  --source . \
  --timeout 60 \
  --memory 1GB \
  --region asia-south1
```

### Step 5: Deploy Check Vectors Function (Optional)
```bash
# Note: We made /check_vectors use direct Supabase query instead
# But if you want to keep the serverless version as backup:
gcloud functions deploy check-vectors \
  --runtime python39 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point handle_check_vectors \
  --source . \
  --timeout 30 \
  --memory 512MB \
  --region asia-south1
```

## 🔧 Alternative: Deploy All Functions at Once

Create a deployment script:

### Option A: Windows Batch Script
Create `deploy.bat` in the serverless folder:
```batch
@echo off
echo Deploying Google Cloud Functions...

echo.
echo Deploying create-vectors function...
gcloud functions deploy create-vectors --runtime python39 --trigger-http --allow-unauthenticated --entry-point handle_create_vectors --source . --timeout 540 --memory 2GB --region asia-south1

echo.
echo Deploying query-vectors function...
gcloud functions deploy query-vectors --runtime python39 --trigger-http --allow-unauthenticated --entry-point handle_query_vectors --source . --timeout 60 --memory 1GB --region asia-south1

echo.
echo Deployment complete!
pause
```

Then run:
```bash
deploy.bat
```

### Option B: PowerShell Script
Create `deploy.ps1`:
```powershell
Write-Host "Deploying Google Cloud Functions..." -ForegroundColor Green

Write-Host "`nDeploying create-vectors function..." -ForegroundColor Yellow
gcloud functions deploy create-vectors `
  --runtime python39 `
  --trigger-http `
  --allow-unauthenticated `
  --entry-point handle_create_vectors `
  --source . `
  --timeout 540 `
  --memory 2GB `
  --region asia-south1

Write-Host "`nDeploying query-vectors function..." -ForegroundColor Yellow  
gcloud functions deploy query-vectors `
  --runtime python39 `
  --trigger-http `
  --allow-unauthenticated `
  --entry-point handle_query_vectors `
  --source . `
  --timeout 60 `
  --memory 1GB `
  --region asia-south1

Write-Host "`nDeployment complete!" -ForegroundColor Green
```

Then run:
```powershell
.\deploy.ps1
```

## 🔍 Verify Deployment

### Check Function Status
```bash
gcloud functions list --region asia-south1
```

### Test Functions
```bash
# Test create-vectors function
curl -X POST https://asia-south1-studybuddy-681c2.cloudfunctions.net/create-vectors \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Test query-vectors function  
curl -X POST https://asia-south1-studybuddy-681c2.cloudfunctions.net/query-vectors \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Check Logs
```bash
# View create-vectors logs
gcloud functions logs read create-vectors --region asia-south1 --limit 50

# View query-vectors logs
gcloud functions logs read query-vectors --region asia-south1 --limit 50
```

## 🔧 Environment Variables (If Needed)

If your functions need environment variables:

```bash
# Set environment variables during deployment
gcloud functions deploy create-vectors \
  --runtime python39 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point handle_create_vectors \
  --source . \
  --set-env-vars GROQ_API_KEY=your_key,GEMINI_API_KEY=your_key,SUPABASE_URL=your_url,SUPABASE_KEY=your_key \
  --timeout 540 \
  --memory 2GB \
  --region asia-south1
```

## ⚠️ Troubleshooting

### Common Issues:

1. **Permission Denied**:
   ```bash
   gcloud auth login
   gcloud config set project studybuddy-681c2
   ```

2. **Function Already Exists**:
   - The deploy command will update existing functions automatically

3. **Timeout During Deployment**:
   - Check your internet connection
   - Retry the deployment command

4. **Memory/Timeout Errors**:
   - Increase memory: `--memory 4GB`
   - Increase timeout: `--timeout 540`

### Check Deployment Status:
```bash
# List all functions
gcloud functions list

# Get function details
gcloud functions describe create-vectors --region asia-south1
```

## ✅ Success Indicators

After successful deployment, you should see:
- ✅ Functions listed in `gcloud functions list`
- ✅ No more infinite retry loops in logs
- ✅ "Vectors already exist. Skipping processing." messages for duplicates
- ✅ "Max retries exceeded" instead of endless 429 errors
- ✅ Faster vector processing

## 🎯 Next Steps

After Google Cloud deployment:
1. ✅ Test vector generation from your frontend
2. ✅ Check logs for improved behavior
3. ✅ Monitor for duplicate prevention
4. ✅ Then deploy Render (Flask API) updates

## 📞 Need Help?

If deployment fails:
1. Check the error message
2. Verify you're in the correct directory
3. Ensure Google Cloud SDK is installed
4. Check project permissions
5. Try deploying one function at a time
