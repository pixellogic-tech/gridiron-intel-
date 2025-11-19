
export interface PlayerStat {
    name: string;
    value: string | number;
    trend?: string;
}
export interface RadarDataPoint {
    subject: string;
    value: number;
    avg: number;
    fullMark: number;
}
export interface Player {
    id: number;
    name: string;
    position: string;
    avatar: string;
    photoUrl?: string;
    stats: PlayerStat[];
    radarData: RadarDataPoint[];
    mainMetricName: string;
    status: 'Active' | 'Injured' | 'Benched';
    coachsNotes?: string;
    jerseyNumber?: string;
    parentGuardianName?: string;
    phoneNumber?: string;
    gpa?: number;
}

export const mockPlayers: Player[] = [
    { id: 1, name: 'J. Williams', position: 'QB', avatar: 'JW', mainMetricName: 'Completion %', status: 'Active',
      photoUrl: 'https://images.unsplash.com/photo-1552072805-2a9039d00e57?q=80&w=1887&auto=format&fit=crop',
      jerseyNumber: '12', parentGuardianName: 'Sarah Williams', phoneNumber: '555-123-4567', gpa: 3.8,
      stats: [{ name: 'Completion %', value: '72%', trend: '+4%' }, { name: 'Passer Rating', value: 108.5 }, { name: 'Passing TDs', value: 18 }],
      radarData: [
        { subject: 'Pass Yards', value: 85, avg: 70, fullMark: 100 },
        { subject: 'Completion %', value: 72, avg: 65, fullMark: 100 },
        { subject: 'TDs', value: 90, avg: 60, fullMark: 100 },
        { subject: 'Rating', value: 80, avg: 75, fullMark: 100 },
        { subject: 'Decision Making', value: 75, avg: 65, fullMark: 100 },
      ],
      coachsNotes: "Excellent pocket presence, but needs to work on looking off the safety. His deep ball accuracy has improved significantly. Key leader for the offense."
    },
    { id: 2, name: 'M. Davis', position: 'WR', avatar: 'MD', mainMetricName: 'Yards After Catch', status: 'Active',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop',
      jerseyNumber: '88', parentGuardianName: 'Michael Davis Sr.', phoneNumber: '555-987-6543', gpa: 3.5,
      stats: [{ name: 'Receptions', value: 45 }, { name: 'YAC', value: '8.2 avg' }, { name: 'Receiving TDs', value: 7 }],
      radarData: [
        { subject: 'Routes', value: 90, avg: 75, fullMark: 100 },
        { subject: 'Hands', value: 95, avg: 80, fullMark: 100 },
        { subject: 'YAC', value: 82, avg: 70, fullMark: 100 },
        { subject: 'Blocking', value: 65, avg: 60, fullMark: 100 },
        { subject: 'Separation', value: 88, avg: 75, fullMark: 100 },
      ]
    },
    { id: 3, name: 'T. Rodriguez', position: 'MLB', avatar: 'TR', mainMetricName: 'Tackle Success Rate', status: 'Injured',
      jerseyNumber: '54', parentGuardianName: 'Maria Rodriguez', phoneNumber: '555-555-5555', gpa: 3.9,
      stats: [{ name: 'Tackles', value: 88 }, { name: 'Tackle Success %', value: '92%', trend: '+2%' }, { name: 'Sacks', value: 4 }],
      radarData: [
        { subject: 'Tackling', value: 92, avg: 80, fullMark: 100 },
        { subject: 'Play Recognition', value: 88, avg: 75, fullMark: 100 },
        { subject: 'Coverage', value: 70, avg: 65, fullMark: 100 },
        { subject: 'Pass Rush', value: 75, avg: 60, fullMark: 100 },
        { subject: 'Instincts', value: 90, avg: 80, fullMark: 100 },
      ],
      coachsNotes: "Out for 2 weeks with an ankle sprain. His play recognition is top-tier, but he can over-pursue on outside runs. Rehab is progressing well."
    },
];

export interface PlayerMarker {
    id: string;
    type: 'offense' | 'defense';
    label: string;
    x: number; // percentage
    y: number; // percentage
}
export interface PlayerPath {
    markerId: string;
    points: { x: number; y: number }[];
}
export interface Play {
  id: number;
  name: string;
  type: 'Offense' | 'Defense';
  subType: string; 
  formation: string;
  description: string;
  formationMarkers: PlayerMarker[];
  paths: PlayerPath[];
}

