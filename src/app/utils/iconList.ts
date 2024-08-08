export const iconList = [
    {value: "air-conditioner"},
    {value: "boiler"},
    {value: "car-charger"},
    {value: "circuit-breaker"},
    {value: "differential-switch"},
    {value: "dishwasher"},
    {value: "doorbell"},
    {value: "dryer"},
    {value: "freezer"},
    {value: "fridge"},
    {value: "hood"},
    {value: "impulse-relay"},
    {value: "intercom"},
    {value: "lighting"},
    {value: "microwave"},
    {value: "off-peak-contactor"},
    {value: "oven"},
    {value: "radiator"},
    {value: "shutters"},
    {value: "socket-plug"},
    {value: "stove"},
    {value: "ventilation"},
    {value: "washing-machine"},
    {value: "water-heater"}
    // Add more icons as needed
] as const;

export type IconName = typeof iconList[number]['value'];