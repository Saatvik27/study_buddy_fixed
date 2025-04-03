const backendconfig = {
    apiBaseUrl: process.env.NODE_ENV === 'production'
      ? 'https://study-buddy-backend-jasx.onrender.com' // Replace with your actual Render URL
      : 'http://localhost:8000' // For local development
  };
  
  export default backendconfig;