export const mockPlays: Play[] = [
    {
        id: 1, name: 'Flood Concept', type: 'Offense', subType: 'Pass', formation: 'Spread',
        description: 'Floods one side with 3 routes at different depths to stress zone coverage.',
        formationMarkers: [
            { id: 'lt1', type: 'offense', label: 'LT', x: 35, y: 78 },
            { id: 'lg1', type: 'offense', label: 'LG', x: 42, y: 78 },
            { id: 'c1', type: 'offense', label: 'C', x: 50, y: 78 },
            { id: 'rg1', type: 'offense', label: 'RG', x: 58, y: 78 },
            { id: 'rt1', type: 'offense', label: 'RT', x: 65, y: 78 },
            { id: 'qb1', type: 'offense', label: 'QB', x: 50, y: 85 },
            { id: 'wr1', type: 'offense', label: 'WR', x: 15, y: 75 },
        ],
        paths: [
            { markerId: 'wr1', points: [{x: 15, y: 75}, {x: 15, y: 40}, {x: 35, y: 20}] },
        ]
    },
    {
        id: 2, name: 'HB Dive', type: 'Offense', subType: 'Run', formation: 'I-Form',
        description: 'A direct handoff to the halfback running through an interior gap.',
        formationMarkers: [
            { id: 'c2', type: 'offense', label: 'C', x: 50, y: 78 },
            { id: 'qb2', type: 'offense', label: 'QB', x: 50, y: 82 },
            { id: 'rb2', type: 'offense', label: 'RB', x: 50, y: 90 },
        ],
        paths: [
            { markerId: 'rb2', points: [{x: 50, y: 90}, {x: 54, y: 70}] },
        ],
    },
    {
        id: 3, name: 'Cover 3 Buzz', type: 'Defense', subType: 'Zone', formation: '4-3',
        description: 'Zone defense with 3 deep defenders and a safety rotating down to cover short passes.',
        formationMarkers: [
            { id: 's1', type: 'defense', label: 'S', x: 50, y: 20 },
            { id: 's2', type: 'defense', label: 'S', x: 25, y: 35 },
        ],
        paths: [
            { markerId: 's2', points: [{x: 25, y: 35}, {x: 30, y: 50}] }
        ]
    }
];

export interface TeamIntel {
  id: number;
  teamName: string;
  philosophy: string;
  offensiveTendencies: string;
  defensiveTendencies: string;
  keyPlayers: string;
}

export const mockTeamIntel: TeamIntel[] = [
    {
        id: 1,
        teamName: "Northwood Panthers",
        philosophy: "Air Raid offense, aggressive 4-2-5 defense that brings pressure.",
        offensiveTendencies: "Run RPOs on 1st down. QB #7 always rolls right under pressure. Heavily favors 'Slant' and 'Go' routes.",
        defensiveTendencies: "Base Cover 3, but brings a corner blitz on 3rd and long. Weak against TE seam routes. CB #21 is susceptible to double moves.",
        keyPlayers: "#7 QB - Mobile, but locks onto primary target.\n#55 DE - Elite pass rusher, but struggles against screen plays."
    },
    {
        id: 2,
        teamName: "Central High Tigers",
        philosophy: "Power-I formation, run-heavy offense. Bend-don't-break Cover 2 defense.",
        offensiveTendencies: "Relies on 'HB Dive' and 'Power O'. Very predictable on 3rd and short.",
        defensiveTendencies: "Soft corners, gives up underneath throws. Susceptible to play-action.",
        keyPlayers: "#32 RB - Powerful but lacks breakaway speed.\n#50 MLB - High tackle count, but slow in coverage."
    }
];

export interface Drill {
  id: number;
  name: string;
  type: 'Offense' | 'Defense' | 'Special Teams';
  description: string;
}

export const mockDrills: Drill[] = [
  { id: 1, name: "Pat & Go", type: "Offense", description: "QB and WRs practice timing on quick release throws." },
  { id: 2, name: "Oklahoma Drill", type: "Defense", description: "Full-contact tackling drill in a confined space to promote aggression and proper form." },
  { id: 3, name: "Star Drill", type: "Defense", description: "A tackling circuit that forces defenders to change direction and pursue the ball carrier." },
  { id: 4, name: "Punt Coverage Lanes", type: "Special Teams", description: "Players practice staying in their assigned lanes during punt coverage." },
  { id: 5, name: "Trench Warfare", type: "Offense", description: "1-on-1 pass rush/protection drills for offensive and defensive linemen." },
  { id: 6, name: 'Route Tree Mastery', type: 'Offense', description: 'WRs and DBs practice specific route breaks and defensive trail technique.' }
];