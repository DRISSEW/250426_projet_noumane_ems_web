import { getDashboardTypeData, getFeedData } from '../services/emonAPI';

const UPDATE_INTERVAL = 60000; // 1 minute
const RETRY_DELAY = 5000; // 5 seconds for retry on failure

class ChartUpdateManager {
    constructor() {
        this.updateIntervals = new Map();
        this.retryTimers = new Map();
    }

    startChartUpdate(config) {
        const {
            chartId,
            type,
            timeRange,
            setChartData,
            setTensionData,
            setError,
            setLoading
        } = config;

        // Clear any existing intervals for this chart
        this.stopChartUpdate(chartId);

        const updateData = async () => {
            try {
                setLoading?.(true);

                // Update main chart data
                if (type) {
                    const data = await getDashboardTypeData(type, timeRange);
                    setChartData?.(data);
                }

                // Update tension data if needed
                if (type !== 'Multicourants') {
                    const tensionData = await getFeedData(28, timeRange);
                    setTensionData?.(tensionData);
                }

                setLoading?.(false);

                // Clear retry timer if success
                if (this.retryTimers.has(chartId)) {
                    clearTimeout(this.retryTimers.get(chartId));
                    this.retryTimers.delete(chartId);
                }

            } catch (error) {
                console.error(`Chart update failed for ${chartId}:`, error);
                setError?.(`Failed to update chart: ${error.message}`);
                setLoading?.(false);

                // Schedule retry
                this.retryTimers.set(chartId,
                    setTimeout(() => updateData(), RETRY_DELAY)
                );
            }
        };

        // Initial update
        updateData();

        // Set up interval for periodic updates
        const intervalId = setInterval(updateData, UPDATE_INTERVAL);
        this.updateIntervals.set(chartId, intervalId);

        // Return cleanup function
        return () => this.stopChartUpdate(chartId);
    }

    stopChartUpdate(chartId) {
        // Clear update interval
        if (this.updateIntervals.has(chartId)) {
            clearInterval(this.updateIntervals.get(chartId));
            this.updateIntervals.delete(chartId);
        }

        // Clear retry timer
        if (this.retryTimers.has(chartId)) {
            clearTimeout(this.retryTimers.get(chartId));
            this.retryTimers.delete(chartId);
        }
    }
}

export const chartUpdateManager = new ChartUpdateManager();