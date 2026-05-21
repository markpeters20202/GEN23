// Application startup initialization
import { startAllMonitors } from './contractMonitor'

let initialized = false

export async function initializeApp() {
    if (initialized) {
        console.log('App already initialized')
        return
    }

    console.log('Initializing VIP Trading application...')

    try {
        // Skip contract monitoring in serverless environments like Vercel
        if (process.env.VERCEL) {
            console.log('Serverless environment detected - contract monitoring disabled')
            console.log('Use /api/events endpoint for manual event checking')
        } else {
            // Only start contract monitoring in local development or dedicated servers
            const shouldStartMonitoring = process.env.NODE_ENV === 'development' || 
                                         process.env.ENABLE_CONTRACT_MONITORING === 'true'
            
            if (shouldStartMonitoring && !process.env.NEXT_PHASE) {
                console.log('Starting contract monitoring...')
                await startAllMonitors()
                console.log('Contract monitoring started successfully')
            } else {
                console.log('Contract monitoring disabled')
            }
        }

        initialized = true
        console.log('VIP Trading application initialized successfully')
    } catch (error) {
        console.error('Failed to initialize application:', error)
    }
}

// Don't auto-initialize during import to prevent SSR issues
// Contract monitoring will be started by API routes when needed