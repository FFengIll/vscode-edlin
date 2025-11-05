/**
 * Performance optimization utilities for the Edlin extension
 */

export interface PerformanceMetrics {
    operationCount: number;
    totalProcessingTime: number;
    averageProcessingTime: number;
    lastOperationTime: number;
}

export class PerformanceTracker {
    private metrics: Map<string, PerformanceMetrics> = new Map();
    private timers: Map<string, number> = new Map();

    /**
     * Starts timing an operation
     * @param operationName - Name of the operation to time
     */
    startTimer(operationName: string): void {
        this.timers.set(operationName, Date.now());
    }

    /**
     * Ends timing an operation and records the metrics
     * @param operationName - Name of the operation to end timing for
     * @returns The duration in milliseconds
     */
    endTimer(operationName: string): number {
        const startTime = this.timers.get(operationName);
        if (!startTime) {
            console.warn(`[Performance] Timer not found for operation: ${operationName}`);
            return 0;
        }

        const duration = Date.now() - startTime;
        this.recordMetric(operationName, duration);
        this.timers.delete(operationName);

        return duration;
    }

    /**
     * Records performance metrics for an operation
     * @param operationName - Name of the operation
     * @param duration - Duration in milliseconds
     */
    private recordMetric(operationName: string, duration: number): void {
        const existing = this.metrics.get(operationName);

        if (existing) {
            existing.operationCount++;
            existing.totalProcessingTime += duration;
            existing.averageProcessingTime = existing.totalProcessingTime / existing.operationCount;
            existing.lastOperationTime = duration;
        } else {
            this.metrics.set(operationName, {
                operationCount: 1,
                totalProcessingTime: duration,
                averageProcessingTime: duration,
                lastOperationTime: duration
            });
        }

        // Log performance warnings
        if (duration > 1000) {
            console.warn(`[Performance] Slow operation detected: ${operationName} took ${duration}ms`);
        }
    }

    /**
     * Gets performance metrics for an operation
     * @param operationName - Name of the operation
     * @returns Performance metrics or undefined if not found
     */
    getMetrics(operationName: string): PerformanceMetrics | undefined {
        return this.metrics.get(operationName);
    }

    /**
     * Gets all performance metrics
     * @returns Map of all operation metrics
     */
    getAllMetrics(): Map<string, PerformanceMetrics> {
        return new Map(this.metrics);
    }

    /**
     * Resets all performance metrics
     */
    reset(): void {
        this.metrics.clear();
        this.timers.clear();
    }
}

// Global performance tracker instance
export const performanceTracker = new PerformanceTracker();

/**
 * Decorator to automatically track function performance
 * @param operationName - Name of the operation for tracking
 */
export function trackPerformance(operationName: string) {
    return function (_target: any, _propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;

        descriptor.value = function (...args: any[]) {
            performanceTracker.startTimer(operationName);
            try {
                const result = method.apply(this, args);

                // Handle async functions
                if (result && typeof result.then === 'function') {
                    return result.finally(() => {
                        performanceTracker.endTimer(operationName);
                    });
                } else {
                    performanceTracker.endTimer(operationName);
                    return result;
                }
            } catch (error) {
                performanceTracker.endTimer(operationName);
                throw error;
            }
        };

        return descriptor;
    };
}

/**
 * Debounces a function call
 * @param func - The function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
}

/**
 * Memoizes a function with a simple cache
 * @param func - The function to memoize
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(func: T): T {
    const cache = new Map<string, ReturnType<T>>();

    return ((...args: Parameters<T>): ReturnType<T> => {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key)!;
        }

        const result = func.apply(null, args);
        cache.set(key, result);

        // Limit cache size to prevent memory issues
        if (cache.size > 100) {
            const firstKey = cache.keys().next().value;
            if (firstKey !== undefined) {
                cache.delete(firstKey);
            }
        }

        return result;
    }) as T;
}

/**
 * Processes large text in chunks to avoid UI blocking
 * @param text - The text to process
 * @param processor - Function to process each chunk
 * @param chunkSize - Size of each chunk (default: 1000 lines)
 * @returns Promise that resolves to the processed text
 */
export async function processInChunks<T>(
    items: T[],
    processor: (chunk: T[]) => Promise<void>,
    chunkSize: number = 100
): Promise<void> {
    for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        await processor(chunk);

        // Yield control to prevent blocking
        if (i + chunkSize < items.length) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }
}