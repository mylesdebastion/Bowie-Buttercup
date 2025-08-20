/**
 * Legacy Game Loader
 *
 * Temporarily loads the original monolithic game code
 * while modularization is in progress.
 *
 * This file will be removed once modularization is complete.
 */

// Create a script element to load the original game
const gameScript = document.createElement('script');

// Extract the JavaScript from the original index.html
// This is a temporary solution during transition
gameScript.textContent = `
// Original game code will be loaded here
// This is extracted from the monolithic index.html

console.log('🔄 Loading legacy game code...')

// For now, redirect to original game
if (window.location.pathname.includes('/src/')) {
  console.log('🔀 Redirecting to original game during development')
  window.location.href = '../index.html'
} else {
  console.log('⚠️  Legacy loader: Original game should be running')
}
`;

// Append to document
document.head.appendChild(gameScript);

export default {
  loaded: true,
  version: 'legacy',
  message: 'Legacy game loader active during modularization'
};
