import type { CityGrade } from './cityRating';
import { gradeIndex } from './cityRating';

export type MetricsSnapshot = {
  pollution: number;
  power: number;
  powerDemand: number;
  green: number;
  gradeScore: number;
  emissionRatio: number;
};

export type MetricsSeries = {
  pollution: number[];
  power: number[];
  powerDemand: number[];
  green: number[];
  gradeScore: number[];
  emissionRatio: number[];
};

const MAX_POINTS = 56;

export function gradeToScore(g: CityGrade): number {
  return gradeIndex(g) * 25;
}

export class MetricsHistory {
  private pollution: number[] = [];
  private power: number[] = [];
  private powerDemand: number[] = [];
  private green: number[] = [];
  private gradeScore: number[] = [];
  private emissionRatio: number[] = [];
  private tickCount = 0;

  record(s: MetricsSnapshot) {
    this.tickCount += 1;
    if (this.tickCount % 2 !== 0) return;

    this.push(this.pollution, s.pollution);
    this.push(this.power, s.power);
    this.push(this.powerDemand, s.powerDemand);
    this.push(this.green, s.green);
    this.push(this.gradeScore, s.gradeScore);
    this.push(this.emissionRatio, s.emissionRatio);
  }

  private push(arr: number[], v: number) {
    arr.push(Math.round(v * 10) / 10);
    if (arr.length > MAX_POINTS) arr.shift();
  }

  getSeries(): MetricsSeries {
    return {
      pollution: [...this.pollution],
      power: [...this.power],
      powerDemand: [...this.powerDemand],
      green: [...this.green],
      gradeScore: [...this.gradeScore],
      emissionRatio: [...this.emissionRatio],
    };
  }

  getGreenTransitionTrend(): 'rising' | 'stable' | 'declining' {
    const g = this.green;
    if (g.length < 4) return 'stable';
    const recent = g.slice(-6);
    const early = g.slice(0, Math.min(6, g.length));
    const rAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const eAvg = early.reduce((a, b) => a + b, 0) / early.length;
    if (rAvg > eAvg + 3) return 'rising';
    if (rAvg < eAvg - 3) return 'declining';
    return 'stable';
  }

  getPollutionTrend(): 'improving' | 'worsening' | 'stable' {
    const p = this.pollution;
    if (p.length < 4) return 'stable';
    const recent = p.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const early = p.slice(0, 5).reduce((a, b) => a + b, 0) / Math.min(5, p.length);
    if (recent < early - 5) return 'improving';
    if (recent > early + 5) return 'worsening';
    return 'stable';
  }
}
