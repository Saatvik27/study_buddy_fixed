# Vector Generation CORS & Quota Error Fixes

## Issues Identified

### 1. **CORS Error** 
```
Access to fetch at 'https://study-buddy-backend-jasx.onrender.com/generate_vectors' from origin 'https://studybuddy-681c2.web.app' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### 2. **Google Cloud Quota Exceeded**
- Google Cloud Run/Functions quota exceeded for Gemini API
- This causes the serverless function to fail, which may not return proper CORS headers

## Root Cause Analysis

The CORS error is likely a **secondary effect** of the quota issue:

1. **Primary Issue**: Google Cloud quota exceeded → Serverless function fails
2. **Secondary Issue**: Failed serverless function doesn't return proper CORS headers → Browser shows CORS error
3. **User Experience**: Appears as CORS issue, but root cause is quota

## Fixes Applied

### 1. **Enhanced Error Handling for Quota Issues**

```python
elif response.status_code == 429:
    # Quota exceeded error
    app.logger.warning("Google Cloud quota exceeded for vector generation")
    return jsonify({
        "error": "Quota exceeded. Please try again later or upgrade your API quota.",
        "error_type": "quota_exceeded",
        "message": "The vector generation service has exceeded its quota limits. This is temporary - please try again in a few minutes.",
        "status": "quota_error"
    }), 429
```

### 2. **Better Serverless Function Error Handling**

```python
elif response.status_code >= 500:
    # Server errors from the serverless function
    return jsonify({
        "error": "Vector generation service is temporarily unavailable. Please try again later.",
        "error_type": "service_unavailable", 
        "status": "server_error"
    }), 503
```

### 3. **Comprehensive Timeout Handling**

```python
except requests.exceptions.ConnectTimeout:
    return jsonify({
        "error": "Connection timeout to vector generation service. Please try again.",
        "error_type": "connection_timeout",
        "status": "timeout"
    }), 504

except requests.exceptions.ReadTimeout:
    return jsonify({
        "error": "Vector generation is taking longer than expected. Please try again with a smaller file.",
        "error_type": "processing_timeout",
        "status": "timeout" 
    }), 504
```

### 4. **Added CORS Test Endpoint**

```python
@app.route('/test-vector-cors', methods=['GET', 'POST', 'OPTIONS'])
def test_vector_cors():
    # Test endpoint to verify CORS is working for vector generation
```

## Solutions & Recommendations

### Immediate Fix: Handle Quota Gracefully
✅ **Deploy the updated Flask API** - Now handles quota errors properly with CORS headers

### Short-term Solutions:
1. **Wait for Quota Reset** - Google Cloud quotas typically reset daily
2. **Use Smaller Files** - Reduce the size of PDFs being processed
3. **Retry Later** - The improved error handling will tell users when to retry

### Long-term Solutions:
1. **Upgrade Google Cloud Quota**:
   ```bash
   # In Google Cloud Console
   # Go to APIs & Services > Quotas
   # Find Gemini API quotas and request increase
   ```

2. **Implement Rate Limiting**:
   - Add delays between API calls in the serverless function
   - Process fewer images per PDF

3. **Alternative Processing**:
   - Skip image processing when quota is low
   - Process text-only content as fallback

## Testing Steps

### 1. Test CORS Setup
```bash
# Test the CORS test endpoint
curl -X OPTIONS https://study-buddy-backend-jasx.onrender.com/test-vector-cors \
  -H "Origin: https://studybuddy-681c2.web.app" \
  -H "Access-Control-Request-Method: POST"
```

### 2. Test Vector Generation with Quota Error
```bash
# This should now return a proper error with CORS headers
curl -X POST https://study-buddy-backend-jasx.onrender.com/generate_vectors \
  -H "Origin: https://studybuddy-681c2.web.app" \
  -H "Content-Type: application/json" \
  -d '{"file_url": "test", "user_id": "test"}'
```

## Error Response Examples

### Quota Exceeded (429)
```json
{
  "error": "Quota exceeded. Please try again later or upgrade your API quota.",
  "error_type": "quota_exceeded", 
  "message": "The vector generation service has exceeded its quota limits. This is temporary - please try again in a few minutes.",
  "status": "quota_error"
}
```

### Service Unavailable (503)
```json
{
  "error": "Vector generation service is temporarily unavailable. Please try again later.",
  "error_type": "service_unavailable",
  "status": "server_error"
}
```

## Frontend Handling

Update your frontend to handle these new error types:

```javascript
try {
  const response = await fetch('/generate_vectors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_url, user_id })
  });
  
  if (!response.ok) {
    const error = await response.json();
    
    if (error.error_type === 'quota_exceeded') {
      // Show quota exceeded message
      alert('Quota exceeded. Please try again in a few minutes.');
    } else if (error.error_type === 'service_unavailable') {
      // Show service unavailable message
      alert('Service temporarily unavailable. Please try again later.');
    } else {
      // Show generic error
      alert(error.error || 'Vector generation failed');
    }
  }
} catch (e) {
  console.error('Network error:', e);
}
```

## Status: ✅ READY FOR DEPLOYMENT

The Flask API now handles quota errors gracefully while maintaining proper CORS headers. This should resolve both the CORS error and provide clear feedback about quota issues.
