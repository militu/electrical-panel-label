// src/app/types/Icon.ts

export type IconName =
  | "air-conditioner"
  | "boiler"
  | "car-charger"
  | "circuit-breaker"
  | "differential-switch"
  | "dishwasher"
  | "doorbell"
  | "dryer"
  | "freezer"
  | "fridge"
  | "hood"
  | "impulse-relay"
  | "intercom"
  | "lighting"
  | "lightning-protection"
  | "microwave"
  | "modular-switch"
  | "off-peak-contactor"
  | "oven"
  | "radiator"
  | "shutters"
  | "socket-plug"
  | "stove"
  | "ventilation"
  | "washing-machine"
  | "water-heater";

export interface Icon {
  value: IconName;
  label: string;
  isCustom?: boolean;
}

export const builtInIcons: Icon[] = [
  { value: "air-conditioner", label: "Air conditioner" },
  { value: "boiler", label: "Boiler" },
  { value: "car-charger", label: "Car charger" },
  { value: "circuit-breaker", label: "Circuit breaker" },
  { value: "differential-switch", label: "Differential switch" },
  { value: "dishwasher", label: "Dishwasher" },
  { value: "doorbell", label: "Doorbell" },
  { value: "dryer", label: "Dryer" },
  { value: "freezer", label: "Freezer" },
  { value: "fridge", label: "Fridge" },
  { value: "hood", label: "Hood" },
  { value: "impulse-relay", label: "Impulse relay" },
  { value: "intercom", label: "Intercom" },
  { value: "lighting", label: "Lighting" },
  { value: "lightning-protection", label: "Lightning protection" },
  { value: "microwave", label: "Microwave" },
  { value: "modular-switch", label: "Modular switch" },
  { value: "off-peak-contactor", label: "Off-peak contactor" },
  { value: "oven", label: "Oven" },
  { value: "radiator", label: "Radiator" },
  { value: "shutters", label: "Shutters" },
  { value: "socket-plug", label: "Power socket" },
  { value: "stove", label: "Stove" },
  { value: "ventilation", label: "Ventilation" },
  { value: "washing-machine", label: "Washing machine" },
  { value: "water-heater", label: "Water heater" },
] as const;
