// Route Optimization Service
// Calculates optimal routes and provides travel insights

// Using inline type definition to avoid import issues
interface JobRecord {
  id: string;
  latitude: number;
  longitude: number;
  address?: string;
  start_time?: string;
  estimated_hours?: number;
  duration_hours?: number;
}

export interface RouteOptimization {
  totalDistance: number; // miles
  totalDuration: number; // minutes
  estimatedFuelCost: number;
  optimizedOrder: JobRecord[];
  savings: {
    distance: number;
    time: number;
    cost: number;
  };
}

export interface JobLocation {
  jobId: string;
  address: string;
  latitude: number;
  longitude: number;
  scheduledTime: string;
  duration: number;
}

export class RouteOptimizationService {
  
  // Calculate distance between two points (Haversine formula)
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 3959; // Earth radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }
  
  // Estimate travel time based on distance
  estimateTravelTime(distanceMiles: number): number {
    // Assume average speed of 25 mph in city
    const avgSpeedMph = 25;
    const timeHours = distanceMiles / avgSpeedMph;
    return Math.ceil(timeHours * 60); // Convert to minutes
  }
  
  // Calculate fuel cost
  calculateFuelCost(distanceMiles: number): number {
    const avgMpg = 25; // Average fuel economy
    const gasPrice = 3.50; // Average gas price per gallon
    const gallonsUsed = distanceMiles / avgMpg;
    return gallonsUsed * gasPrice;
  }
  
