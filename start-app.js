/**
 * Teacher Prep Assistant - Full Application Starter
 * This script starts both the backend server and frontend application
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('=============================================');
console.log('Teacher Prep Assistant - Full App Starter');
console.log('=============================================');

// Start the server
function startServer() {
  console.log('\n🚀 Starting the backend server...');
  
  const serverPath = path.join(__dirname, 'server');
  const serverProcess = spawn('node', ['start-server.js'], { 
    cwd: serverPath, 
    shell: true, 
    stdio: 'inherit' 
  });
  
  serverProcess.on('error', (error) => {
    console.error('Failed to start server:', error);
  });
  
  return serverProcess;
}

// Start the client application
function startClient() {
  console.log('\n🚀 Starting the frontend application...');
  
  const clientProcess = spawn('npm', ['start'], { 
    cwd: __dirname, 
    shell: true, 
    stdio: 'inherit',
    env: { ...process.env, BROWSER: 'none' }  // Prevent auto-opening browser
  });
  
  clientProcess.on('error', (error) => {
    console.error('Failed to start client:', error);
  });
  
  return clientProcess;
}

// Handle process termination
function setupProcessHandlers(processes) {
  // Handle script interruption
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping all processes...');
    processes.forEach(proc => {
      if (!proc.killed) {
        proc.kill('SIGINT');
      }
    });
    process.exit(0);
  });
}

// Main function
async function main() {
  try {
    // Start server first
    const serverProcess = startServer();
    
    // Wait for the server to initialize (5 seconds)
    console.log('⏳ Waiting for server to initialize...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Start client
    const clientProcess = startClient();
    
    // Setup process handlers
    setupProcessHandlers([serverProcess, clientProcess]);
    
    console.log('\n✅ Both server and client have been started.');
    console.log('📊 Backend: http://localhost:5000');
    console.log('🖥️ Frontend: http://localhost:3001');
    console.log('\n📘 Press Ctrl+C to stop both applications.');
  } catch (error) {
    console.error('Error starting the application:', error);
  }
}

// Start the application
main(); 