// Multi-temporal metrics model for 1 Day, 7 Days, 15 Days, and 30 Days

export type TimeRangeKey = "1 Day" | "7 Days" | "15 Days" | "30 Days";

export interface ZoneData {
  intakeData: { day: string; tonnage: number; trips: number }[];
  fleetSegments: { label: string; percentage: number; color: string }[];
  centerFleetLabel: string;
  centerFleetSublabel: string;
  modalitySegments: { label: string; percentage: number; color: string }[];
  centerModalityLabel: string;
  centerModalitySublabel: string;
  yieldData: { type: string; tons: number; widthPct: number; color: string }[];
  accumulationSteps: { time: string; intakeTons: number }[];
}

export interface RangeMetrics {
  grossIntakeKg: string;
  grossIntakeSubtext: string;
  grossIntakeSubtextColor: string;
  fleetTrips: string;
  fleetTripsSubtext: string;
  dominantFleet: string;
  dominantFleetPct: number;
  dominantFleetSubtext: string;
  dominantFleetValueClass: string;
  operationalZones: string;
  operationalZonesSubtext: string;
  
  // Per zone specific data
  zones: {
    [zoneName: string]: ZoneData;
  };
}

export const DASHBOARD_TIME_RANGES: Record<TimeRangeKey, RangeMetrics> = {
  "1 Day": {
    grossIntakeKg: "19,420 KG",
    grossIntakeSubtext: "↗ +4.2% vs yesterday",
    grossIntakeSubtextColor: "text-emerald-700",
    fleetTrips: "26 Trips",
    fleetTripsSubtext: "24 cleared • 2 in-transit",
    dominantFleet: "Compactors",
    dominantFleetPct: 62,
    dominantFleetSubtext: "62% total bulk weight",
    dominantFleetValueClass: "text-[#ea580c]",
    operationalZones: "4 / 4",
    operationalZonesSubtext: "Peelamedu, Compost, Sath...",
    zones: {
      "Peelamedu": {
        intakeData: [
          { day: "06:00", tonnage: 45, trips: 3 },
          { day: "09:00", tonnage: 95, trips: 6 },
          { day: "12:00", tonnage: 140, trips: 8 },
          { day: "15:00", tonnage: 110, trips: 6 },
          { day: "18:00", tonnage: 85, trips: 5 },
          { day: "21:00", tonnage: 35, trips: 2 },
          { day: "23:59", tonnage: 15, trips: 1 },
        ],
        fleetSegments: [
          { label: "CIWMCPL", percentage: 56, color: "#064e3b" },
          { label: "CMC Fleet", percentage: 28, color: "#0284c7" },
          { label: "Private Cont.", percentage: 16, color: "#10b981" }
        ],
        centerFleetLabel: "56%",
        centerFleetSublabel: "CIWMCPL",
        modalitySegments: [
          { label: "Compactor", percentage: 64, color: "#ea580c" },
          { label: "LCV", percentage: 14, color: "#0284c7" },
          { label: "Tipper", percentage: 22, color: "#e11d48" }
        ],
        centerModalityLabel: "64%",
        centerModalitySublabel: "COMPACTOR",
        yieldData: [
          { type: "Wet Waste", tons: 85, widthPct: 65, color: "#4338ca" },
          { type: "Dry Waste", tons: 65, widthPct: 50, color: "#e11d48" },
          { type: "Mixed", tons: 25, widthPct: 22, color: "#0d9488" }
        ],
        accumulationSteps: [
          { time: "06:00", intakeTons: 12 },
          { time: "09:00", intakeTons: 38 },
          { time: "12:00", intakeTons: 72 },
          { time: "15:00", intakeTons: 98 },
          { time: "18:00", intakeTons: 118 },
          { time: "21:00", intakeTons: 132 },
          { time: "23:59", intakeTons: 140 }
        ]
      },
      "Compost Plant": {
        intakeData: [
          { day: "06:00", tonnage: 35, trips: 2 },
          { day: "09:00", tonnage: 75, trips: 5 },
          { day: "12:00", tonnage: 115, trips: 7 },
          { day: "15:00", tonnage: 90, trips: 5 },
          { day: "18:00", tonnage: 65, trips: 4 },
          { day: "21:00", tonnage: 28, trips: 2 },
          { day: "23:59", tonnage: 12, trips: 1 },
        ],
        fleetSegments: [
          { label: "CIWMCPL", percentage: 48, color: "#064e3b" },
          { label: "CMC Fleet", percentage: 34, color: "#0284c7" },
          { label: "Private Cont.", percentage: 18, color: "#10b981" }
        ],
        centerFleetLabel: "48%",
        centerFleetSublabel: "CIWMCPL",
        modalitySegments: [
          { label: "Compactor", percentage: 42, color: "#ea580c" },
          { label: "LCV", percentage: 22, color: "#0284c7" },
          { label: "Tipper", percentage: 36, color: "#e11d48" }
        ],
        centerModalityLabel: "42%",
        centerModalitySublabel: "COMPACTOR",
        yieldData: [
          { type: "Wet Waste", tons: 92, widthPct: 72, color: "#4338ca" },
          { type: "Dry Waste", tons: 45, widthPct: 35, color: "#e11d48" },
          { type: "Mixed", tons: 18, widthPct: 15, color: "#0d9488" }
        ],
        accumulationSteps: [
          { time: "06:00", intakeTons: 10 },
          { time: "09:00", intakeTons: 32 },
          { time: "12:00", intakeTons: 64 },
          { time: "15:00", intakeTons: 88 },
          { time: "18:00", intakeTons: 106 },
          { time: "21:00", intakeTons: 120 },
          { time: "23:59", intakeTons: 128 }
        ]
      },
      "Sathy Road": {
        intakeData: [
          { day: "06:00", tonnage: 28, trips: 2 },
          { day: "09:00", tonnage: 62, trips: 4 },
          { day: "12:00", tonnage: 98, trips: 6 },
          { day: "15:00", tonnage: 82, trips: 5 },
          { day: "18:00", tonnage: 54, trips: 3 },
          { day: "21:00", tonnage: 22, trips: 1 },
          { day: "23:59", tonnage: 8, trips: 1 },
        ],
        fleetSegments: [
          { label: "CIWMCPL", percentage: 52, color: "#064e3b" },
          { label: "CMC Fleet", percentage: 30, color: "#0284c7" },
          { label: "Private Cont.", percentage: 18, color: "#10b981" }
        ],
        centerFleetLabel: "52%",
        centerFleetSublabel: "CIWMCPL",
        modalitySegments: [
          { label: "Compactor", percentage: 55, color: "#ea580c" },
          { label: "LCV", percentage: 18, color: "#0284c7" },
          { label: "Tipper", percentage: 27, color: "#e11d48" }
        ],
        centerModalityLabel: "55%",
        centerModalitySublabel: "COMPACTOR",
        yieldData: [
          { type: "Wet Waste", tons: 70, widthPct: 55, color: "#4338ca" },
          { type: "Dry Waste", tons: 58, widthPct: 45, color: "#e11d48" },
          { type: "Mixed", tons: 20, widthPct: 18, color: "#0d9488" }
        ],
        accumulationSteps: [
          { time: "06:00", intakeTons: 8 },
          { time: "09:00", intakeTons: 25 },
          { time: "12:00", intakeTons: 52 },
          { time: "15:00", intakeTons: 74 },
          { time: "18:00", intakeTons: 92 },
          { time: "21:00", intakeTons: 104 },
          { time: "23:59", intakeTons: 110 }
        ]
      },
      "Ukkadam": {
        intakeData: [
          { day: "06:00", tonnage: 22, trips: 2 },
          { day: "09:00", tonnage: 48, trips: 3 },
          { day: "12:00", tonnage: 80, trips: 5 },
          { day: "15:00", tonnage: 65, trips: 4 },
          { day: "18:00", tonnage: 42, trips: 3 },
          { day: "21:00", tonnage: 18, trips: 1 },
          { day: "23:59", tonnage: 6, trips: 1 },
        ],
        fleetSegments: [
          { label: "CIWMCPL", percentage: 44, color: "#064e3b" },
          { label: "CMC Fleet", percentage: 38, color: "#0284c7" },
          { label: "Private Cont.", percentage: 18, color: "#10b981" }
        ],
        centerFleetLabel: "44%",
        centerFleetSublabel: "CIWMCPL",
        modalitySegments: [
          { label: "Compactor", percentage: 58, color: "#ea580c" },
          { label: "LCV", percentage: 16, color: "#0284c7" },
          { label: "Tipper", percentage: 26, color: "#e11d48" }
        ],
        centerModalityLabel: "58%",
        centerModalitySublabel: "COMPACTOR",
        yieldData: [
          { type: "Wet Waste", tons: 60, widthPct: 48, color: "#4338ca" },
          { type: "Dry Waste", tons: 50, widthPct: 40, color: "#e11d48" },
          { type: "Mixed", tons: 22, widthPct: 20, color: "#0d9488" }
        ],
        accumulationSteps: [
          { time: "06:00", intakeTons: 6 },
          { time: "09:00", intakeTons: 20 },
          { time: "12:00", intakeTons: 44 },
          { time: "15:00", intakeTons: 62 },
          { time: "18:00", intakeTons: 78 },
          { time: "21:00", intakeTons: 88 },
          { time: "23:59", intakeTons: 94 }
        ]
      }
    }
  },

  "7 Days": {
    grossIntakeKg: "132,600 KG",
    grossIntakeSubtext: "↗ +8.0% vs prev. week",
    grossIntakeSubtextColor: "text-emerald-700",
    fleetTrips: "178 Trips",
    fleetTripsSubtext: "166 cleared • 12 in-transit",
    dominantFleet: "Compactors",
    dominantFleetPct: 54,
    dominantFleetSubtext: "54% total bulk weight",
    dominantFleetValueClass: "text-[#ea580c]",
    operationalZones: "4 / 4",
    operationalZonesSubtext: "Peelamedu, Compost, Sath...",
    zones: {
      "Peelamedu": {
        intakeData: [
          { day: "Aug 28", tonnage: 525, trips: 28 },
          { day: "Aug 29", tonnage: 545, trips: 31 },
          { day: "Aug 30", tonnage: 505, trips: 27 },
          { day: "Aug 31", tonnage: 590, trips: 33 },
          { day: "Sep 01", tonnage: 550, trips: 30 },
          { day: "Sep 02", tonnage: 675, trips: 37 },
          { day: "Sep 03", tonnage: 635, trips: 35 },
        ],
        fleetSegments: [
          { label: "CIWMCPL", percentage: 50, color: "#064e3b" },
          { label: "CMC Fleet", percentage: 31, color: "#0284c7" },
          { label: "Private Cont.", percentage: 19, color: "#10b981" }
        ],
        centerFleetLabel: "50%",
        centerFleetSublabel: "CIWMCPL",
        modalitySegments: [
          { label: "Compactor", percentage: 54, color: "#ea580c" },
          { label: "LCV", percentage: 18, color: "#0284c7" },
          { label: "Tipper", percentage: 28, color: "#e11d48" }
        ],
        centerModalityLabel: "54%",
        centerModalitySublabel: "COMPACTOR",
        yieldData: [
          { type: "Wet Waste", tons: 85, widthPct: 65, color: "#4338ca" },
          { type: "Dry Waste", tons: 65, widthPct: 50, color: "#e11d48" },
          { type: "Mixed", tons: 25, widthPct: 22, color: "#0d9488" }
        ],
        accumulationSteps: [
          { time: "06:00", intakeTons: 18 },
          { time: "09:00", intakeTons: 48 },
          { time: "12:00", intakeTons: 82 },
          { time: "15:00", intakeTons: 104 },
          { time: "18:00", intakeTons: 126 },
          { time: "21:00", intakeTons: 138 },
          { time: "23:59", intakeTons: 142 }
        ]
      },
      "Compost Plant": {
        intakeData: [
          { day: "Aug 28", tonnage: 480, trips: 25 },
          { day: "Aug 29", tonnage: 510, trips: 28 },
          { day: "Aug 30", tonnage: 470, trips: 24 },
          { day: "Aug 31", tonnage: 535, trips: 29 },
          { day: "Sep 01", tonnage: 520, trips: 28 },
          { day: "Sep 02", tonnage: 610, trips: 33 },
          { day: "Sep 03", tonnage: 590, trips: 31 },
        ],
        fleetSegments: [
          { label: "CIWMCPL", percentage: 46, color: "#064e3b" },
          { label: "CMC Fleet", percentage: 34, color: "#0284c7" },
          { label: "Private Cont.", percentage: 20, color: "#10b981" }
        ],
        centerFleetLabel: "46%",
        centerFleetSublabel: "CIWMCPL",
        modalitySegments: [
          { label: "Compactor", percentage: 48, color: "#ea580c" },
          { label: "LCV", percentage: 18, color: "#0284c7" },
          { label: "Tipper", percentage: 34, color: "#e11d48" }
        ],
        centerModalityLabel: "48%",
        centerModalitySublabel: "COMPACTOR",
        yieldData: [
          { type: "Wet Waste", tons: 110, widthPct: 82, color: "#4338ca" },
          { type: "Dry Waste", tons: 48, widthPct: 38, color: "#e11d48" },
          { type: "Mixed", tons: 16, widthPct: 14, color: "#0d9488" }
        ],
        accumulationSteps: [
          { time: "06:00", intakeTons: 15 },
          { time: "09:00", intakeTons: 42 },
          { time: "12:00", intakeTons: 74 },
          { time: "15:00", intakeTons: 95 },
          { time: "18:00", intakeTons: 114 },
          { time: "21:00", intakeTons: 126 },
          { time: "23:59", intakeTons: 130 }
        ]
      },
      "Sathy Road": {
        intakeData: [
          { day: "Aug 28", tonnage: 410, trips: 22 },
          { day: "Aug 29", tonnage: 430, trips: 24 },
          { day: "Aug 30", tonnage: 395, trips: 21 },
          { day: "Aug 31", tonnage: 460, trips: 26 },
          { day: "Sep 01", tonnage: 440, trips: 24 },
          { day: "Sep 02", tonnage: 510, trips: 29 },
          { day: "Sep 03", tonnage: 490, trips: 27 },
        ],
        fleetSegments: [
          { label: "CIWMCPL", percentage: 53, color: "#064e3b" },
          { label: "CMC Fleet", percentage: 29, color: "#0284c7" },
          { label: "Private Cont.", percentage: 18, color: "#10b981" }
        ],
        centerFleetLabel: "53%",
        centerFleetSublabel: "CIWMCPL",
        modalitySegments: [
          { label: "Compactor", percentage: 56, color: "#ea580c" },
          { label: "LCV", percentage: 15, color: "#0284c7" },
          { label: "Tipper", percentage: 29, color: "#e11d48" }
        ],
        centerModalityLabel: "56%",
        centerModalitySublabel: "COMPACTOR",
        yieldData: [
          { type: "Wet Waste", tons: 78, widthPct: 60, color: "#4338ca" },
          { type: "Dry Waste", tons: 60, widthPct: 48, color: "#e11d48" },
          { type: "Mixed", tons: 22, widthPct: 20, color: "#0d9488" }
        ],
        accumulationSteps: [
          { time: "06:00", intakeTons: 12 },
          { time: "09:00", intakeTons: 36 },
          { time: "12:00", intakeTons: 64 },
          { time: "15:00", intakeTons: 84 },
          { time: "18:00", intakeTons: 102 },
          { time: "21:00", intakeTons: 114 },
          { time: "23:59", intakeTons: 118 }
        ]
      },
      "Ukkadam": {
        intakeData: [
          { day: "Aug 28", tonnage: 340, trips: 18 },
          { day: "Aug 29", tonnage: 360, trips: 20 },
          { day: "Aug 30", tonnage: 325, trips: 17 },
          { day: "Aug 31", tonnage: 390, trips: 22 },
          { day: "Sep 01", tonnage: 375, trips: 21 },
          { day: "Sep 02", tonnage: 430, trips: 25 },
          { day: "Sep 03", tonnage: 415, trips: 23 },
        ],
        fleetSegments: [
          { label: "CIWMCPL", percentage: 50, color: "#064e3b" },
          { label: "CMC Fleet", percentage: 31, color: "#0284c7" },
          { label: "Private Cont.", percentage: 19, color: "#10b981" }
        ],
        centerFleetLabel: "50%",
        centerFleetSublabel: "CIWMCPL",
        modalitySegments: [
          { label: "Compactor", percentage: 58, color: "#ea580c" },
          { label: "LCV", percentage: 16, color: "#0284c7" },
          { label: "Tipper", percentage: 26, color: "#e11d48" }
        ],
        centerModalityLabel: "58%",
        centerModalitySublabel: "COMPACTOR",
        yieldData: [
          { type: "Wet Waste", tons: 72, widthPct: 56, color: "#4338ca" },
          { type: "Dry Waste", tons: 54, widthPct: 42, color: "#e11d48" },
          { type: "Mixed", tons: 24, widthPct: 20, color: "#0d9488" }
        ],
        accumulationSteps: [
          { time: "06:00", intakeTons: 10 },
          { time: "09:00", intakeTons: 30 },
          { time: "12:00", intakeTons: 54 },
          { time: "15:00", intakeTons: 72 },
          { time: "18:00", intakeTons: 88 },
          { time: "21:00", intakeTons: 98 },
          { time: "23:59", intakeTons: 102 }
        ]
      }
    }
  },

  "15 Days": {
    grossIntakeKg: "284,400 KG",
    grossIntakeSubtext: "↗ +11.4% vs prev. 15d",
    grossIntakeSubtextColor: "text-emerald-700",
    fleetTrips: "372 Trips",
    fleetTripsSubtext: "354 cleared • 18 in-transit",
    dominantFleet: "Compactors",
    dominantFleetPct: 57,
    dominantFleetSubtext: "57% total bulk weight",
    dominantFleetValueClass: "text-[#ea580c]",
    operationalZones: "4 / 4",
    operationalZonesSubtext: "Peelamedu, Compost, Sath...",
    zones: {
      "Peelamedu": {
        intakeData: [
          { day: "Aug 20", tonnage: 490, trips: 26 },
          { day: "Aug 22", tonnage: 520, trips: 29 },
          { day: "Aug 24", tonnage: 510, trips: 28 },
          { day: "Aug 26", tonnage: 560, trips: 32 },
          { day: "Aug 28", tonnage: 535, trips: 30 },
          { day: "Aug 30", tonnage: 620, trips: 35 },
          { day: "Sep 03", tonnage: 650, trips: 37 },
        ],
        fleetSegments: [
          { label: "CIWMCPL", percentage: 54, color: "#064e3b" },
          { label: "CMC Fleet", percentage: 29, color: "#0284c7" },
          { label: "Private Cont.", percentage: 17, color: "#10b981" }
        ],
        centerFleetLabel: "54%",
        centerFleetSublabel: "CIWMCPL",
        modalitySegments: [
          { label: "Compactor", percentage: 57, color: "#ea580c" },
          { label: "LCV", percentage: 17, color: "#0284c7" },
          { label: "Tipper", percentage: 26, color: "#e11d48" }
        ],
        centerModalityLabel: "57%",
        centerModalitySublabel: "COMPACTOR",
        yieldData: [
          { type: "Wet Waste", tons: 168, widthPct: 68, color: "#4338ca" },
          { type: "Dry Waste", tons: 125, widthPct: 52, color: "#e11d48" },
          { type: "Mixed", tons: 48, widthPct: 24, color: "#0d9488" }
        ],
        accumulationSteps: [
          { time: "06:00", intakeTons: 22 },
          { time: "09:00", intakeTons: 58 },
          { time: "12:00", intakeTons: 94 },
          { time: "15:00", intakeTons: 122 },
          { time: "18:00", intakeTons: 144 },
          { time: "21:00", intakeTons: 156 },
          { time: "23:59", intakeTons: 162 }
        ]
      },
      "Compost Plant": {
        intakeData: [
          { day: "Aug 20", tonnage: 440, trips: 24 },
          { day: "Aug 22", tonnage: 470, trips: 26 },
          { day: "Aug 24", tonnage: 460, trips: 25 },
          { day: "Aug 26", tonnage: 510, trips: 29 },
          { day: "Aug 28", tonnage: 490, trips: 27 },
          { day: "Aug 30", tonnage: 560, trips: 32 },
          { day: "Sep 03", tonnage: 590, trips: 34 },
        ],
        fleetSegments: [
          { label: "CIWMCPL", percentage: 49, color: "#064e3b" },
          { label: "CMC Fleet", percentage: 33, color: "#0284c7" },
          { label: "Private Cont.", percentage: 18, color: "#10b981" }
        ],
        centerFleetLabel: "49%",
        centerFleetSublabel: "CIWMCPL",
        modalitySegments: [
          { label: "Compactor", percentage: 51, color: "#ea580c" },
          { label: "LCV", percentage: 19, color: "#0284c7" },
          { label: "Tipper", percentage: 30, color: "#e11d48" }
        ],
        centerModalityLabel: "51%",
        centerModalitySublabel: "COMPACTOR",
        yieldData: [
          { type: "Wet Waste", tons: 195, widthPct: 78, color: "#4338ca" },
          { type: "Dry Waste", tons: 96, widthPct: 40, color: "#e11d48" },
          { type: "Mixed", tons: 35, widthPct: 16, color: "#0d9488" }
        ],
        accumulationSteps: [
          { time: "06:00", intakeTons: 18 },
          { time: "09:00", intakeTons: 50 },
          { time: "12:00", intakeTons: 84 },
          { time: "15:00", intakeTons: 110 },
          { time: "18:00", intakeTons: 130 },
          { time: "21:00", intakeTons: 142 },
          { time: "23:59", intakeTons: 148 }
        ]
      },
      "Sathy Road": {
        intakeData: [
          { day: "Aug 20", tonnage: 380, trips: 21 },
          { day: "Aug 22", tonnage: 405, trips: 23 },
          { day: "Aug 24", tonnage: 390, trips: 22 },
          { day: "Aug 26", tonnage: 440, trips: 25 },
          { day: "Aug 28", tonnage: 420, trips: 24 },
          { day: "Aug 30", tonnage: 480, trips: 28 },
          { day: "Sep 03", tonnage: 510, trips: 30 },
        ],
        fleetSegments: [
          { label: "CIWMCPL", percentage: 55, color: "#064e3b" },
          { label: "CMC Fleet", percentage: 28, color: "#0284c7" },
          { label: "Private Cont.", percentage: 17, color: "#10b981" }
        ],
        centerFleetLabel: "55%",
        centerFleetSublabel: "CIWMCPL",
        modalitySegments: [
          { label: "Compactor", percentage: 58, color: "#ea580c" },
          { label: "LCV", percentage: 15, color: "#0284c7" },
          { label: "Tipper", percentage: 27, color: "#e11d48" }
        ],
        centerModalityLabel: "58%",
        centerModalitySublabel: "COMPACTOR",
        yieldData: [
          { type: "Wet Waste", tons: 152, widthPct: 62, color: "#4338ca" },
          { type: "Dry Waste", tons: 118, widthPct: 50, color: "#e11d48" },
          { type: "Mixed", tons: 42, widthPct: 21, color: "#0d9488" }
        ],
        accumulationSteps: [
          { time: "06:00", intakeTons: 15 },
          { time: "09:00", intakeTons: 42 },
          { time: "12:00", intakeTons: 72 },
          { time: "15:00", intakeTons: 96 },
          { time: "18:00", intakeTons: 118 },
          { time: "21:00", intakeTons: 128 },
          { time: "23:59", intakeTons: 134 }
        ]
      },
      "Ukkadam": {
        intakeData: [
          { day: "Aug 20", tonnage: 310, trips: 17 },
          { day: "Aug 22", tonnage: 335, trips: 19 },
          { day: "Aug 24", tonnage: 320, trips: 18 },
          { day: "Aug 26", tonnage: 370, trips: 21 },
          { day: "Aug 28", tonnage: 350, trips: 20 },
          { day: "Aug 30", tonnage: 410, trips: 24 },
          { day: "Sep 03", tonnage: 430, trips: 25 },
        ],
        fleetSegments: [
          { label: "CIWMCPL", percentage: 48, color: "#064e3b" },
          { label: "CMC Fleet", percentage: 33, color: "#0284c7" },
          { label: "Private Cont.", percentage: 19, color: "#10b981" }
        ],
        centerFleetLabel: "48%",
        centerFleetSublabel: "CIWMCPL",
        modalitySegments: [
          { label: "Compactor", percentage: 61, color: "#ea580c" },
          { label: "LCV", percentage: 14, color: "#0284c7" },
          { label: "Tipper", percentage: 25, color: "#e11d48" }
        ],
        centerModalityLabel: "61%",
        centerModalitySublabel: "COMPACTOR",
        yieldData: [
          { type: "Wet Waste", tons: 138, widthPct: 58, color: "#4338ca" },
          { type: "Dry Waste", tons: 104, widthPct: 45, color: "#e11d48" },
          { type: "Mixed", tons: 40, widthPct: 20, color: "#0d9488" }
        ],
        accumulationSteps: [
          { time: "06:00", intakeTons: 12 },
          { time: "09:00", intakeTons: 36 },
          { time: "12:00", intakeTons: 62 },
          { time: "15:00", intakeTons: 82 },
          { time: "18:00", intakeTons: 100 },
          { time: "21:00", intakeTons: 110 },
          { time: "23:59", intakeTons: 116 }
        ]
      }
    }
  },

  "30 Days": {
    grossIntakeKg: "582,100 KG",
    grossIntakeSubtext: "↗ +14.8% vs prev. month",
    grossIntakeSubtextColor: "text-emerald-700",
    fleetTrips: "764 Trips",
    fleetTripsSubtext: "732 cleared • 32 in-transit",
    dominantFleet: "Compactors",
    dominantFleetPct: 59,
    dominantFleetSubtext: "59% total bulk weight",
    dominantFleetValueClass: "text-[#ea580c]",
    operationalZones: "4 / 4",
    operationalZonesSubtext: "Peelamedu, Compost, Sath...",
    zones: {
      "Peelamedu": {
        intakeData: [
          { day: "Week 1", tonnage: 480, trips: 26 },
          { day: "Week 2", tonnage: 530, trips: 30 },
          { day: "Week 3", tonnage: 585, trips: 33 },
          { day: "Week 4", tonnage: 640, trips: 36 },
          { day: "Sep 01", tonnage: 590, trips: 32 },
          { day: "Sep 02", tonnage: 675, trips: 37 },
          { day: "Sep 03", tonnage: 690, trips: 38 },
        ],
        fleetSegments: [
          { label: "CIWMCPL", percentage: 58, color: "#064e3b" },
          { label: "CMC Fleet", percentage: 27, color: "#0284c7" },
          { label: "Private Cont.", percentage: 15, color: "#10b981" }
        ],
        centerFleetLabel: "58%",
        centerFleetSublabel: "CIWMCPL",
        modalitySegments: [
          { label: "Compactor", percentage: 60, color: "#ea580c" },
          { label: "LCV", percentage: 15, color: "#0284c7" },
          { label: "Tipper", percentage: 25, color: "#e11d48" }
        ],
        centerModalityLabel: "60%",
        centerModalitySublabel: "COMPACTOR",
        yieldData: [
          { type: "Wet Waste", tons: 345, widthPct: 70, color: "#4338ca" },
          { type: "Dry Waste", tons: 255, widthPct: 53, color: "#e11d48" },
          { type: "Mixed", tons: 98, widthPct: 25, color: "#0d9488" }
        ],
        accumulationSteps: [
          { time: "06:00", intakeTons: 25 },
          { time: "09:00", intakeTons: 64 },
          { time: "12:00", intakeTons: 105 },
          { time: "15:00", intakeTons: 135 },
          { time: "18:00", intakeTons: 158 },
          { time: "21:00", intakeTons: 170 },
          { time: "23:59", intakeTons: 178 }
        ]
      },
      "Compost Plant": {
        intakeData: [
          { day: "Week 1", tonnage: 430, trips: 23 },
          { day: "Week 2", tonnage: 480, trips: 27 },
          { day: "Week 3", tonnage: 535, trips: 30 },
          { day: "Week 4", tonnage: 580, trips: 33 },
          { day: "Sep 01", tonnage: 540, trips: 29 },
          { day: "Sep 02", tonnage: 620, trips: 34 },
          { day: "Sep 03", tonnage: 635, trips: 35 },
        ],
        fleetSegments: [
          { label: "CIWMCPL", percentage: 51, color: "#064e3b" },
          { label: "CMC Fleet", percentage: 32, color: "#0284c7" },
          { label: "Private Cont.", percentage: 17, color: "#10b981" }
        ],
        centerFleetLabel: "51%",
        centerFleetSublabel: "CIWMCPL",
        modalitySegments: [
          { label: "Compactor", percentage: 53, color: "#ea580c" },
          { label: "LCV", percentage: 17, color: "#0284c7" },
          { label: "Tipper", percentage: 30, color: "#e11d48" }
        ],
        centerModalityLabel: "53%",
        centerModalitySublabel: "COMPACTOR",
        yieldData: [
          { type: "Wet Waste", tons: 410, widthPct: 80, color: "#4338ca" },
          { type: "Dry Waste", tons: 198, widthPct: 42, color: "#e11d48" },
          { type: "Mixed", tons: 72, widthPct: 17, color: "#0d9488" }
        ],
        accumulationSteps: [
          { time: "06:00", intakeTons: 20 },
          { time: "09:00", intakeTons: 56 },
          { time: "12:00", intakeTons: 92 },
          { time: "15:00", intakeTons: 120 },
          { time: "18:00", intakeTons: 142 },
          { time: "21:00", intakeTons: 154 },
          { time: "23:59", intakeTons: 160 }
        ]
      },
      "Sathy Road": {
        intakeData: [
          { day: "Week 1", tonnage: 370, trips: 20 },
          { day: "Week 2", tonnage: 415, trips: 23 },
          { day: "Week 3", tonnage: 460, trips: 26 },
          { day: "Week 4", tonnage: 505, trips: 28 },
          { day: "Sep 01", tonnage: 470, trips: 25 },
          { day: "Sep 02", tonnage: 535, trips: 30 },
          { day: "Sep 03", tonnage: 550, trips: 31 },
        ],
        fleetSegments: [
          { label: "CIWMCPL", percentage: 57, color: "#064e3b" },
          { label: "CMC Fleet", percentage: 27, color: "#0284c7" },
          { label: "Private Cont.", percentage: 16, color: "#10b981" }
        ],
        centerFleetLabel: "57%",
        centerFleetSublabel: "CIWMCPL",
        modalitySegments: [
          { label: "Compactor", percentage: 61, color: "#ea580c" },
          { label: "LCV", percentage: 14, color: "#0284c7" },
          { label: "Tipper", percentage: 25, color: "#e11d48" }
        ],
        centerModalityLabel: "61%",
        centerModalitySublabel: "COMPACTOR",
        yieldData: [
          { type: "Wet Waste", tons: 310, widthPct: 64, color: "#4338ca" },
          { type: "Dry Waste", tons: 240, widthPct: 52, color: "#e11d48" },
          { type: "Mixed", tons: 85, widthPct: 22, color: "#0d9488" }
        ],
        accumulationSteps: [
          { time: "06:00", intakeTons: 18 },
          { time: "09:00", intakeTons: 48 },
          { time: "12:00", intakeTons: 80 },
          { time: "15:00", intakeTons: 106 },
          { time: "18:00", intakeTons: 128 },
          { time: "21:00", intakeTons: 138 },
          { time: "23:59", intakeTons: 144 }
        ]
      },
      "Ukkadam": {
        intakeData: [
          { day: "Week 1", tonnage: 300, trips: 16 },
          { day: "Week 2", tonnage: 340, trips: 19 },
          { day: "Week 3", tonnage: 385, trips: 22 },
          { day: "Week 4", tonnage: 420, trips: 24 },
          { day: "Sep 01", tonnage: 395, trips: 21 },
          { day: "Sep 02", tonnage: 455, trips: 26 },
          { day: "Sep 03", tonnage: 470, trips: 27 },
        ],
        fleetSegments: [
          { label: "CIWMCPL", percentage: 46, color: "#064e3b" },
          { label: "CMC Fleet", percentage: 35, color: "#0284c7" },
          { label: "Private Cont.", percentage: 19, color: "#10b981" }
        ],
        centerFleetLabel: "46%",
        centerFleetSublabel: "CIWMCPL",
        modalitySegments: [
          { label: "Compactor", percentage: 63, color: "#ea580c" },
          { label: "LCV", percentage: 13, color: "#0284c7" },
          { label: "Tipper", percentage: 24, color: "#e11d48" }
        ],
        centerModalityLabel: "63%",
        centerModalitySublabel: "COMPACTOR",
        yieldData: [
          { type: "Wet Waste", tons: 285, widthPct: 60, color: "#4338ca" },
          { type: "Dry Waste", tons: 215, widthPct: 47, color: "#e11d48" },
          { type: "Mixed", tons: 82, widthPct: 21, color: "#0d9488" }
        ],
        accumulationSteps: [
          { time: "06:00", intakeTons: 14 },
          { time: "09:00", intakeTons: 40 },
          { time: "12:00", intakeTons: 68 },
          { time: "15:00", intakeTons: 90 },
          { time: "18:00", intakeTons: 110 },
          { time: "21:00", intakeTons: 120 },
          { time: "23:59", intakeTons: 126 }
        ]
      }
    }
  }
};