  // Optimize route for multiple jobs using nearest neighbor algorithm
  optimizeRoute(
    jobs: JobRecord[],
    startLocation?: { lat: number; lng: number }
  ): RouteOptimization {
    if (jobs.length === 0) {
      return {
        totalDistance: 0,
        totalDuration: 0,
        estimatedFuelCost: 0,
        optimizedOrder: [],
        savings: { distance: 0, time: 0, cost: 0 }
      };
    }
    
    // Start from cleaner's current location or first job
    let currentLat = startLocation?.lat || jobs[0].latitude;
    let currentLng = startLocation?.lng || jobs[0].longitude;
    
    const unvisited = [...jobs];
    const optimizedOrder: JobRecord[] = [];
    let totalDistance = 0;
    let totalDuration = 0;
    
    // Nearest neighbor algorithm
    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      
      // Find nearest unvisited job
      unvisited.forEach((job, index) => {
        const distance = this.calculateDistance(
          currentLat,
          currentLng,
          job.latitude,
          job.longitude
        );
        
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      
      // Visit nearest job
      const nextJob = unvisited.splice(nearestIndex, 1)[0];
      optimizedOrder.push(nextJob);
      
      totalDistance += nearestDistance;
      totalDuration += this.estimateTravelTime(nearestDistance);
      totalDuration += (nextJob.duration_hours || nextJob.estimated_hours || 0) * 60; // Add job duration
      
      currentLat = nextJob.latitude;
      currentLng = nextJob.longitude;
    }
    
    const estimatedFuelCost = this.calculateFuelCost(totalDistance);
    
    // Calculate savings vs simple sequential order
    const sequentialDistance = this.calculateSequentialDistance(jobs, startLocation);
    const savings = {
      distance: sequentialDistance - totalDistance,
      time: this.estimateTravelTime(sequentialDistance - totalDistance),
      cost: this.calculateFuelCost(sequentialDistance - totalDistance)
    };
    
    return {
      totalDistance,
      totalDuration,
      estimatedFuelCost,
      optimizedOrder,
      savings
    };
  }
  
  // Calculate distance for sequential (non-optimized) order
  private calculateSequentialDistance(
    jobs: JobRecord[],
    startLocation?: { lat: number; lng: number }
  ): number {
    if (jobs.length === 0) return 0;
    
    let total = 0;
    let currentLat = startLocation?.lat || jobs[0].latitude;
    let currentLng = startLocation?.lng || jobs[0].longitude;
    
    jobs.forEach(job => {
      total += this.calculateDistance(currentLat, currentLng, job.latitude, job.longitude);
      currentLat = job.latitude;
      currentLng = job.longitude;
    });
    
    return total;
  }
  
  // Get jobs grouped by area (clustering)
  groupJobsByArea(jobs: JobRecord[], radiusMiles: number = 5): JobRecord[][] {
    const clusters: JobRecord[][] = [];
    const processed = new Set<string>();
    
    jobs.forEach(job => {
      if (processed.has(job.id)) return;
      
      // Start new cluster
      const cluster: JobRecord[] = [job];
      processed.add(job.id);
      
      // Find nearby jobs
      jobs.forEach(otherJob => {
        if (processed.has(otherJob.id)) return;
        
        const distance = this.calculateDistance(
          job.latitude,
          job.longitude,
          otherJob.latitude,
          otherJob.longitude
        );
        
        if (distance <= radiusMiles) {
          cluster.push(otherJob);
          processed.add(otherJob.id);
        }
      });
      
      clusters.push(cluster);
    });
    
    return clusters;
  }
  
  // Find jobs within radius
  findJobsNearby(
    centerLat: number,
    centerLng: number,
    jobs: JobRecord[],
    radiusMiles: number
  ): JobRecord[] {
    return jobs.filter(job => {
      const distance = this.calculateDistance(
        centerLat,
        centerLng,
        job.latitude,
        job.longitude
      );
      return distance <= radiusMiles;
    });
  }
  
  // Get recommended route with directions
  getRouteDirections(jobs: JobRecord[]): Array<{
    from: string;
    to: string;
    distance: number;
    duration: number;
    instruction: string;
  }> {
    if (jobs.length < 2) return [];
    
      const directions: Array<{
        from: string;
        to: string;
        distance: number;
        duration: number;
        instruction: string;
      }> = [];
    
    for (let i = 0; i < jobs.length - 1; i++) {
      const current = jobs[i];
      const next = jobs[i + 1];
      
      const distance = this.calculateDistance(
        current.latitude,
        current.longitude,
        next.latitude,
        next.longitude
      );
      
      const duration = this.estimateTravelTime(distance);
      
      directions.push({
        from: current.address || 'Unknown',
        to: next.address || 'Unknown',
        distance: parseFloat(distance.toFixed(1)),
        duration,
        instruction: `Drive ${distance.toFixed(1)} miles (${duration} min) from ${current.address || 'location'} to ${next.address || 'next location'}`
      });
    }
    
    return directions;
  }
  
  // Calculate daily efficiency score
  calculateEfficiencyScore(
    jobs: JobRecord[],
    actualRoute?: JobRecord[]
  ): {
    score: number; // 0-100
    rating: 'excellent' | 'good' | 'fair' | 'poor';
    factors: {
      routeOptimization: number;
      timeUtilization: number;
      areaConcentration: number;
    };
  } {
    const optimized = this.optimizeRoute(jobs);
    const actualDistance = actualRoute 
      ? this.calculateSequentialDistance(actualRoute)
      : optimized.totalDistance;
    
    // Route optimization (how close to optimal)
    const routeScore = Math.max(0, 100 - ((actualDistance - optimized.totalDistance) / optimized.totalDistance) * 100);
    
    // Time utilization (job time vs travel time)
    const jobTime = jobs.reduce((sum, j) => sum + ((j.duration_hours || j.estimated_hours || 0) * 60), 0);
    const timeScore = (jobTime / (jobTime + optimized.totalDuration)) * 100;
    
    // Area concentration (jobs within same area)
    const clusters = this.groupJobsByArea(jobs, 3);
    const areaScore = (1 - (clusters.length / jobs.length)) * 100;
    
    const overallScore = (routeScore + timeScore + areaScore) / 3;
    
    let rating: 'excellent' | 'good' | 'fair' | 'poor';
    if (overallScore >= 85) rating = 'excellent';
    else if (overallScore >= 70) rating = 'good';
    else if (overallScore >= 50) rating = 'fair';
    else rating = 'poor';
    
    return {
      score: Math.round(overallScore),
      rating,
      factors: {
        routeOptimization: Math.round(routeScore),
        timeUtilization: Math.round(timeScore),
        areaConcentration: Math.round(areaScore)
      }
    };
  }
}

// Singleton instance
export const routeOptimizationService = new RouteOptimizationService();

