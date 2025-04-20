// Polling service - handles periodic data fetching for the application
import { getUnreadMessageCount } from './messageService';

// Type definitions
export type PollingFunction = () => Promise<any>;

interface PollingTask {
  id: string;
  task: PollingFunction;
  interval: number;
  lastRun: number;
  isActive: boolean;
}

interface PollingState {
  isRunning: boolean;
  tasks: Map<string, PollingTask>;
  globalInterval: number;
}

// Default configuration
const DEFAULT_INTERVAL = 10000; // 10 seconds

// Singleton state
const state: PollingState = {
  isRunning: false,
  tasks: new Map(),
  globalInterval: 1000, // Check tasks every 1 second
};

// Internal timer reference
let timerRef: number | null = null;

/**
 * Runs all due polling tasks
 */
const runDueTasks = async () => {
  const now = Date.now();
  
  for (const [id, task] of state.tasks.entries()) {
    if (!task.isActive) continue;
    
    // Check if the task is due to run
    if (now - task.lastRun >= task.interval) {
      try {
        // Execute the task
        await task.task();
        // Update last run time
        state.tasks.get(id)!.lastRun = Date.now();
      } catch (error) {
        console.error(`Error executing polling task ${id}:`, error);
      }
    }
  }
};

/**
 * Starts the polling service
 */
export const startPolling = () => {
  if (state.isRunning) return;
  
  state.isRunning = true;
  
  // Set up the timer to check tasks
  timerRef = window.setInterval(() => {
    runDueTasks();
  }, state.globalInterval);
  
  console.log('Polling service started');
};

/**
 * Stops the polling service
 */
export const stopPolling = () => {
  if (!state.isRunning) return;
  
  if (timerRef !== null) {
    window.clearInterval(timerRef);
    timerRef = null;
  }
  
  state.isRunning = false;
  console.log('Polling service stopped');
};

/**
 * Registers a new polling task
 * @param id Unique identifier for the task
 * @param task Function to execute
 * @param interval Time between executions in milliseconds
 * @returns Function to unregister the task
 */
export const registerPollingTask = (
  id: string,
  task: PollingFunction,
  interval = DEFAULT_INTERVAL
): () => void => {
  // Add the task to the registry
  state.tasks.set(id, {
    id,
    task,
    interval,
    lastRun: 0, // Run immediately the first time
    isActive: true,
  });
  
  // Start polling if not already running
  if (!state.isRunning) {
    startPolling();
  }
  
  console.log(`Registered polling task: ${id} (interval: ${interval}ms)`);
  
  // Return a function to unregister the task
  return () => {
    unregisterPollingTask(id);
  };
};

/**
 * Unregisters a polling task
 * @param id Task identifier to remove
 */
export const unregisterPollingTask = (id: string) => {
  if (state.tasks.has(id)) {
    state.tasks.delete(id);
    console.log(`Unregistered polling task: ${id}`);
    
    // If no tasks remain, stop polling
    if (state.tasks.size === 0) {
      stopPolling();
    }
  }
};

/**
 * Pauses a specific polling task
 * @param id Task identifier to pause
 */
export const pausePollingTask = (id: string) => {
  const task = state.tasks.get(id);
  if (task) {
    task.isActive = false;
    console.log(`Paused polling task: ${id}`);
  }
};

/**
 * Resumes a specific polling task
 * @param id Task identifier to resume
 */
export const resumePollingTask = (id: string) => {
  const task = state.tasks.get(id);
  if (task) {
    task.isActive = true;
    console.log(`Resumed polling task: ${id}`);
  }
};

// Common polling tasks
export const registerNotificationPolling = (userId: number | string) => {
  return registerPollingTask(
    `notifications-${userId}`,
    async () => {
      // Fetch unread message count
      try {
        const count = await getUnreadMessageCount();
        // You could dispatch this to a global state if needed
        if (count > 0) {
          console.log(`You have ${count} unread messages`);
          // This could trigger a notification or update a badge
        }
      } catch (error) {
        console.error('Failed to poll notifications:', error);
      }
    },
    30000 // Check every 30 seconds
  );
};

// Additional polling tasks can be added here
