import { createContext, useContext, useState, ReactNode } from "react";

interface WearableContextType {
  wearable_id: number;
  setWearable_id: (id: number) => void;
}

export const WearableContext = createContext<WearableContextType | undefined>(undefined);

export const WearableProvider = ({ children }: { children: ReactNode }) => {
  const [wearable_id, setWearable_id] = useState<number>(-1); // Initialize to -1 wearable_id which does not exist

  return (
    <WearableContext.Provider value={{ wearable_id, setWearable_id }}>
      {children}
    </WearableContext.Provider>
  );
};

// Custom hook to use the context, use this in components to set and get the wearable_id
export const useWearable = (): WearableContextType => {
  const context = useContext(WearableContext);
  if (!context) {
    throw new Error("useWearable context error");
  }

  return context;
};