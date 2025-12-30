export const registerSW = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully: ', registration);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('New service worker found:', newWorker);
      });
      
      return registration;
    } catch (registrationError) {
      console.log('Service Worker registration failed: ', registrationError);
    }
  } else {
    console.log('Service Workers are not supported in this browser');
  }
};

export default registerSW;